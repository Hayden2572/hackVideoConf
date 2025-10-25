from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.config import settings
load_dotenv()
DATABASE_URL = settings.DATABASE_URL
print(f" Подключаемся к базе: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else '***'}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def safe_create_tables():
    print(f"Создаем таблицы...")

    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы")