import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>🍳 Culinary Magic &mdash; AI-powered recipes, made just for you.</p>
    </footer>
  `,
  styles: [
    `
      .footer {
        text-align: center;
        padding: 1.5rem 1rem;
        color: var(--color-text-muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class FooterComponent {}
