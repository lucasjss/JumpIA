import { Component } from '@angular/core';

@Component({
  selector: 'app-mission',
  standalone: true,
  template: `
    <section id="mission" class="py-10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Combater a desinformação e criar um ambiente digital mais seguro
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            class="text-center p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl hover:shadow-xl transition-all duration-300"
          >
            <div
              class="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            >
              🛡️
            </div>
            <h3 class="text-2xl font-bold mb-4">Proteger</h3>
            <p class="text-gray-700">Proteger contra conteúdo falso e manipulado</p>
          </div>
          <div
            class="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:shadow-xl transition-all duration-300"
          >
            <div
              class="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            >
              🔍
            </div>
            <h3 class="text-2xl font-bold mb-4">Detectar</h3>
            <p class="text-gray-700">Identificar conteúdo gerado por IA em tempo real</p>
          </div>
          <div
            class="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-xl transition-all duration-300"
          >
            <div
              class="w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            >
              📚
            </div>
            <h3 class="text-2xl font-bold mb-4">Educar</h3>
            <p class="text-gray-700">Conscientizar sobre os riscos da desinformação</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class MissionComponent {}
