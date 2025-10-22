// src/app/components/header/header.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-2 cursor-pointer" routerLink="/">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/favicon.ico" alt="" />
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent"
            >
              Jump IA
            </span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a
              (click)="scrollToSection('hero')"
              class="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer font-medium"
            >
              Início
            </a>
            <a
              (click)="scrollToSection('mission')"
              class="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer font-medium"
            >
              Missão
            </a>
            <a
              (click)="scrollToSection('how-it-works')"
              class="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer font-medium"
            >
              Como Funciona
            </a>
            <a
              (click)="scrollToSection('features')"
              class="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer font-medium"
            >
              Recursos
            </a>
          </div>

          <!-- CTA Button -->
          <button
            routerLink="/agent"
            class="hidden md:block bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Testar Agora
          </button>

          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMenu()"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                [attr.d]="isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        <div *ngIf="isMenuOpen" class="md:hidden py-4 border-t border-gray-200">
          <div class="flex flex-col space-y-3">
            <a
              (click)="scrollToSection('hero'); toggleMenu()"
              class="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Início
            </a>
            <a
              (click)="scrollToSection('mission'); toggleMenu()"
              class="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Missão
            </a>
            <a
              (click)="scrollToSection('how-it-works'); toggleMenu()"
              class="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Como Funciona
            </a>
            <a
              (click)="scrollToSection('features'); toggleMenu()"
              class="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              Recursos
            </a>
            <button
              routerLink="/agent"
              class="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-center"
            >
              Testar Agora
            </button>
          </div>
        </div>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

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
