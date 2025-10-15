// src/app/pages/agent/agent.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>

    <main class="min-h-screen bg-gray-50 pt-24 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Detector de Fake News</h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Envie um arquivo para analisar sua autenticidade com nossa IA
          </p>
        </div>

        <!-- Upload Area -->
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <!-- Upload Container -->
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
              accept="image/*,video/*,.txt,.pdf"
              (change)="onFileSelected($event)"
              class="hidden"
              [disabled]="isAnalyzing"
            />

            <div (click)="fileInput.click()" class="cursor-pointer">
              <div class="text-6xl mb-4">
                <span *ngIf="!selectedFile">📁</span>
                <span *ngIf="selectedFile && selectedFile.type.startsWith('image/')">🖼️</span>
                <span *ngIf="selectedFile && selectedFile.type.startsWith('video/')">🎥</span>
                <span
                  *ngIf="
                    selectedFile &&
                    (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf')
                  "
                  >📄</span
                >
              </div>

              <div *ngIf="!selectedFile">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Arraste seu arquivo aqui</h3>
                <p class="text-gray-600 mb-3">ou clique para selecionar</p>
                <p class="text-sm text-gray-500">
                  Aceita: Imagens (JPG, PNG), Vídeos (MP4, MOV), Texto (TXT, PDF)
                </p>
              </div>

              <!-- Arquivo Selecionado -->
              <div *ngIf="selectedFile" class="space-y-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ selectedFile.name }}</h3>
                <p class="text-sm text-gray-600">
                  {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
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

          <!-- Analyze Button -->
          <button
            (click)="analyzeFile()"
            [disabled]="!selectedFile || isAnalyzing"
            class="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              Analisar Arquivo
            </span>
            <span
              *ngIf="isAnalyzing"
              class="flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
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

          <!-- Info Message -->
          <p class="text-center text-sm text-gray-500 mt-4">
            A análise é feita com segurança. Seus arquivos não são armazenados.
          </p>
        </div>
      </div>
    </main>

    <!-- Loading Screen -->
    <div
      *ngIf="isAnalyzing"
      class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-16 max-w-md w-full mx-4 text-center">
        <!-- Animated Loader -->
        <div class="mb-8 flex justify-center">
          <div class="relative w-32 h-32">
            <!-- Rotating outer ring -->
            <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div
              class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"
            ></div>

            <!-- Center icon -->
            <div class="absolute inset-0 flex items-center justify-center text-6xl">
              <span *ngIf="selectedFile && selectedFile.type.startsWith('image/')">🖼️</span>
              <span *ngIf="selectedFile && selectedFile.type.startsWith('video/')">🎥</span>
              <span
                *ngIf="
                  selectedFile && (selectedFile.type === 'text/plain' || selectedFile.type === 'application/pdf')
                "
                >📄</span
              >
            </div>
          </div>
        </div>

        <!-- Loading Text -->
        <h3 class="text-3xl font-bold text-gray-900 mb-3">Analisando</h3>
        <p class="text-gray-600 mb-8 text-lg">
          Processando seu arquivo com inteligência artificial
        </p>

        <!-- Dots animation -->
        <div class="flex justify-center items-center gap-2 mb-8">
          <div
            class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style="animation-delay: 0s"
          ></div>
          <div
            class="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>

        <!-- Status message -->
        <p class="text-sm text-gray-500">Por favor, aguarde...</p>
      </div>
    </div>

    <app-footer></app-footer>
  `,
})
export class AgentComponent {
  selectedFile: File | null = null;
  isAnalyzing = false;
  isDragging = false;

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

  analyzeFile(): void {
    if (!this.selectedFile) return;

    this.isAnalyzing = true;

    // Aqui você vai chamar a API do backend
    // const formData = new FormData();
    // formData.append('file', this.selectedFile);
    // this.http.post('/api/analyze', formData).subscribe(
    //   (response) => {
    //     this.isAnalyzing = false;
    //     // Exibir resultado
    //   }
    // );
  }
}
