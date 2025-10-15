import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section id="how-it-works" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p class="text-xl text-gray-600">Processo simples e eficiente em 4 etapas</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div *ngFor="let step of steps" class="text-center">
            <div class="relative mb-6">
              <div
                class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl shadow-lg"
              >
                {{ step.icon }}
              </div>
              <div
                class="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <span class="text-2xl font-bold text-gray-900">{{ step.step }}</span>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-3">{{ step.title }}</h3>
            <p class="text-gray-600">{{ step.description }}</p>
          </div>
        </div>

        <div class="text-center mt-12">
          <button
            routerLink="/agent"
            class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
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
}
