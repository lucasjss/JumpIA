import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterModule],
  template: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Pronto para começar?</h2>
        <p class="text-xl text-gray-600 mb-8">Experimente gratuitamente nossa tecnologia</p>
        <button
          routerLink="/agent"
          class="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-12 py-5 rounded-lg text-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Testar Agora
        </button>
      </div>
    </section>
  `,
})
export class CtaComponent {}
