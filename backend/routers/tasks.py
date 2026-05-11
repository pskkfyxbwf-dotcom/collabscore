from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])

def _check_member(project_id, user, db):
    m = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first()
    if not m:
        raise HTTPException(403, "No eres miembro de este proyecto")

@router.post("", response_model=schemas.TaskOut)
def create_task(project_id: int, data: schemas.TaskCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    task = models.Task(**data.model_dump(), project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_out(task)

@router.get("", response_model=List[schemas.TaskOut])
def list_tasks(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    tasks = db.query(models.Task).filter_by(project_id=project_id).all()
    return [_task_out(t) for t in tasks]

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(project_id: int, task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    task = db.query(models.Task).filter_by(id=task_id, project_id=project_id).first()
    if not task:
        raise HTTPException(404, "Tarea no encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return _task_out(task)

@router.delete("/{task_id}")
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    task = db.query(models.Task).filter_by(id=task_id, project_id=project_id).first()
    if not task:
        raise HTTPException(404, "Tarea no encontrada")
    db.delete(task)
    db.commit()
    return {"ok": True}

def _task_out(task):
    return schemas.TaskOut(
        id=task.id, project_id=task.project_id, title=task.title,
        description=task.description or "", task_type=task.task_type,
        status=task.status, deadline=task.deadline,
        assignee_id=task.assignee_id,
        assignee_name=task.assignee.full_name if task.assignee else None,
        created_at=task.created_at,
    )
