export type FoodType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Beverage';
export type Cuisine = 'Indian' | 'Italian' | 'Chinese' | 'Mexican' | 'Continental' | 'Any';
export type DietaryRestriction =
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Nut-Free'
  | 'No Restriction';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export const FOOD_TYPES: FoodType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage'];
export const CUISINES: Cuisine[] = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Continental', 'Any'];
export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'No Restriction',
];
export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

export const COOKING_TIME_OPTIONS: { label: string; value: number }[] = [
  { label: 'Under 15 min', value: 15 },
  { label: '15 - 30 min', value: 30 },
  { label: '30 - 60 min', value: 60 },
  { label: '60+ min', value: 120 },
];

export interface RecipeGenerateRequest {
  food_type: FoodType;
  ingredients: string[];
  cooking_time_minutes: number;
  cuisine: Cuisine;
  dietary_restrictions: DietaryRestriction[];
  servings: number;
  difficulty_level: DifficultyLevel;
  additional_notes?: string | null;
}

export interface RecipeIngredientItem {
  name: string;
  quantity: string;
}

export interface NutritionEstimate {
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
}

export interface RecipeContent {
  title: string;
  description: string;
  ingredients_list: RecipeIngredientItem[];
  steps: string[];
  cooking_time: string;
  servings: number;
  nutrition_estimate: NutritionEstimate;
  tips: string[];
}

export interface RecipeGenerateResponse {
  id: string;
  content: RecipeContent;
  food_type: string;
  cuisine: string;
  cooking_time_minutes: number;
  difficulty_level: string;
  is_saved: boolean;
}

export interface SavedRecipeListItem {
  recipe_id: string;
  title: string;
  cuisine: string;
  food_type: string;
  cooking_time_minutes: number;
  difficulty_level: string;
  servings: number;
  saved_at: string;
}

export interface SavedRecipeDetail {
  recipe_id: string;
  content: RecipeContent;
  food_type: string;
  cuisine: string;
  cooking_time_minutes: number;
  difficulty_level: string;
  saved_at: string;
}
