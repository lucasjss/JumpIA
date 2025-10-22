// src/app/pages/agent/agent.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { FactCheckService, FactCheckRequest, FactCheckResponse } from '../../services/factcheck.service';

type TabType = 'text' | 'url' | 'file';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent, FooterComponent],
  providers: [FactCheckService],
  template: `
    <app-header></app-header>

    <main class="min-h-screen bg-gray-50 pt-24 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Detector de Fake News</h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Analise texto, URLs, imagens ou vídeos para verificar sua autenticidade
          </p>
          <p class="text-lg pt-4 text-red-600 max-w-3xl mx-auto">
            O nosso agente só consegue verificar notícias até 2024.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div class="flex flex-wrap justify-center gap-2 mb-8 border-b border-gray-200">
            <button
              (click)="activeTab = 'text'"
              [class.border-amber-600]="activeTab === 'text'"
              [class.text-amber-600]="activeTab === 'text'"
              [class.border-transparent]="activeTab !== 'text'"
              [class.text-gray-600]="activeTab !== 'text'"
              class="px-6 py-3 font-semibold border-b-2 transition-colors hover:text-amber-600"
            >
              Texto
            </button>
            <button
              (click)="activeTab = 'url'"
              [class.border-amber-600]="activeTab === 'url'"
              [class.text-amber-600]="activeTab === 'url'"
              [class.border-transparent]="activeTab !== 'url'"
              [class.text-gray-600]="activeTab !== 'url'"
              class="px-6 py-3 font-semibold border-b-2 transition-colors hover:text-amber-600"
            >
              URL
            </button>
            <button
              (click)="activeTab = 'file'"
              [class.border-amber-600]="activeTab === 'file'"
              [class.text-amber-600]="activeTab === 'file'"
              [class.border-transparent]="activeTab !== 'file'"
              [class.text-gray-600]="activeTab !== 'file'"
              class="px-6 py-3 font-semibold border-b-2 transition-colors hover:text-amber-600"
            >
              Arquivo
            </button>
          </div>

          <div *ngIf="activeTab === 'text'" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Cole o texto que deseja analisar
              </label>
              <textarea
                [(ngModel)]="textInput"
                rows="10"
                placeholder="Cole aqui o texto, notícia ou conteúdo que deseja verificar..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                [disabled]="isAnalyzing"
              ></textarea>
              <p class="text-sm text-gray-500 mt-2">{{ textInput.length }} caracteres</p>
            </div>
          </div>

          <div *ngIf="activeTab === 'url'" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Cole a URL que deseja analisar
              </label>
              <input
                type="url"
                [(ngModel)]="urlInput"
                placeholder="https://exemplo.com/noticia"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="urlInput && !isValidUrl(urlInput)"
                [disabled]="isAnalyzing"
              />
              <p *ngIf="urlInput && !isValidUrl(urlInput)" class="text-sm text-red-500 mt-2">
                URL inválida. Insira uma URL completa (ex: https://exemplo.com)
              </p>
              <p *ngIf="urlInput && isValidUrl(urlInput)" class="text-sm text-green-600 mt-2">
                URL válida
              </p>
            </div>
          </div>

          <div *ngIf="activeTab === 'file'" class="space-y-6">
            <div
              (drop)="onFileDrop($event)"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave()"
              [class.border-blue-500]="isDragging"
              [class.bg-blue-50]="isDragging"
              class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center transition-all duration-300 cursor-pointer hover:border-blue-400 hover:bg-gray-50"
            >
              <input
                #fileInput
                type="file"
                accept="image/*,video/*"
                (change)="onFileSelected($event)"
                class="hidden"
                [disabled]="isAnalyzing"
              />

              <div (click)="fileInput.click()" class="cursor-pointer">
                <div class="text-6xl mb-4">
                  <span *ngIf="!selectedFile">Arquivo</span>
                  <span *ngIf="selectedFile && selectedFile.type.startsWith('image/')">Imagem</span>
                  <span *ngIf="selectedFile && selectedFile.type.startsWith('video/')">Vídeo</span>
                </div>

                <div *ngIf="!selectedFile">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Arraste seu arquivo aqui</h3>
                  <p class="text-gray-600 mb-3">ou clique para selecionar</p>
                  <p class="text-sm text-gray-500">
                    Aceita: Imagens (JPG, PNG, GIF) e Vídeos (MP4, MOV, AVI)
                  </p>
                  <p class="text-sm text-gray-500">Tamanho máximo: 50MB</p>
                </div>

                <div *ngIf="selectedFile" class="space-y-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ selectedFile.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                  </p>
                  <p *ngIf="selectedFile.size > maxFileSize" class="text-sm text-red-500">
                    Arquivo muito grande! Máximo: 50MB
                  </p>
                  <button
                    (click)="clearFile($event)"
                    class="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Trocar arquivo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                [(ngModel)]="checkSources"
                class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                [disabled]="isAnalyzing"
              />
              <span class="text-sm text-gray-700">Buscar fontes externas (mais lento, mas mais preciso)</span>
            </label>
          </div>

          <button
            (click)="analyze()"
            [disabled]="!canAnalyze() || isAnalyzing"
            class="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span *ngIf="!isAnalyzing" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Analisar {{ getAnalyzeButtonText() }}
            </span>
            <span *ngIf="isAnalyzing" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analisando...
            </span>
          </button>

          <p *ngIf="errorMessage" class="text-center text-sm text-red-600 mt-4">
            {{ errorMessage }}
          </p>

          <p class="text-center text-sm text-gray-500 mt-4">
            A análise é feita com segurança. Seus dados não são armazenados.
          </p>
        </div>
      </div>
    </main>

    <div
      *ngIf="isAnalyzing"
      class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-16 max-w-md w-full mx-4 text-center">
        <div class="mb-8 flex justify-center">
          <div class="relative w-32 h-32">
            <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div
              class="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 border-r-orange-700 animate-spin"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center text-6xl">
              <span *ngIf="activeTab === 'text'">T</span>
              <span *ngIf="activeTab === 'url'">U</span>
              <span
                *ngIf="
                  activeTab === 'file' && selectedFile && selectedFile.type.startsWith('image/')
                "
                >I</span
              >
              <span
                *ngIf="
                  activeTab === 'file' && selectedFile && selectedFile.type.startsWith('video/')
                "
                >V</span
              >
            </div>
          </div>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-3">Analisando</h3>
        <p class="text-gray-600 mb-8 text-lg">Processando com inteligência artificial</p>
        <div class="flex justify-center items-center gap-2 mb-8">
          <div
            class="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
            style="animation-delay: 0s"
          ></div>
          <div
            class="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
        <p class="text-sm text-gray-500">Isso pode levar alguns segundos...</p>
      </div>
    </div>

    <div
      *ngIf="showResultModal && result"
      class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h2 class="text-3xl font-bold text-gray-900">Resultado da Análise</h2>
          <button
            (click)="closeResultModal()"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-8 py-6 space-y-8">
          <div
            class="border-4 rounded-2xl p-8 text-center"
            [style.border-color]="getCredibilityColor(result.overall_credibility)"
          >
            <h3 class="text-2xl font-bold mb-4">
              Credibilidade:
              <span [style.color]="getCredibilityColor(result.overall_credibility)">
                {{ getCredibilityLabel(result.overall_credibility) }}
              </span>
            </h3>
            <div class="text-5xl font-bold mb-2" [style.color]="getCredibilityColor(result.overall_credibility)">
              {{ (result.credibility_score * 100).toFixed(0) }}%
            </div>
            <p class="text-gray-600">Pontuação de Credibilidade</p>
          </div>

          <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <h4 class="text-xl font-bold text-gray-900 mb-3">Resumo</h4>
            <p class="text-gray-700 leading-relaxed">{{ result.summary }}</p>
          </div>

          <div *ngIf="result.claims && result.claims.length > 0" class="space-y-4">
            <h4 class="text-2xl font-bold text-gray-900">
              Afirmações Verificadas ({{ result.claims.length }})
            </h4>
            <div
              *ngFor="let claim of result.claims; let i = index"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-3">
                <h5 class="text-lg font-semibold text-gray-900 flex-1">{{ i + 1 }}. {{ claim.text }}</h5>
                <span
                  class="px-4 py-1 rounded-full text-sm font-semibold ml-4"
                  [ngClass]="{
                    'bg-green-100 text-green-800': claim.veracity === 'true',
                    'bg-red-100 text-red-800': claim.veracity === 'false',
                    'bg-yellow-100 text-yellow-800': claim.veracity === 'partially_true',
                    'bg-gray-100 text-gray-800': claim.veracity === 'unverifiable'
                  }"
                >
                  {{ getVeracityLabel(claim.veracity) }}
                </span>
              </div>
              <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-gray-700">Confiança:</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      [style.width.%]="claim.confidence * 100"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">{{ (claim.confidence * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <p class="text-gray-700 leading-relaxed">{{ claim.explanation }}</p>
            </div>
          </div>

          <div *ngIf="result.red_flags && result.red_flags.length > 0" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
            <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Sinais de Alerta ({{ result.red_flags.length }})</span>
            </h4>
            <ul class="space-y-2">
              <li *ngFor="let flag of result.red_flags" class="flex items-start gap-2">
                <span class="text-yellow-600 mt-1">▸</span>
                <span class="text-gray-700">{{ flag }}</span>
              </li>
            </ul>
          </div>

          <div *ngIf="result.sources_checked && result.sources_checked.length > 0" class="space-y-4">
            <h4 class="text-2xl font-bold text-gray-900">
              Fontes Consultadas ({{ result.sources_checked.length }})
            </h4>
            <div
              *ngFor="let source of result.sources_checked"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-2">
                <h5 class="text-lg font-semibold text-gray-900 flex-1">{{ source.title }}</h5>
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold ml-4"
                  [ngClass]="{
                    'bg-green-100 text-green-800': source.credibility === 'high',
                    'bg-yellow-100 text-yellow-800': source.credibility === 'medium',
                    'bg-red-100 text-red-800': source.credibility === 'low'
                  }"
                >
                  {{ getCredibilityLabel(source.credibility) }}
                </span>
              </div>
              <p class="text-gray-600 text-sm mb-3">{{ source.summary }}</p>
              <a
                [href]="source.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
              >
                Visitar fonte
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div class="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>Tempo de processamento: {{ result.processing_time.toFixed(2) }}s</p>
            <p class="mt-1">Análise realizada em: {{ formatTimestamp(result.timestamp) }}</p>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-3xl">
          <button
            (click)="closeResultModal()"
            class="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Fazer Nova Análise
          </button>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
})
export class AgentComponent {
  private factCheckService = inject(FactCheckService);

  activeTab: TabType = 'text';
  textInput: string = '';
  urlInput: string = '';
  selectedFile: File | null = null;
  isDragging: boolean = false;
  isAnalyzing: boolean = false;
  showResultModal: boolean = false;
  result: FactCheckResponse | null = null;
  errorMessage: string = '';
  checkSources: boolean = true;

  maxFileSize = 50 * 1024 * 1024;

  canAnalyze(): boolean {
    if (this.activeTab === 'text') {
      return this.textInput.trim().length >= 10;
    } else if (this.activeTab === 'url') {
      return this.urlInput.trim().length > 0 && this.isValidUrl(this.urlInput);
    } else if (this.activeTab === 'file') {
      return this.selectedFile !== null && this.selectedFile.size <= this.maxFileSize;
    }
    return false;
  }

  getAnalyzeButtonText(): string {
    switch (this.activeTab) {
      case 'text':
        return 'Texto';
      case 'url':
        return 'URL';
      case 'file':
        return 'Arquivo';
      default:
        return '';
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getCredibilityColor(credibility: string): string {
    switch (credibility.toLowerCase()) {
      case 'high':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#ef4444';
      case 'very_low':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  }

  getCredibilityLabel(credibility: string): string {
    const labels: any = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
      very_low: 'Muito Baixa',
      unverifiable: 'Não Verificável',
    };
    return labels[credibility] || credibility;
  }

  getVeracityLabel(veracity: string): string {
    const labels: any = {
      true: 'Verdadeiro',
      false: 'Falso',
      partially_true: 'Parcialmente Verdadeiro',
      unverifiable: 'Não Verificável',
    };
    return labels[veracity] || veracity;
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('pt-BR');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  clearFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFile = null;
  }

  analyze(): void {
    if (!this.canAnalyze()) return;

    this.isAnalyzing = true;
    this.errorMessage = '';

    if (this.activeTab === 'text' || this.activeTab === 'url') {
      this.analyzeTextOrUrl();
    } else if (this.activeTab === 'file') {
      this.analyzeFile();
    }
  }

  analyzeTextOrUrl(): void {
    const contentType: 'text' | 'url' = this.activeTab === 'text' ? 'text' : 'url';
    const request: FactCheckRequest = {
      content: this.activeTab === 'text' ? this.textInput : this.urlInput,
      content_type: contentType,
      check_sources: this.checkSources,
      language: 'pt',
    };

    const endpoint = this.checkSources
      ? this.factCheckService.checkFacts(request)
      : this.factCheckService.quickCheck(request);

    endpoint.subscribe({
      next: (response) => {
        this.result = response;
        this.isAnalyzing = false;
        this.showResultModal = true;
      },
      error: (error) => {
        console.error('Erro na análise:', error);
        this.errorMessage = error.error?.detail || 'Erro ao analisar. Tente novamente.';
        this.isAnalyzing = false;
      },
    });
  }

  analyzeFile(): void {
    if (!this.selectedFile) return;

    this.factCheckService.uploadFile(this.selectedFile, this.checkSources, 'pt').subscribe({
      next: (response) => {
        this.result = response;
        this.isAnalyzing = false;
        this.showResultModal = true;
      },
      error: (error) => {
        console.error('Erro na análise:', error);
        this.errorMessage = error.error?.detail || 'Erro ao analisar arquivo. Tente novamente.';
        this.isAnalyzing = false;
      },
    });
  }

  closeResultModal(): void {
    this.showResultModal = false;
    this.result = null;
    this.textInput = '';
    this.urlInput = '';
    this.selectedFile = null;
    this.errorMessage = '';
  }
}

