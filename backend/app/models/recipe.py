import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    food_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ingredients: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    cooking_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    cuisine: Mapped[str] = mapped_column(String(50), nullable=False)
    dietary_restrictions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    servings: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String(20), nullable=False)
    generated_content: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="recipes")
    saved_by: Mapped[list["SavedRecipe"]] = relationship(back_populates="recipe", cascade="all, delete-orphan")
