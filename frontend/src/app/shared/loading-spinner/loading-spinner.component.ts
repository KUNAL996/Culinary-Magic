import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';

import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay" *ngIf="!inline && loadingService.isLoading()">
      <div class="spinner"></div>
    </div>
    <div class="spinner-inline" *ngIf="inline">
      <div class="spinner"></div>
      <span *ngIf="label">{{ label }}</span>
    </div>
  `,
  styles: [
    `
      .spinner-overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 249, 242, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .spinner-inline {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        color: var(--color-text-muted);
      }
      .spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--color-primary-light);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      .spinner-inline .spinner {
        width: 1.2rem;
        height: 1.2rem;
        border-width: 2px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() inline = false;
  @Input() label = '';
  loadingService = inject(LoadingService);
}
