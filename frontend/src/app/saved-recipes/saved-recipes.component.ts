import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SavedRecipeListItem } from '../core/models/recipe.model';
import { RecipeService } from '../core/services/recipe.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-saved-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-recipes.component.html',
  styleUrl: './saved-recipes.component.css',
})
export class SavedRecipesComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  recipes: SavedRecipeListItem[] = [];
  loading = true;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.recipeService.listSaved().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openRecipe(recipeId: string): void {
    this.router.navigate(['/saved-recipes', recipeId]);
  }

  deleteRecipe(event: Event, recipeId: string): void {
    event.stopPropagation();
    if (!confirm('Remove this recipe from your cookbook?')) {
      return;
    }
    this.deletingId = recipeId;
    this.recipeService.deleteSaved(recipeId).subscribe({
      next: () => {
        this.deletingId = null;
        this.recipes = this.recipes.filter((r) => r.recipe_id !== recipeId);
        this.toast.success('Recipe removed from your cookbook.');
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Could not remove the recipe. Please try again.');
      },
    });
  }
}
