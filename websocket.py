from fastapi import WebSocket, FastAPI, WebSocketDisconnect
from broadcaster import Broadcast
from contextlib import asynccontextmanager
import redis.asyncio as redis
import json
import asyncio

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

    async def AddConnection(self, roomID: str, userID: str, websocket: WebSocket):
        if roomID not in self.connections:
            self.connections[roomID] = {}
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