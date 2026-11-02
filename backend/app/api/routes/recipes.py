import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, verify_csrf
from app.db.session import get_db
from app.models.recipe import Recipe
from app.models.saved_recipe import SavedRecipe
from app.models.user import User
from app.schemas.recipe import (
    RecipeContent,
    RecipeGenerateRequest,
    RecipeGenerateResponse,
    SavedRecipeDetail,
    SavedRecipeListItem,
)
from app.services.groq_service import GroqServiceError, generate_recipe

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("/generate", response_model=RecipeGenerateResponse, dependencies=[Depends(verify_csrf)])
async def generate(
    data: RecipeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RecipeGenerateResponse:
    try:
        content = await generate_recipe(data)
    except GroqServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    recipe = Recipe(
        user_id=current_user.id,
        title=content.title,
        food_type=data.food_type,
        ingredients=data.ingredients,
        cooking_time_minutes=data.cooking_time_minutes,
        cuisine=data.cuisine,
        dietary_restrictions=data.dietary_restrictions,
        servings=data.servings,
        difficulty_level=data.difficulty_level,
        generated_content=content.model_dump(mode="json"),
    )
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)

    return RecipeGenerateResponse(
        id=recipe.id,
        content=content,
        food_type=recipe.food_type,
        cuisine=recipe.cuisine,
        cooking_time_minutes=recipe.cooking_time_minutes,
        difficulty_level=recipe.difficulty_level,
        is_saved=False,
    )


@router.post("/{recipe_id}/save", status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
async def save_recipe(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    saved = SavedRecipe(user_id=current_user.id, recipe_id=recipe_id)
    db.add(saved)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recipe already saved") from None

    return {"detail": "Recipe saved"}


@router.get("/saved", response_model=list[SavedRecipeListItem])
async def list_saved_recipes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SavedRecipeListItem]:
    result = await db.execute(
        select(SavedRecipe, Recipe)
        .join(Recipe, Recipe.id == SavedRecipe.recipe_id)
        .where(SavedRecipe.user_id == current_user.id)
        .order_by(SavedRecipe.saved_at.desc())
    )
    return [
        SavedRecipeListItem(
            recipe_id=recipe.id,
            title=recipe.title,
            cuisine=recipe.cuisine,
            food_type=recipe.food_type,
            cooking_time_minutes=recipe.cooking_time_minutes,
            difficulty_level=recipe.difficulty_level,
            servings=recipe.servings,
            saved_at=saved.saved_at,
        )
        for saved, recipe in result.all()
    ]


@router.get("/saved/{recipe_id}", response_model=SavedRecipeDetail)
async def get_saved_recipe(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedRecipeDetail:
    result = await db.execute(
        select(SavedRecipe, Recipe)
        .join(Recipe, Recipe.id == SavedRecipe.recipe_id)
        .where(SavedRecipe.user_id == current_user.id, SavedRecipe.recipe_id == recipe_id)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found")
    saved, recipe = row

    return SavedRecipeDetail(
        recipe_id=recipe.id,
        content=RecipeContent.model_validate(recipe.generated_content),
        food_type=recipe.food_type,
        cuisine=recipe.cuisine,
        cooking_time_minutes=recipe.cooking_time_minutes,
        difficulty_level=recipe.difficulty_level,
        saved_at=saved.saved_at,
    )


@router.delete("/saved/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
async def delete_saved_recipe(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(SavedRecipe).where(SavedRecipe.user_id == current_user.id, SavedRecipe.recipe_id == recipe_id)
    )
    saved = result.scalar_one_or_none()
    if saved is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found")

    await db.delete(saved)
    await db.commit()
