import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  COOKING_TIME_OPTIONS,
  CUISINES,
  DIETARY_RESTRICTIONS,
  DIFFICULTY_LEVELS,
  DietaryRestriction,
  DifficultyLevel,
  FOOD_TYPES,
} from '../core/models/recipe.model';
import { RecipeService } from '../core/services/recipe.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css',
})
export class RecipeFormComponent {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly foodTypes = FOOD_TYPES;
  readonly cuisines = CUISINES;
  readonly dietaryOptions = DIETARY_RESTRICTIONS;
  readonly difficultyLevels = DIFFICULTY_LEVELS;
  readonly cookingTimeOptions = COOKING_TIME_OPTIONS;

  submitting = false;
  ingredientInput = '';

  form = this.fb.group({
    food_type: ['', Validators.required],
    ingredients: this.fb.array<FormControl<string>>([], [Validators.required, this.minLengthArray(1)]),
    cooking_time_minutes: [30, Validators.required],
    cuisine: ['', Validators.required],
    dietary_restrictions: this.fb.control<DietaryRestriction[]>([], { nonNullable: true }),
    servings: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
    difficulty_level: ['' as DifficultyLevel | '', Validators.required],
    additional_notes: ['', Validators.maxLength(500)],
  });

  get f() {
    return this.form.controls;
  }

  get ingredients(): FormArray<FormControl<string>> {
    return this.form.controls.ingredients;
  }

  private minLengthArray(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      return arr.length >= min ? null : { minLengthArray: true };
    };
  }

  addIngredient(): void {
    const value = this.ingredientInput.trim();
    if (!value) {
      return;
    }
    const exists = this.ingredients.controls.some((c) => c.value.toLowerCase() === value.toLowerCase());
    if (!exists) {
      this.ingredients.push(this.fb.control(value, { nonNullable: true }));
    }
    this.ingredientInput = '';
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  onIngredientKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addIngredient();
    }
  }

  toggleDietary(option: DietaryRestriction, checked: boolean): void {
    const control = this.form.controls.dietary_restrictions;
    let current = [...control.value];

    if (option === 'No Restriction') {
      current = checked ? ['No Restriction'] : [];
    } else {
      current = current.filter((o) => o !== 'No Restriction');
      if (checked) {
        current.push(option);
      } else {
        current = current.filter((o) => o !== option);
      }
    }
    control.setValue(current);
  }

  isDietaryChecked(option: DietaryRestriction): boolean {
    return this.form.controls.dietary_restrictions.value.includes(option);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ingredients.markAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();

    this.recipeService
      .generate({
        food_type: raw.food_type as any,
        ingredients: raw.ingredients,
        cooking_time_minutes: raw.cooking_time_minutes!,
        cuisine: raw.cuisine as any,
        dietary_restrictions: raw.dietary_restrictions,
        servings: raw.servings!,
        difficulty_level: raw.difficulty_level as DifficultyLevel,
        additional_notes: raw.additional_notes || null,
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.router.navigate(['/recipe-result'], { state: { recipe: response, request: raw } });
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          const detail = typeof err.error?.detail === 'string' ? err.error.detail : null;
          this.toast.error(detail || 'Could not generate a recipe. Please try again.');
        },
      });
  }
}
