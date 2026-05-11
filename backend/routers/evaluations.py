from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/evaluations", tags=["evaluations"])

def _check_member(project_id, user, db):
    if not db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first():
        raise HTTPException(403, "No eres miembro de este proyecto")

@router.post("", response_model=schemas.EvaluationOut)
def create_evaluation(project_id: int, data: schemas.EvaluationCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    if data.evaluatee_id == user.id:
        raise HTTPException(400, "No puedes evaluarte a ti mismo")
    existing = db.query(models.Evaluation).filter_by(
        project_id=project_id, evaluator_id=user.id, evaluatee_id=data.evaluatee_id
    ).first()
    if existing:
        for k, v in data.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return _eval_out(existing)
    ev = models.Evaluation(**data.model_dump(), project_id=project_id, evaluator_id=user.id)
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return _eval_out(ev)

@router.get("", response_model=List[schemas.EvaluationOut])
def list_evaluations(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    evals = db.query(models.Evaluation).filter_by(project_id=project_id).all()
    return [_eval_out(e) for e in evals]

def _eval_out(e):
    return schemas.EvaluationOut(
        id=e.id, project_id=e.project_id, evaluator_id=e.evaluator_id,
        evaluatee_id=e.evaluatee_id, evaluatee_name=e.evaluatee.full_name,
        quality=e.quality, commitment=e.commitment, collaboration=e.collaboration,
        comment=e.comment or "", created_at=e.created_at,
    )
