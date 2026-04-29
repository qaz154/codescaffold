from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users
from pkg.db import engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

app = FastAPI(
    title="{{PROJECT_NAME}}",
    description="{{DESCRIPTION}}",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "{{PROJECT_NAME}} API", "version": "0.1.0"}
