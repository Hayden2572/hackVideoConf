from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, safe_create_tables
from app.database import engine, get_db
from app import models
from app import crud
from app import schemas
from .schemas import DeleteResponse, ErrorResponse, RoomDeleteResponse, RoomWithParticipants, UserContext, UserCreate, UserLogin, UserResponse, RoomCreate, RoomResponse, Token
from app.config import settings
from app.auth.jwt import JWT
from app.config import settings
try:
    from fastapi.middleware.cors import CORSMiddleware
    cors_available = True
except ImportError:
    cors_available = False
    print("CORS middleware not available")

safe_create_tables()

app = FastAPI(
    title="Conference App API",
    description="Backend для веб-приложения онлайн-конференций",
    version="1.0.0"
)

if cors_available:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
jwt_handler = JWT(settings.SECRET_KEY)
security = HTTPBearer()
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserContext:  
    try:
        payload = jwt_handler.decodeToken(credentials.credentials)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        db_user = crud.get_user(db, user_id=user_id)
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserContext(user_id=user_id, username=db_user.username)
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "Conference App API - Working! 🚀", 
        "version": "1.0.0",
        "debug": settings.DEBUG
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    

    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    created_user = crud.create_user(db=db, user=user)
    
    return created_user
@app.get("/api/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db_user

@app.post("/api/rooms/", response_model=RoomResponse)
async def create_room(room: RoomCreate, db: Session = Depends(get_db),
                       current_user: UserContext = Depends(get_current_user)):

    
    created_room = crud.create_room(db=db, room=room, created_by=current_user.user_id)
    
    room_response = RoomResponse(
        id=created_room.id,
        room_id=created_room.room_id,
        name=created_room.name,
        description=created_room.description,
        max_participants=created_room.max_participants,
        created_by=created_room.created_by,
        is_active=created_room.is_active,
        created_at=created_room.created_at,
        invite_link=f"http://localhost:3000/join/{created_room.room_id}" 
    )
    
    return room_response

@app.get("/api/rooms/{room_id}", response_model=RoomResponse)
async def read_room(room_id: str, db: Session = Depends(get_db)):
    db_room = crud.get_room_by_id(db, room_id=room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room

@app.delete("/api/rooms/{room_id}",responses={
               200: {"model": RoomDeleteResponse},
               403: {"model": ErrorResponse},
               404: {"model": ErrorResponse}
           })
async def delete_room(room_id: str, db: Session = Depends(get_db), current_user: 
                      UserContext = Depends(get_current_user)):
    result = crud.delete_room(db, room_id=room_id, requested_by=current_user.user_id)
    
    if not result.success:
        if result.error == "Room not found":
            raise HTTPException(status_code=404, detail=result.error)
        else:
            raise HTTPException(status_code=403, detail=result.error)
    
    return RoomDeleteResponse(
        message=f"Room {room_id} deleted successfully",
        room_id=result.room_id,
        deleted_participants_count=result.deleted_participants_count 
    )

@app.get("/api/rooms/", tags=["admin"], summary="get all rooms")
async def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rooms = crud.get_rooms(db, skip=skip, limit=limit)
    
    result = []
    for room in rooms:
        result.append({
            "id": room.id,
            "room_id": room.room_id,
            "name": room.name,
            "description": room.description,
            "max_participants": room.max_participants,
            "created_by": room.created_by,
            "is_active": room.is_active,
            "created_at": room.created_at.isoformat() if room.created_at else None
        })
    
    return result

@app.get("/api/rooms/{room_id}/invite")
async def get_room_invite_link(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.UserContext = Depends(get_current_user)
):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    invite_link = crud.generate_room_link(room_id)
    
    return {
        "room_id": room_id,
        "room_name": room.name,
        "invite_link": invite_link,
        "direct_link": f"/join/{room_id}", 
        "expires": None  
    }

@app.post("/api/rooms/{room_id}/join")
async def join_room(room_id: str, user_id: int, db: Session = Depends(get_db)):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    participant = crud.add_participant_to_room(db, room_id=room.id, user_id=user_id)
    
    return {
        "message": f"User {user.display_name} joined room {room.name}",
        "room": {
            "id": room.id,
            "room_id": room.room_id,
            "name": room.name
        },
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name
        }
    }

@app.post("/api/rooms/join/{room_id}")
async def join_room_by_link(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.UserContext = Depends(get_current_user)
):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_active:
        raise HTTPException(status_code=400, detail="Room is not active")
    
    current_participants = crud.get_active_participants_count(db, room_id)
    if current_participants >= room.max_participants:
        raise HTTPException(status_code=400, detail="Room is full")
    
    participant = crud.add_participant_to_room(db, room_id=room.id, user_id=current_user.user_id)
    
    return {
        "message": f"Successfully joined room {room.name}",
        "room": {
            "id": room.id,
            "room_id": room.room_id,
            "name": room.name,
            "participants_count": current_participants + 1
        },
        "user": {
            "id": current_user.user_id,
            "username": current_user.username
        }
    }

@app.post("/api/rooms/{room_id}/leave")
async def leave_room(room_id: str, user_id: int, db: Session = Depends(get_db)):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    participant = crud.remove_participant_from_room(db, room_id=room.id, user_id=user_id)
    
    return {
        "message": f"User left room {room.name}",
        "room": {
            "id": room.id,
            "room_id": room.room_id,
            "name": room.name
        }
    }

@app.get("/api/rooms/{room_id}/participants", response_model=RoomWithParticipants)
async def get_participants(room_id: str, db: Session = Depends(get_db)):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    participants = crud.get_room_participants(db, room_id=room.id)
    
    result = []
    for participant in participants:
        user = crud.get_user(db, participant.user_id)
        if user:
            result.append({
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "joined_at": participant.joined_at.isoformat() if participant.joined_at else None,
                "is_online": participant.is_online,
                "role": participant.role or "participant" 
            })
    
    return {
        "room_id": room_id,
        "room_name": room.name,
        "participants": result
    }

@app.delete("/api/users/{user_id}", 
           responses={
               200: {"model": DeleteResponse},
               404: {"model": ErrorResponse},
               403: {"model": ErrorResponse},
           })
async def delete_user(user_id: int, db: Session = Depends(get_db),current_user:
                       UserContext = Depends(get_current_user)):
    success = crud.delete_user(db, user_id=user_id, requested_by=current_user.user_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )
    
    return DeleteResponse(
        message=f"User {user_id} deleted successfully",
        deleted_id=str(user_id)
    )

@app.get("/api/rooms/{room_id}/permissions")
async def check_room_permissions(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: schemas.UserContext = Depends(get_current_user)
):
    room = crud.get_room_by_id(db, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    is_creator = crud.is_room_creator(db, room_id=room_id, user_id=current_user.user_id)
    user_role = crud.get_user_role_in_room(db, room_id=room_id, user_id=current_user.user_id)
    
    return {
        "user_id": current_user.user_id,
        "room_id": room_id,
        "is_creator": is_creator,
        "role": user_role,
        "permissions": {
            "can_delete_room": is_creator,
            "can_manage_participants": is_creator or user_role in ["creator", "co-host"],
            "can_share_screen": True,  
            "can_send_messages": True  
        }
    }

from app.auth.jwt import JWT
from app.config import settings



@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user_data.username)
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
        )
    
    # TODO: Добавить проверку пароля когда добавлю хеширование
    # if not verify_password(user_data.password, db_user.hashed_password):
    #     raise HTTPException(...)
    
    access_token = jwt_handler.createAccessToken(userID=db_user.id)
    refresh_token = jwt_handler.createRefreshToken(userID=db_user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str

@app.post("/api/auth/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):  
    try:
        payload = jwt_handler.decodeToken(request.refresh_token)  
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        user_id = payload.get("sub")
        new_access_token = jwt_handler.createAccessToken(userID=user_id)
        new_refresh_token = jwt_handler.createRefreshToken(userID=user_id)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@app.put("/api/users/{user_id}/avatar")
async def update_avatar(
    user_id: int,
    avatar_data: dict,  # {"avatar_url": "https://example.com/avatar.jpg"}
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Can only update your own avatar")
    
    updated_user = crud.update_user_avatar(db, user_id=user_id, avatar_url=avatar_data["avatar_url"])
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

@app.put("/api/users/{user_id}/profile", response_model=UserResponse)
async def update_profile(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):

    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Can only update your own profile")
    
    updated_user = crud.update_user_profile(db, user_id=user_id, user_update=user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

@app.get("/api/users/{user_id}/avatar")
async def get_avatar(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"avatar_url": user.avatar_url}