// src/app/pages/agent/agent.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

type TabType = 'text' | 'url' | 'file';

interface AnalysisResult {
  type: string;
  verdict: 'authentic' | 'fake' | 'uncertain';
  confidence: number;
  explanation: string;
  timestamp: Date;
}

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent, FooterComponent],
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
              📝 Texto
            </button>
            <button
              (click)="activeTab = 'url'"
              [class.border-amber-600]="activeTab === 'url'"
              [class.text-amber-600]="activeTab === 'url'"
              [class.border-transparent]="activeTab !== 'url'"
              [class.text-gray-600]="activeTab !== 'url'"
              class="px-6 py-3 font-semibold border-b-2 transition-colors hover:text-amber-600"
            >
              🔗 URL
            </button>
            <button
              (click)="activeTab = 'file'"
              [class.border-amber-600]="activeTab === 'file'"
              [class.text-amber-600]="activeTab === 'file'"
              [class.border-transparent]="activeTab !== 'file'"
              [class.text-gray-600]="activeTab !== 'file'"
              class="px-6 py-3 font-semibold border-b-2 transition-colors hover:text-amber-600"
            >
              📁 Arquivo
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
                ⚠️ URL inválida. Insira uma URL completa (ex: https://exemplo.com)
              </p>
              <p *ngIf="urlInput && isValidUrl(urlInput)" class="text-sm text-green-600 mt-2">
                ✓ URL válida
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
                  <span *ngIf="!selectedFile">📁</span>
                  <span *ngIf="selectedFile && selectedFile.type.startsWith('image/')">🖼️</span>
                  <span *ngIf="selectedFile && selectedFile.type.startsWith('video/')">🎥</span>
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
                    ⚠️ Arquivo muito grande! Máximo: 50MB
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

          <p class="text-center text-sm text-gray-500 mt-4">
            🔒 A análise é feita com segurança. Seus dados não são armazenados.
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
              <span *ngIf="activeTab === 'text'">📝</span>
              <span *ngIf="activeTab === 'url'">🔗</span>
              <span
                *ngIf="
                  activeTab === 'file' && selectedFile && selectedFile.type.startsWith('image/')
                "
                >🖼️</span
              >
              <span
                *ngIf="
                  activeTab === 'file' && selectedFile && selectedFile.type.startsWith('video/')
                "
                >🎥</span
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
            class="w-3 h-3 bg-orange-700 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
        <p class="text-sm text-gray-500">Por favor, aguarde...</p>
      </div>
    </div>

    <div
      *ngIf="showResultModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Resultado da Análise</h2>
          <button
            (click)="closeResultModal()"
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div class="p-8">
          <div class="text-center mb-8">
            <div class="text-7xl mb-4">
              <span *ngIf="result?.verdict === 'authentic'">✅</span>
              <span *ngIf="result?.verdict === 'fake'">❌</span>
              <span *ngIf="result?.verdict === 'uncertain'">⚠️</span>
            </div>

            <h3
              class="text-3xl font-bold mb-2"
              [ngClass]="{
                'text-green-600': result?.verdict === 'authentic',
                'text-red-600': result?.verdict === 'fake',
                'text-yellow-600': result?.verdict === 'uncertain'
              }"
            >
              {{ getVerdictText() }}
            </h3>

            <div class="inline-block bg-gray-100 px-6 py-3 rounded-lg mb-6">
              <p class="text-sm text-gray-600 mb-1">Nível de Confiança</p>
              <p class="text-3xl font-bold text-gray-900">{{ result?.confidence }}%</p>
            </div>
          </div>

          <div class="mb-8">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Confiança na Análise</span>
              <span class="text-sm text-gray-500">{{ result?.confidence }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-500"
                [ngClass]="{
                  'bg-green-500': result?.verdict === 'authentic',
                  'bg-red-500': result?.verdict === 'fake',
                  'bg-yellow-500': result?.verdict === 'uncertain'
                }"
                [style.width.%]="result?.confidence"
              ></div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 class="font-semibold text-gray-900 mb-3">Explicação da Análise</h4>
            <p class="text-gray-700 leading-relaxed">{{ result?.explanation }}</p>
          </div>

          <div class="border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-600 mb-2"><strong>Tipo:</strong> {{ result?.type }}</p>
            <p class="text-sm text-gray-600">
              <strong>Analisado em:</strong> {{ result?.timestamp | date : 'dd/MM/yyyy HH:mm:ss' }}
            </p>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              (click)="closeResultModal()"
              class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Nova Análise
            </button>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
})
export class AgentComponent {
  activeTab: TabType = 'text';

  // Text inputs
  textInput = '';
  urlInput = '';

  // File inputs
  selectedFile: File | null = null;
  isDragging = false;
  maxFileSize = 50 * 1024 * 1024; // 50MB in bytes

  // Analysis state
  isAnalyzing = false;
  showResultModal = false;
  result: AnalysisResult | null = null;

  constructor(private http: HttpClient) {}

  // Validation
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'httpsA:';
    } catch {
      return false;
    }
  }

  canAnalyze(): boolean {
    switch (this.activeTab) {
      case 'text':
        return this.textInput.trim().length > 0;
      case 'url':
        return this.urlInput.trim().length > 0 && this.isValidUrl(this.urlInput);
      case 'file':
        return this.selectedFile !== null && this.selectedFile.size <= this.maxFileSize;
      default:
        return false;
    }
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

  getVerdictText(): string {
    switch (this.result?.verdict) {
      case 'authentic':
        return 'Conteúdo Autêntico';
      case 'fake':
        return 'Possível Fake News';
      case 'uncertain':
        return 'Resultado Incerto';
      default:
        return '';
    }
  }

  // File handlers
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

  // Analysis
  analyze(): void {
    if (!this.canAnalyze()) return;

    this.isAnalyzing = true;

    if (this.activeTab === 'text' || this.activeTab === 'url') {
      this.analyzeTextOrUrl();
    } else if (this.activeTab === 'file') {
      this.analyzeFile();
    }
  }

  analyzeTextOrUrl(): void {
    // Endpoint para texto e URL
    const payload =
      this.activeTab === 'text'
        ? { type: 'text', content: this.textInput }
        : { type: 'url', content: this.urlInput };

    // Descomentar quando tiver o backend pronto:
    // this.http.post<AnalysisResult>('/api/analyze/text', payload).subscribe({
    //   next: (response) => {
    //     this.result = response;
    //     this.isAnalyzing = false;
    //     this.showResultModal = true;
    //   },
    //   error: (error) => {
    //     console.error('Erro na análise:', error);
    //     this.isAnalyzing = false;
    //     alert('Erro ao analisar. Tente novamente.');
    //   }
    // });

    // Remover timeout quando integrar com backend
    setTimeout(() => {
      this.isAnalyzing = false;
      console.log('Análise concluída (frontend-only):', payload);
    }, 2000);
  }

  analyzeFile(): void {
    if (!this.selectedFile) return;

    // Endpoint para imagem e vídeo
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Descomentar quando tiver o backend pronto:
    // this.http.post<AnalysisResult>('/api/analyze/file', formData).subscribe({
    //   next: (response) => {
    //     this.result = response;
    //     this.isAnalyzing = false;
    //     this.showResultModal = true;
    //   },
    //   error: (error) => {
    //     console.error('Erro na análise:', error);
    //     this.isAnalyzing = false;
    //     alert('Erro ao analisar. Tente novamente.');
    //   }
    // });

    // Remover timeout quando integrar com backend
    setTimeout(() => {
      this.isAnalyzing = false;
      console.log('Análise concluída (frontend-only). File:', this.selectedFile?.name);
    }, 2000);
  }

  closeResultModal(): void {
    this.showResultModal = false;
    this.result = null;
    this.textInput = '';
    this.urlInput = '';
    this.selectedFile = null;
  }
}
