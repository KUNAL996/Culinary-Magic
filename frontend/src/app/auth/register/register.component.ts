import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { passwordsMatchValidator, passwordStrengthValidator } from '../validators/auth.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../auth.shared.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  submitting = false;
  serverError = '';

  form = this.fb.group(
    {
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('password', 'confirm_password') },
  );

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { full_name, email, password, confirm_password } = this.form.getRawValue();
    this.authService
      .register({
        full_name: full_name!,
        email: email!,
        password: password!,
        confirm_password: confirm_password!,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.toast.success('Welcome to Culinary Magic!');
          this.router.navigate(['/recipe-form']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          this.serverError = this.extractError(err);
        },
      });
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 409) {
      return 'An account with this email already exists.';
    }
    const detail = err.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length) {
      return detail[0]?.msg ?? 'Please check your details and try again.';
    }
    return 'Registration failed. Please try again.';
  }
}
