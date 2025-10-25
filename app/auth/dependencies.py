from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import JWT
from app.config import settings

security = HTTPBearer()
jwt_handler = JWT(settings.SECRET_KEY)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt_handler.decodeToken(credentials.credentials)
        user_id: int = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
        return {"user_id": user_id, "token_type": token_type}
    except ValueError as e:
        raise credentials_exception

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    return current_user