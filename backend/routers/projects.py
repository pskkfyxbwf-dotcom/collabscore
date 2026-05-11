from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=schemas.ProjectOut)
def create_project(data: schemas.ProjectCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    project = models.Project(**data.model_dump(), owner_id=user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    # Auto-add owner as member
    member = models.ProjectMember(project_id=project.id, user_id=user.id)
    db.add(member)
    db.commit()
    return _project_out(project, db)

@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    memberships = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == user.id).all()
    project_ids = [m.project_id for m in memberships]
    projects = db.query(models.Project).filter(models.Project.id.in_(project_ids)).order_by(models.Project.created_at.desc()).all()
    return [_project_out(p, db) for p in projects]

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    project = _get_or_404(project_id, db, user)
    return _project_out(project, db)

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(project_id: int, data: schemas.ProjectUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    project = _get_or_404(project_id, db, user)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return _project_out(project, db)

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == user.id).first()
    if not project:
        raise HTTPException(404, "Proyecto no encontrado o sin permisos")
    db.delete(project)
    db.commit()
    return {"ok": True}

@router.get("/{project_id}/members", response_model=List[schemas.MemberOut])
def get_members(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _get_or_404(project_id, db, user)
    members = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).all()
    result = []
    for m in members:
        result.append(schemas.MemberOut(id=m.id, user_id=m.user_id, full_name=m.user.full_name, email=m.user.email, role=m.user.role))
    return result

@router.post("/{project_id}/members")
def add_member(project_id: int, email: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    project = _get_or_404(project_id, db, user)
    target = db.query(models.User).filter(models.User.email == email).first()
    if not target:
        raise HTTPException(404, "Usuario no encontrado")
    existing = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=target.id).first()
    if existing:
        raise HTTPException(400, "Ya es miembro del proyecto")
    member = models.ProjectMember(project_id=project_id, user_id=target.id)
    db.add(member)
    db.commit()
    return {"ok": True}

def _get_or_404(project_id, db, user):
    membership = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first()
    if not membership:
        raise HTTPException(404, "Proyecto no encontrado")
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def _project_out(project, db):
    count = db.query(models.ProjectMember).filter_by(project_id=project.id).count()
    return schemas.ProjectOut(
        id=project.id, name=project.name, description=project.description or "",
        deadline=project.deadline, owner_id=project.owner_id,
        owner_name=project.owner.full_name, member_count=count,
        created_at=project.created_at,
    )
