"""Imports Base plus every model so Alembic autogenerate can discover all tables.

This module must not be imported by the models themselves (that would be circular);
only Alembic's env.py and one-off scripts should import it.
"""

from app.db.base import Base  # noqa: F401
from app.models.recipe import Recipe  # noqa: F401
from app.models.saved_recipe import SavedRecipe  # noqa: F401
from app.models.user import User  # noqa: F401
