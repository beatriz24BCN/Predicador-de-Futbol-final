from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    # NUEVO: Relación de 1 a Muchos (Un usuario -> Muchas predicciones)
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # NOTA: No serializamos la contraseña por seguridad
        }

# NUEVO MODELO: Tabla para guardar las quinielas de los usuarios
class Prediction(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Llave foránea: ¿De qué usuario es esta predicción?
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    
    # ID del partido (el mismo que viene de la API de football-data)
    fixture_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Goles predichos
    home_goals: Mapped[int] = mapped_column(Integer, nullable=False)
    away_goals: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Puntos ganados (Inicia vacío, se llena cuando el partido termina en la vida real)
    points_earned: Mapped[int] = mapped_column(Integer, nullable=True)

    # Relación inversa para poder acceder al usuario desde la predicción
    user = relationship("User", back_populates="predictions")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "fixture_id": self.fixture_id,
            "home_goals": self.home_goals,
            "away_goals": self.away_goals,
            "points_earned": self.points_earned
        }
        from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# ============================
# 🛒 PRODUCT MODEL (TIENDA)
# ============================

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": self.precio,
            "stock": self.stock
        }