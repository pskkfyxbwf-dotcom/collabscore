from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import hash_password, verify_password, create_access_token, get_current_user
import secrets, os, smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

def send_reset_email(to_email: str, reset_link: str):
    gmail_user = os.getenv("GMAIL_USER")
    gmail_pass = os.getenv("GMAIL_APP_PASSWORD")
    if not gmail_user or not gmail_pass:
        raise HTTPException(500, "Servicio de correo no configurado")
    subject = "Recupera tu contraseña - CollabScore"
    body = f"""Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en CollabScore.

Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 1 hora):

{reset_link}

Si no solicitaste este cambio, puedes ignorar este correo.

— Equipo CollabScore
"""
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, to_email, msg.as_string())

@router.post("/register", response_model=schemas.Token)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(400, "El correo ya está registrado")
    user = models.User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Credenciales incorrectas")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    # Always return success to avoid user enumeration
    if not user:
        return {"message": "Si el correo existe, recibirás un enlace de recuperación"}
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    reset_token = models.PasswordResetToken(user_id=user.id, token=token, expires_at=expires)
    db.add(reset_token)
    db.commit()
    frontend_url = os.getenv("FRONTEND_URL", "https://collabscore.vercel.app")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    send_reset_email(user.email, reset_link)
    return {"message": "Si el correo existe, recibirás un enlace de recuperación"}

@router.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(data.new_password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")
    now = datetime.now(timezone.utc)
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == data.token,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.expires_at > now,
    ).first()
    if not reset_token:
        raise HTTPException(400, "El enlace es inválido o ha expirado")
    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    user.hashed_password = hash_password(data.new_password)
    reset_token.used = True
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}
