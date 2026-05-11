import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, projects, tasks, activities, evaluations, scores

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CollabScore API", version="1.0.0")

raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5174,http://localhost:5173")
allowed_origins = [o.strip() for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(activities.router, prefix="/api/v1")
app.include_router(evaluations.router, prefix="/api/v1")
app.include_router(scores.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "CollabScore API running"}
