import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'recipe-form' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'recipe-form',
    loadComponent: () => import('./recipe-form/recipe-form.component').then((m) => m.RecipeFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'recipe-result',
    loadComponent: () => import('./recipe-result/recipe-result.component').then((m) => m.RecipeResultComponent),
    canActivate: [authGuard],
  },
  {
    path: 'saved-recipes',
    loadComponent: () => import('./saved-recipes/saved-recipes.component').then((m) => m.SavedRecipesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'saved-recipes/:id',
    loadComponent: () =>
      import('./saved-recipes/saved-recipe-detail.component').then((m) => m.SavedRecipeDetailComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'recipe-form' },
];
