import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  RecipeGenerateRequest,
  RecipeGenerateResponse,
  SavedRecipeDetail,
  SavedRecipeListItem,
} from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly baseUrl = `${environment.apiBaseUrl}/recipes`;

  constructor(private http: HttpClient) {}

  generate(data: RecipeGenerateRequest): Observable<RecipeGenerateResponse> {
    return this.http.post<RecipeGenerateResponse>(`${this.baseUrl}/generate`, data, { withCredentials: true });
  }

  saveRecipe(recipeId: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(
      `${this.baseUrl}/${recipeId}/save`,
      {},
      { withCredentials: true },
    );
  }

  listSaved(): Observable<SavedRecipeListItem[]> {
    return this.http.get<SavedRecipeListItem[]>(`${this.baseUrl}/saved`, { withCredentials: true });
  }

  getSavedDetail(recipeId: string): Observable<SavedRecipeDetail> {
    return this.http.get<SavedRecipeDetail>(`${this.baseUrl}/saved/${recipeId}`, { withCredentials: true });
  }

  deleteSaved(recipeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/saved/${recipeId}`, { withCredentials: true });
  }
}
