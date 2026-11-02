import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FoodType = Literal["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage"]
Cuisine = Literal["Indian", "Italian", "Chinese", "Mexican", "Continental", "Any"]
DietaryRestriction = Literal["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "No Restriction"]
DifficultyLevel = Literal["Easy", "Medium", "Hard"]


class RecipeGenerateRequest(BaseModel):
    food_type: FoodType
    ingredients: list[str] = Field(min_length=1)
    cooking_time_minutes: int = Field(gt=0, le=600)
    cuisine: Cuisine
    dietary_restrictions: list[DietaryRestriction] = Field(default_factory=list)
    servings: int = Field(gt=0, le=50)
    difficulty_level: DifficultyLevel
    additional_notes: str | None = Field(default=None, max_length=500)


class RecipeIngredientItem(BaseModel):
    name: str
    quantity: str


class NutritionEstimate(BaseModel):
    calories: str
    protein: str
    carbohydrates: str
    fat: str


class RecipeContent(BaseModel):
    """Structured shape we ask the LLM to return, and validate its response against."""

    title: str
    description: str
    ingredients_list: list[RecipeIngredientItem]
    steps: list[str]
    cooking_time: str
    servings: int
    nutrition_estimate: NutritionEstimate
    tips: list[str] = Field(default_factory=list)


class RecipeGenerateResponse(BaseModel):
    id: uuid.UUID
    content: RecipeContent
    food_type: str
    cuisine: str
    cooking_time_minutes: int
    difficulty_level: str
    is_saved: bool = False


class SavedRecipeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recipe_id: uuid.UUID
    title: str
    cuisine: str
    food_type: str
    cooking_time_minutes: int
    difficulty_level: str
    servings: int
    saved_at: datetime


class SavedRecipeDetail(BaseModel):
    recipe_id: uuid.UUID
    content: RecipeContent
    food_type: str
    cuisine: str
    cooking_time_minutes: int
    difficulty_level: str
    saved_at: datetime
