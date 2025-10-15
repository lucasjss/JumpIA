import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],
  template: `
    <section id="hero" class="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Detecte
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
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
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Testar Agora - Grátis
            </button>
            <button
              (click)="scrollToSection('how-it-works')"
              class="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        <div class="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <div class="text-5xl mb-3">📝</div>
            <h3 class="font-bold text-lg mb-2">Texto</h3>
            <p class="text-gray-600 text-sm">Analise notícias e conteúdo escrito</p>
          </div>
          <div
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <div class="text-5xl mb-3">🖼️</div>
            <h3 class="font-bold text-lg mb-2">Imagem</h3>
            <p class="text-gray-600 text-sm">Detecte deepfakes e manipulações</p>
          </div>
          <div
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <div class="text-5xl mb-3">🎥</div>
            <h3 class="font-bold text-lg mb-2">Vídeo</h3>
            <p class="text-gray-600 text-sm">Verifique autenticidade de vídeos</p>
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
