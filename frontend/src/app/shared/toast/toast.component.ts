import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        (click)="toastService.dismiss(toast.id)"
      >
        {{ toast.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        max-width: 320px;
      }
      .toast {
        padding: 0.85rem 1.1rem;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-md);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        color: white;
        animation: slide-in 0.2s ease;
      }
      .toast-success {
        background: var(--color-success);
      }
      .toast-error {
        background: var(--color-danger);
      }
      .toast-info {
        background: var(--color-text);
      }
      @keyframes slide-in {
        from {
          transform: translateX(20px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
