from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/activities", tags=["activities"])

def _check_member(project_id, user, db):
    if not db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first():
        raise HTTPException(403, "No eres miembro de este proyecto")

@router.post("", response_model=schemas.ActivityOut)
def create_activity(project_id: int, data: schemas.ActivityCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    activity = models.Activity(**data.model_dump(), project_id=project_id, user_id=user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return _activity_out(activity)

@router.get("", response_model=List[schemas.ActivityOut])
def list_activities(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    acts = db.query(models.Activity).filter_by(project_id=project_id).order_by(models.Activity.created_at.desc()).all()
    return [_activity_out(a) for a in acts]

def _activity_out(a):
    return schemas.ActivityOut(
        id=a.id, project_id=a.project_id, user_id=a.user_id,
        user_name=a.user.full_name, activity_type=a.activity_type,
        description=a.description, hours=a.hours,
        evidence_url=a.evidence_url, created_at=a.created_at,
    )
