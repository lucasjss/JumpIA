import { Component } from '@angular/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <section class="py-20 bg-gradient-to-r from-amber-600 to-orange-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8 text-center text-white">
          <div>
            <div class="text-5xl font-bold mb-2">95%</div>
            <p class="text-xl opacity-90">Taxa de Precisão</p>
          </div>
          <div>
            <div class="text-5xl font-bold mb-2">&lt;2s</div>
            <p class="text-xl opacity-90">Tempo de Análise</p>
          </div>
          <div>
            <div class="text-5xl font-bold mb-2">24/7</div>
            <p class="text-xl opacity-90">Disponibilidade</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class StatsComponent {}
