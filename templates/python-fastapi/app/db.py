from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from python-dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://CHANGE_ME@localhost:5432/{{PROJECT_NAME}}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
