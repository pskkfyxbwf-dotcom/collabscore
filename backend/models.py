from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    student = "student"
    professor = "professor"
    admin = "admin"

class TaskStatusEnum(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    overdue = "overdue"

class TaskTypeEnum(str, enum.Enum):
    research = "research"
    design = "design"
    revision = "revision"
    logistics = "logistics"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="student")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    projects_owned = relationship("Project", back_populates="owner")
    memberships = relationship("ProjectMember", back_populates="user")
    tasks_assigned = relationship("Task", back_populates="assignee")
    activities = relationship("Activity", back_populates="user")
    evaluations_given = relationship("Evaluation", foreign_keys="Evaluation.evaluator_id", back_populates="evaluator")
    evaluations_received = relationship("Evaluation", foreign_keys="Evaluation.evaluatee_id", back_populates="evaluatee")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    deadline = Column(String(20), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="projects_owned")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="project", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="project", cascade="all, delete-orphan")

class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    task_type = Column(String(20), default="revision")
    status = Column(String(20), default="pending")
    deadline = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String(30), default="comment")
    description = Column(Text, nullable=False)
    hours = Column(Float, default=1.0)
    evidence_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="activities")
    user = relationship("User", back_populates="activities")

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    evaluator_id = Column(Integer, ForeignKey("users.id"))
    evaluatee_id = Column(Integer, ForeignKey("users.id"))
    quality = Column(Float, default=3.0)
    commitment = Column(Float, default=3.0)
    collaboration = Column(Float, default=3.0)
    comment = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="evaluations")
    evaluator = relationship("User", foreign_keys=[evaluator_id], back_populates="evaluations_given")
    evaluatee = relationship("User", foreign_keys=[evaluatee_id], back_populates="evaluations_received")
