// src/app/components/hero/hero.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],
  template: `
    <section id="hero" class="pt-24 pb-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Logo/Favicon -->
          <div class="flex justify-center">
            <img
              src="/favicon.ico"
              alt="Jump IA Logo"
              class="w-24 h-24 md:w-32 md:h-32 drop-shadow-xl"
            />
          </div>

          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Detecte
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700"
            >
              Fake News
            </span>
            <br />com Inteligência Artificial
          </h1>

          <p class="text-xl md:text-2xl text-gray-600 mb-8">
            Verifique a autenticidade de textos, imagens e vídeos com tecnologia de ponta
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              routerLink="/agent"
              class="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Testar Agora - Grátis
            </button>
            <button
              (click)="scrollToSection('how-it-works')"
              class="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300"
            >
              Saiba Mais
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  scrollToSection(sectionId: string): void {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }
}
