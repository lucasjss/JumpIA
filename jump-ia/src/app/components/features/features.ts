import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Recursos Principais</h2>
        </div>

        <div class="relative max-w-4xl mx-auto">
          <div
            class="bg-white rounded-2xl shadow-2xl p-12 text-center min-h-[300px] flex flex-col justify-center"
          >
            <div class="text-7xl mb-6">{{ features[currentIndex].icon }}</div>
            <h3 class="text-3xl font-bold mb-4">{{ features[currentIndex].title }}</h3>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              {{ features[currentIndex].description }}
            </p>
          </div>

          <button
            (click)="previous()"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            (click)="next()"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div class="flex justify-center gap-2 mt-8">
            <button
              *ngFor="let feature of features; let i = index"
              (click)="goTo(i)"
              [class.bg-blue-600]="i === currentIndex"
              [class.bg-gray-300]="i !== currentIndex"
              class="w-3 h-3 rounded-full transition-all duration-300"
            ></button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FeaturesComponent {
  currentIndex = 0;

  features = [
    {
      icon: '📝',
      title: 'Análise de Texto',
      description: 'Detecte notícias falsas e desinformação em textos',
    },
    {
      icon: '🖼️',
      title: 'Detecção de Deepfakes',
      description: 'Identifique imagens manipuladas e rostos gerados por IA',
    },
    {
      icon: '🎥',
      title: 'Verificação de Vídeos',
      description: 'Detecte manipulações e conteúdo sintético em vídeos',
    },
    {
      icon: '⚡',
      title: 'Análise em Tempo Real',
      description: 'Resultados instantâneos com processamento rápido',
    },
    { icon: '🔒', title: 'Privacidade Garantida', description: 'Dados processados com segurança' },
    {
      icon: '📊',
      title: 'Relatórios Detalhados',
      description: 'Análises completas com explicações detalhadas',
    },
  ];

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.features.length;
  }
  previous(): void {
    this.currentIndex = this.currentIndex === 0 ? this.features.length - 1 : this.currentIndex - 1;
  }
  goTo(index: number): void {
    this.currentIndex = index;
  }
}
