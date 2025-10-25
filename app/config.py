from pydantic_settings import BaseSettings
from pydantic import field_validator,  Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., description="PostgreSQL connection string")
    
    SECRET_KEY: str = Field(..., description="JWT secret key")
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=10080, description="Refresh token expiration in minutes")
    
    DEBUG: bool = Field(default=False, description="Debug mode")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate that SECRET_KEY is set and not default"""
        if not v or v == "your-super-secret-key-here":
            raise ValueError("SECRET_KEY must be set in .env file")
        if len(v) < 32:
            print("WARNING: SECRET_KEY is shorter than 32 characters")
        return v
    
    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL format"""
        if not v:
            raise ValueError("DATABASE_URL is required")
        if "postgresql://" not in v:
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()