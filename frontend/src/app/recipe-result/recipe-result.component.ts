import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RecipeGenerateRequest, RecipeGenerateResponse } from '../core/models/recipe.model';
import { RecipeService } from '../core/services/recipe.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-recipe-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-result.component.html',
  styleUrl: './recipe-result.component.css',
})
export class RecipeResultComponent implements OnInit {
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private toast = inject(ToastService);

  recipe: RecipeGenerateResponse | null = null;
  request: RecipeGenerateRequest | null = null;
  saving = false;
  regenerating = false;

  ngOnInit(): void {
    const state = history.state as { recipe?: RecipeGenerateResponse; request?: RecipeGenerateRequest };
    if (!state?.recipe) {
      this.toast.error('Please generate a recipe first.');
      this.router.navigate(['/recipe-form']);
      return;
    }
    this.recipe = state.recipe;
    this.request = state.request ?? null;
  }

  saveRecipe(): void {
    if (!this.recipe || this.saving || this.recipe.is_saved) {
      return;
    }
    this.saving = true;
    this.recipeService.saveRecipe(this.recipe.id).subscribe({
      next: () => {
        this.saving = false;
        this.recipe!.is_saved = true;
        this.toast.success('Recipe saved to your cookbook!');
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        if (err.status === 409) {
          this.recipe!.is_saved = true;
          this.toast.success('Recipe already in your cookbook.');
        } else {
          this.toast.error('Could not save the recipe. Please try again.');
        }
      },
    });
  }

  regenerate(): void {
    if (!this.request || this.regenerating) {
      return;
    }
    this.regenerating = true;
    this.recipeService.generate(this.request).subscribe({
      next: (response) => {
        this.regenerating = false;
        this.recipe = response;
        history.replaceState({ recipe: response, request: this.request }, '');
      },
      error: () => {
        this.regenerating = false;
        this.toast.error('Could not regenerate the recipe. Please try again.');
      },
    });
  }

  backToForm(): void {
    this.router.navigate(['/recipe-form']);
  }
}
