import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SavedRecipeDetail } from '../core/models/recipe.model';
import { RecipeService } from '../core/services/recipe.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-saved-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-recipe-detail.component.html',
  styleUrl: '../recipe-result/recipe-result.component.css',
})
export class SavedRecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private toast = inject(ToastService);

  recipe: SavedRecipeDetail | null = null;
  loading = true;
  deleting = false;

  ngOnInit(): void {
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (!recipeId) {
      this.router.navigate(['/saved-recipes']);
      return;
    }
    this.recipeService.getSavedDetail(recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Recipe not found.');
        this.router.navigate(['/saved-recipes']);
      },
    });
  }

  deleteRecipe(): void {
    if (!this.recipe || !confirm('Remove this recipe from your cookbook?')) {
      return;
    }
    this.deleting = true;
    this.recipeService.deleteSaved(this.recipe.recipe_id).subscribe({
      next: () => {
        this.deleting = false;
        this.toast.success('Recipe removed from your cookbook.');
        this.router.navigate(['/saved-recipes']);
      },
      error: () => {
        this.deleting = false;
        this.toast.error('Could not remove the recipe. Please try again.');
      },
    });
  }

  backToList(): void {
    this.router.navigate(['/saved-recipes']);
  }
}
