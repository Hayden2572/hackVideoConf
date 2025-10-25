from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    display_name: str

class UserRole(str, Enum):
    CREATOR = "creator"
    CO_HOST = "co-host" 
    PARTICIPANT = "participant"
    GUEST = "guest"

class UserCreate(UserBase):
    username: str
    display_name: str
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class UserUpdate(BaseModel):  
    display_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class UserContext(BaseModel):
    user_id: int
    username: str

class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_participants: int = 10

class RoomCreate(RoomBase):
    name: str
    description: Optional[str] = None
    max_participants: int = 10

class RoomResponse(BaseModel):
    id: int
    room_id: str
    name: str
    description: Optional[str] = None
    max_participants: int
    created_by: int
    is_active: bool
    created_at: datetime
    invite_link: str
    model_config = {
        "from_attributes": True
    }
       
class RoomResponseWithInvite(BaseModel):
    id: int
    room_id: str
    name: str
    description: Optional[str] = None
    max_participants: int
    created_by: int
    is_active: bool
    created_at: datetime
    invite_link: str  
    
    model_config = {
        "from_attributes": True
    }    
    
class ParticipantResponse(BaseModel):
    user_id: int
    username: str
    display_name: str
    joined_at: datetime
    is_online: bool
    role: UserRole
    model_config = {
        "from_attributes": True
    }

class RoomWithParticipants(BaseModel):
    room_id: str
    room_name: str
    participants: List[ParticipantResponse] = []

class DeleteResponse(BaseModel):
    message: str
    deleted_id: str
    model_config = {
        "from_attributes": True
    }

class ErrorResponse(BaseModel):
    detail: str
    error_code: str = None  
    model_config = {
        "from_attributes": True
    }

class RoomDeleteResponse(BaseModel):
    message: str
    room_id: str
    deleted_participants_count: int  
    model_config = {
        "from_attributes": True
    }

class DeleteRoomResult(BaseModel):
    success: bool
    deleted_participants_count: int
    room_id: str
    error: Optional[str] = None
    model_config = {
        "from_attributes": True
    }

class DeleteUserResult(BaseModel):
    success: bool
    deleted_id: int
    error: Optional[str] = None
    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str 

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserLogin(BaseModel):
    username: str
    password: str