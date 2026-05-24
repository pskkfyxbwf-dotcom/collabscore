from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Projects
class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    deadline: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[str] = None

class MemberOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    role: str
    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    deadline: Optional[str]
    owner_id: int
    owner_name: str
    member_count: int
    created_at: datetime
    class Config:
        from_attributes = True

# Tasks
class TaskCreate(BaseModel):
    title: str
    description: str = ""
    task_type: str = "revision"
    status: str = "pending"
    deadline: Optional[str] = None
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[str] = None
    assignee_id: Optional[int] = None

class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    task_type: str
    status: str
    deadline: Optional[str]
    assignee_id: Optional[int]
    assignee_name: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Activities
class ActivityCreate(BaseModel):
    activity_type: str = "comment"
    description: str
    hours: float = 1.0
    evidence_url: Optional[str] = None

class ActivityOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    user_name: str
    activity_type: str
    description: str
    hours: float
    evidence_url: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Evaluations
class EvaluationCreate(BaseModel):
    evaluatee_id: int
    quality: float
    commitment: float
    collaboration: float
    comment: str = ""

class EvaluationOut(BaseModel):
    id: int
    project_id: int
    evaluator_id: int
    evaluatee_id: int
    evaluatee_name: str
    quality: float
    commitment: float
    collaboration: float
    comment: str
    created_at: datetime
    class Config:
        from_attributes = True

# Password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Score
class MemberScore(BaseModel):
    user_id: int
    full_name: str
    email: str
    task_score: float
    activity_score: float
    peer_score: float
    total_score: float
