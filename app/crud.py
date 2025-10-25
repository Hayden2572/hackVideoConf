from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app import models
import uuid
from typing import List, Optional
import secrets
import string

from app.schemas import DeleteRoomResult, DeleteUserResult, RoomCreate, UserCreate, UserUpdate

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_room_creator_id(db: Session, room_id: str) -> Optional[int]:
    room = get_room_by_id(db, room_id=room_id)
    return room.created_by if room else None

def get_user_role_in_room(db: Session, room_id: str, user_id: int) -> Optional[str]:
    room = get_room_by_id(db, room_id=room_id)
    if not room:
        return None
    
    participant = db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == room.id,
        models.RoomParticipant.user_id == user_id
    ).first()
    
    if participant:
        return participant.role
    return None

def generate_room_id(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    alphabet = alphabet.replace('O', '').replace('0', '').replace('1', '').replace('I', '').replace('L', '')
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_room_link(room_id: str, base_url: str = "http://localhost:3000") -> str:
    return f"{base_url}/join/{room_id}"

def generate_unique_room_id(db: Session, max_attempts: int = 5) -> str:
    for attempt in range(max_attempts):
        room_id = generate_room_id()
        if not get_room_by_id(db, room_id):
            return room_id
    return str(uuid.uuid4())[:8] 

def is_room_creator(db: Session, room_id: str, user_id: int) -> bool:
    room = get_room_by_id(db, room_id=room_id)
    return room and room.created_by == user_id

def get_active_participants_count(db: Session, room_id: str) -> int:
    room = get_room_by_id(db, room_id=room_id)
    if not room:
        return 0
    
    return db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == room.id,
        models.RoomParticipant.is_online == True
    ).count()

def create_user(db: Session, user: UserCreate):
    db_user = models.User(
        username=user.username,
        display_name=user.display_name,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_room(db: Session, room: RoomCreate, created_by: int):
    room_id = generate_unique_room_id(db)
    
    db_room = models.Room(
        room_id=room_id,
        name=room.name,
        description=room.description,
        max_participants=room.max_participants,
        created_by=created_by
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    db_participant = models.RoomParticipant(
        room_id=db_room.id,
        user_id=created_by,
        is_online=True,
        role="creator"
    )
    db.add(db_participant)
    db.commit()
    return db_room

def get_room_by_id(db: Session, room_id: str):
    return db.query(models.Room).filter(models.Room.room_id == room_id).first()

def get_rooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Room).offset(skip).limit(limit).all()

def add_participant_to_room(db: Session, room_id: int, user_id: int):
    existing = db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == room_id,
        models.RoomParticipant.user_id == user_id,
        models.RoomParticipant.left_at.is_(None)
    ).first()
    
    if existing:
        existing.is_online = True
        db.commit()
        return existing
    
    db_participant = models.RoomParticipant(
        room_id=room_id,
        user_id=user_id,
        is_online=True
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

def remove_participant_from_room(db: Session, room_id: int, user_id: int):
    participant = db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == room_id,
        models.RoomParticipant.user_id == user_id,
        models.RoomParticipant.left_at.is_(None)
    ).first()
    
    if participant:
        participant.is_online = False
        participant.left_at = func.now()
        db.commit()
    return participant

def get_room_participants(db: Session, room_id: int):
    return db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == room_id,
        models.RoomParticipant.is_online == True
    ).all()

def delete_room(db: Session, room_id: str, requested_by: int) -> DeleteRoomResult:
    db_room = get_room_by_id(db, room_id=room_id)
    if not db_room:
        return DeleteRoomResult(
            success=False, 
            error="Room not found",
            deleted_participants_count=0,
            room_id=room_id
        )
    
    if db_room.created_by != requested_by:
        return DeleteRoomResult(
            success=False, 
            error="Only room creator can delete the room",
            deleted_participants_count=0,
            room_id=room_id
        )
    
    participants_count = db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == db_room.id
    ).count()
    
    db.query(models.RoomParticipant).filter(
        models.RoomParticipant.room_id == db_room.id
    ).delete()
    
    db.delete(db_room)
    db.commit()
    
    return DeleteRoomResult(
        success=True, 
        deleted_participants_count=participants_count,
        room_id=room_id
    )

def delete_user(db: Session, user_id: int, requested_by: int) -> DeleteUserResult:
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        return DeleteUserResult(
            success=False, 
            error="User not found",
            deleted_id=user_id
        )
    
    if user_id != requested_by:
        return DeleteUserResult(
            success=False, 
            error="You can only delete your own account",
            deleted_id=user_id
        )
    
    owned_rooms = db.query(models.Room).filter(
        models.Room.created_by == user_id,
        models.Room.is_active == True
    ).count()
    
    if owned_rooms > 0:
        return DeleteUserResult(
            success=False, 
            error="Cannot delete user who owns active rooms",
            deleted_id=user_id
        )
    
    db.query(models.RoomParticipant).filter(
        models.RoomParticipant.user_id == user_id
    ).delete()
    
    db.delete(db_user)
    db.commit()
    
    return DeleteUserResult(
        success=True, 
        deleted_id=user_id
    )

def update_user_avatar(db: Session, user_id: int, avatar_url: str):
    db_user = get_user(db, user_id=user_id)
    if db_user:
        db_user.avatar_url = avatar_url
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: int, user_update: UserUpdate):
    db_user = get_user(db, user_id=user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
    return db_user