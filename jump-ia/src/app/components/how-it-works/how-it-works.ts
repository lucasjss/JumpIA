import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section id="how-it-works" class="py-16 lg:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p class="text-lg md:text-xl text-gray-600">Processo simples e eficiente em 4 etapas</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          <div *ngFor="let step of steps; trackBy: trackByStep" class="text-center">
            <div class="relative mb-6 w-20 h-20 md:w-24 md:h-24 mx-auto">
              <div
                class="w-full h-full bg-gradient-to-br from-amber-500 to-orange-700 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl shadow-lg"
              >
                {{ step.icon }}
              </div>

              <div
                class="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <span class="text-xl md:text-2xl font-bold text-gray-900">{{ step.step }}</span>
              </div>
            </div>

            <h3 class="text-lg md:text-xl font-bold mb-3">{{ step.title }}</h3>
            <p class="text-gray-600">{{ step.description }}</p>
          </div>
        </div>

        <div class="text-center mt-16">
          <button
            routerLink="/agent"
            class="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-3 text-base md:px-8 md:py-4 md:text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-lg"
          >
            Experimentar Agora
          </button>
        </div>
      </div>
    </section>
  `,
})
export class HowItWorksComponent {
  steps = [
    {
      step: '1',
      title: 'Upload',
      description: 'Envie seu arquivo através da interface',
      icon: '📤',
    },
    { step: '2', title: 'Processamento', description: 'IA analisa o conteúdo', icon: '🤖' },
    { step: '3', title: 'Verificação', description: 'Validação com fontes confiáveis', icon: '🔍' },
    { step: '4', title: 'Resultado', description: 'Receba o veredito detalhado', icon: '✅' },
  ];

  // Função trackBy para otimizar o *ngFor
  trackByStep(index: number, step: any): string {
    return step.step;
  }
}
