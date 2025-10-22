// src/app/components/footer/footer.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Brand Column -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center space-x-2 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center"
              >
                <span class="text-white font-bold text-xl">J</span>
              </div>
              <span class="text-xl font-bold">Jump IA</span>
            </div>
            <p class="text-gray-400 mb-4 max-w-md">
              Combatendo desinformação com tecnologia de inteligência artificial avançada. Nosso
              objetivo é criar um ambiente digital mais seguro e confiável para todos.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul class="space-y-2">
              <li>
                <a
                  (click)="scrollToSection('hero')"
                  class="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  (click)="scrollToSection('mission')"
                  class="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Missão
                </a>
              </li>
              <li>
                <a
                  (click)="scrollToSection('how-it-works')"
                  class="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Como Funciona
                </a>
              </li>
              <li>
                <a
                  routerLink="/agent"
                  class="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Testar Agente
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Projeto</h3>
            <ul class="space-y-2 text-gray-400">
              <li>Projeto Acadêmico</li>
              <li>Universidade</li>
              <li>2024/2025</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }
}
