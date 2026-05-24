from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/scores", tags=["scores"])

TASK_TYPE_WEIGHTS = {"research": 1.5, "design": 1.3, "revision": 1.0, "logistics": 0.8}

def _check_member(project_id, user, db):
    if not db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first():
        raise HTTPException(403, "No eres miembro")

@router.get("", response_model=List[schemas.MemberScore])
def get_scores(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    _check_member(project_id, user, db)
    members = db.query(models.ProjectMember).filter_by(project_id=project_id).all()
    result = []
    for m in members:
        u = m.user
        # Task score: completed tasks weighted by type
        tasks = db.query(models.Task).filter_by(project_id=project_id, assignee_id=u.id).all()
        completed = [t for t in tasks if t.status == "completed"]
        total_tasks = len(tasks)
        if total_tasks == 0:
            task_score = 0.0
        else:
            weighted_completed = sum(TASK_TYPE_WEIGHTS.get(t.task_type, 1.0) for t in completed)
            weighted_total = sum(TASK_TYPE_WEIGHTS.get(t.task_type, 1.0) for t in tasks)
            task_score = min(round((weighted_completed / weighted_total) * 40, 1), 40)

        # Activity score: hours contributed
        acts = db.query(models.Activity).filter_by(project_id=project_id, user_id=u.id).all()
        act_hours = sum(a.hours for a in acts)
        activity_score = min(round(act_hours * 2, 1), 30)

        # Peer evaluation score
        evals = db.query(models.Evaluation).filter_by(project_id=project_id, evaluatee_id=u.id).all()
        if evals:
            avg_quality = sum(e.quality for e in evals) / len(evals)
            avg_commitment = sum(e.commitment for e in evals) / len(evals)
            avg_collab = sum(e.collaboration for e in evals) / len(evals)
            peer_score = round(((avg_quality + avg_commitment + avg_collab) / 3) / 100 * 30, 1)
        else:
            peer_score = 0.0

        total = round(task_score + activity_score + peer_score, 1)
        result.append(schemas.MemberScore(
            user_id=u.id, full_name=u.full_name, email=u.email,
            task_score=task_score, activity_score=activity_score,
            peer_score=peer_score, total_score=min(total, 100),
        ))
    return sorted(result, key=lambda x: x.total_score, reverse=True)
