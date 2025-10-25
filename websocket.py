from fastapi import WebSocket, FastAPI, WebSocketDisconnect
from broadcaster import Broadcast
from contextlib import asynccontextmanager
import redis.asyncio as redis
import json
import asyncio

ROLE_LIST = [
    "owner",
    "moderator",
    "member",
    "guest"
]
MODERATOR_EVENTS = [
    "user_muted",
    "user_kicked",
    "user_camera_off",
    "role_changed",
    "user_invited",
    "user_banned",
    "message_deleted"
]
EVENTS_LIST = [
    "user_joined",
    "user_left",
    "hand_raised",
    "hand_lowered",
    "user_media_updated"
]
SYSTEM_EVENTS = [
    "ping",
    "error",
    "room_state_sync"
]
ROLE_PERMISSIONS = {
    "owner": ["all"],
    "moderator":["mute", "kick", "change_role"],
    "member":["speak", "send_message", "raise_hand"],
    "guest":["listen", "read", "view"]
}
redisClient = None
connections = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redisClient
    redisClient = redis.Redis(host="localhost", port=6379, decode_responses=True)
    print("Redis connected")

    yield

    if redisClient:
        await redisClient.close()
    print("Redis disconnected")

app = FastAPI(lifespan=lifespan)

class ConnectionManager:
    def __init__(self):
        self.connections = {}
        self.userRoles = {}     #{room_id: {user_id: role}}
        self.userStates = {}        #{room_id: {user_id: {muted: False, hand_raised: False}}}
    
    async def GetUserRole(self, roomID: str, userID: str):
        return self.userRoles.get(roomID, {}).get(userID, "guest")

    async def ValidateEvent(self, roomID: str, userID: str, eventType: str, targetUser: str = None) -> bool:
        userRole = await self.GetUserRole(roomID, userID)

        if eventType in MODERATOR_EVENTS:
            return userRole in ["owner", "moderator"]
        
        if eventType in ["user_kicked", "user_banned", "user_muted"] and userID == targetUser:
            return False
        
        if eventType in ["hand_raised", "hand_lowered"]:
            return userRole != "guest"
        
        return True
    
    async def SetUserRole(self, roomID: str, userID: str, role: str):
        if roomID not in self.userRoles:
            self.userRoles[roomID] = {}
        self.userRoles[roomID][userID] = role

    async def SetUserState(self, roomID: str, userID: str, stateKey: str, stateValue: str):
        if roomID not in self.userStates:
            self.userStates[roomID] = {}
        if userID not in self.userStates.get(roomID, {}):
            self.userStates[roomID][userID] = {}
        self.userStates[roomID][userID][stateKey] = stateValue

    async def ForcedDisconnectUser(self, roomID: str, userID: str):
        if userID in self.connections.get(roomID, {}):
            await self.connections[roomID][userID].close()
            await self.RemoveConnection(roomID, userID)

    async def HandleModaretionEvent(self, roomID: str, eventType: str, fromUser: str, targetUser: str, data: dict):
        if eventType == "user_kicked" and await self.ValidateEvent(roomID, fromUser, eventType, targetUser):
            await self.ForcedDisconnectUser(roomID, targetUser)

            await self.Publish(roomID, json.dumps({
                "type":eventType,
                "from":fromUser,
                "to":"all",
                "data":{"target_user": targetUser, "reason":data.get("reason", "")}
            }))

        if eventType == "user_muted" and await self.ValidateEvent(roomID, fromUser, eventType, targetUser):
            await self.SetUserState(roomID, targetUser, "muted", data.get("muted", True))

            await self.Publish(roomID, json.dumps({
                "type":eventType,
                "from":fromUser,
                "to":"all",
                "data":{"target_user": targetUser, "reason":data.get("reason", "")}
            }))

        if eventType == "role_changed" and await self.ValidateEvent(roomID, fromUser, eventType, targetUser):
            await self.SetUserRole(roomID, targetUser, data.get("role"))

    async def AddConnection(self, roomID: str, userID: str, websocket: WebSocket):
        if roomID not in self.connections:
            self.connections[roomID] = {}
            await self.SetUserRole(roomID, userID, "owner")
        else:
            await self.SetUserRole(roomID, userID, "member")
        self.connections[roomID][userID] = websocket
    
    async def RemoveConnection(self, roomID: str, userID: str):
        if roomID in self.connections and userID in self.connections[roomID]:
            del self.connections[roomID][userID]

    async def Publish(self, roomID: str, message: str):
        if redisClient:
            await redisClient.publish(
                channel=f"room_{roomID}",
                message=message
            )
    
    async def Subscriber(self, roomID: str):
        if redisClient:
            pubsub = redisClient.pubsub()
            await pubsub.subscribe(f"room_{roomID}")
            return pubsub
        
        return None
    
manager = ConnectionManager()

@app.websocket("/ws/{roomID}/{userID}")
async def websocketEndPoint(websocket: WebSocket, roomID: str, userID: str):
    await websocket.accept()

    await manager.AddConnection(roomID, userID, websocket)

    pubsub = await manager.Subscriber(roomID)

    try:
        await manager.Publish(
            roomID,
            json.dumps({
                "type":"user_joined",
                "from":userID,
                "data":{"users": list(manager.connections.get(roomID, {}).keys())}
            })
        )

        async def recieveFromClient():
            try: 
                async for message in websocket.iter_text():
                    data = json.loads(message)

                    if not await manager.ValidateEvent(roomID, userID, data["type"], data.get("to")):
                        await websocket.send_text(
                            json.dumps({
                                "type":"error",
                                "data":{"message":"permission denied"}
                            })
                        )

                        continue
                    
                    if data["type"] in MODERATOR_EVENTS:
                        await manager.HandleModaretionEvent(roomID, data["type"], userID, data.get("to"), data.get("data", ""))
                    else:
                        await manager.Publish(
                            roomID,
                            json.dumps({
                                "type":data["type"],
                                "from": userID, 
                                "to": data.get("to", "all"),
                                "data": data["data"]
                            })
                        )
            except WebSocketDisconnect:
                pass

        async def recieveFromRedis():
            if pubsub:
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        data = json.loads(message["data"])

                        if data.get("to") not in ["all", userID] and data.get("to") is not None:
                            continue

                        await websocket.send_text(json.dumps(data))

        await asyncio.gather(
            recieveFromClient(),
            recieveFromRedis(),
            return_exceptions=True
        )

    except WebSocketDisconnect:
        await manager.RemoveConnection(roomID, userID)

        await manager.Publish(roomID,
                              json.dumps({
                                    "type":"user_left",
                                    "from":userID,
                                    "data":{"users": list(manager.connections.get(roomID, {}).keys())}    
                                })
                              )
    finally:
        if pubsub:
            await pubsub.unsubscribe(f"room_{roomID}")