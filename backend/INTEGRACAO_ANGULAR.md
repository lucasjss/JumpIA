# Guia de Integração com Angular

## Visão Geral

Este guia mostra como integrar o backend de fact-checking com seu frontend Angular.

## Passo 1: Configurar CORS

No arquivo `.env` do backend, adicione a origem do seu Angular:

```env
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

Se estiver em produção, adicione o domínio real:

```env
ALLOWED_ORIGINS=https://seu-dominio.com,http://localhost:4200
```

## Passo 2: Criar Service no Angular

### factcheck.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FactCheckRequest {
  content: string;
  content_type: 'text' | 'url' | 'image' | 'video';
  check_sources?: boolean;
  language?: string;
}

export interface FactCheckResponse {
  content: string;
  content_type: string;
  overall_credibility: string;
  credibility_score: number;
  summary: string;
  claims: Claim[];
  sources_checked: Source[];
  red_flags: string[];
  timestamp: string;
  processing_time: number;
}

export interface Claim {
  text: string;
  veracity: string;
  confidence: number;
  explanation: string;
  sources: Source[];
}

export interface Source {
  title: string;
  url: string;
  credibility: string;
  relevance: number;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class FactCheckService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  /**
   * Verifica fatos de um conteúdo
   */
  checkFacts(request: FactCheckRequest): Observable<FactCheckResponse> {
    return this.http.post<FactCheckResponse>(
      `${this.apiUrl}/factcheck`,
      request
    );
  }

  /**
   * Verificação rápida (sem busca de fontes)
   */
  quickCheck(request: FactCheckRequest): Observable<FactCheckResponse> {
    return this.http.post<FactCheckResponse>(
      `${this.apiUrl}/factcheck/quick`,
      request
    );
  }

  /**
   * Obtém fontes confiáveis
   */
  getTrustedSources(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sources/trusted`);
  }

  /**
   * Health check da API
   */
  healthCheck(): Observable<any> {
    return this.http.get('http://localhost:8000/health');
  }

  /**
   * Informações da API
   */
  getApiInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info`);
  }
}
```

## Passo 3: Criar Component de Verificação

### factcheck.component.ts

```typescript
import { Component } from '@angular/core';
import { FactCheckService, FactCheckRequest, FactCheckResponse } from './factcheck.service';

@Component({
  selector: 'app-factcheck',
  templateUrl: './factcheck.component.html',
  styleUrls: ['./factcheck.component.css']
})
export class FactCheckComponent {
  content: string = '';
  contentType: 'text' | 'url' | 'image' | 'video' = 'text';
  checkSources: boolean = true;
  loading: boolean = false;
  result: FactCheckResponse | null = null;
  error: string | null = null;

  constructor(private factCheckService: FactCheckService) { }

  onSubmit() {
    if (!this.content.trim()) {
      this.error = 'Por favor, insira algum conteúdo para verificar.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.result = null;

    const request: FactCheckRequest = {
      content: this.content,
      content_type: this.contentType,
      check_sources: this.checkSources,
      language: 'pt'
    };

    this.factCheckService.checkFacts(request).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao verificar conteúdo.';
        this.loading = false;
        console.error('Erro:', err);
      }
    });
  }

  getCredibilityColor(credibility: string): string {
    switch (credibility) {
      case 'high': return 'green';
      case 'medium': return 'orange';
      case 'low': return 'red';
      case 'very_low': return 'darkred';
      default: return 'gray';
    }
  }

  getCredibilityLabel(credibility: string): string {
    const labels: any = {
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa',
      'very_low': 'Muito Baixa',
      'unverifiable': 'Não Verificável'
    };
    return labels[credibility] || credibility;
  }
}
```

### factcheck.component.html

```html
<div class="factcheck-container">
  <h1>Verificação de Fatos</h1>

  <form (ngSubmit)="onSubmit()">
    <!-- Seleção de tipo de conteúdo -->
    <div class="form-group">
      <label>Tipo de Conteúdo:</label>
      <select [(ngModel)]="contentType" name="contentType" class="form-control">
        <option value="text">Texto</option>
        <option value="url">URL / Notícia</option>
        <option value="image">Imagem (URL)</option>
        <option value="video">Vídeo (URL)</option>
      </select>
    </div>

    <!-- Campo de entrada -->
    <div class="form-group">
      <label>Conteúdo a Verificar:</label>
      <textarea 
        [(ngModel)]="content" 
        name="content"
        class="form-control" 
        rows="6"
        [placeholder]="getPlaceholder()"
        [disabled]="loading">
      </textarea>
    </div>

    <!-- Opções -->
    <div class="form-group">
      <label>
        <input 
          type="checkbox" 
          [(ngModel)]="checkSources" 
          name="checkSources"
          [disabled]="loading">
        Buscar fontes externas (mais lento)
      </label>
    </div>

    <!-- Botão de envio -->
    <button 
      type="submit" 
      class="btn btn-primary"
      [disabled]="loading || !content.trim()">
      {{ loading ? 'Verificando...' : 'Verificar' }}
    </button>
  </form>

  <!-- Erro -->
  <div *ngIf="error" class="alert alert-danger">
    {{ error }}
  </div>

  <!-- Resultado -->
  <div *ngIf="result" class="result-container">
    <h2>Resultado da Verificação</h2>

    <!-- Credibilidade geral -->
    <div class="credibility-box" [style.border-color]="getCredibilityColor(result.overall_credibility)">
      <h3>Credibilidade: 
        <span [style.color]="getCredibilityColor(result.overall_credibility)">
          {{ getCredibilityLabel(result.overall_credibility) }}
        </span>
      </h3>
      <p>Score: {{ (result.credibility_score * 100).toFixed(0) }}%</p>
    </div>

    <!-- Resumo -->
    <div class="summary-box">
      <h4>Resumo</h4>
      <p>{{ result.summary }}</p>
    </div>

    <!-- Afirmações -->
    <div *ngIf="result.claims.length > 0" class="claims-section">
      <h4>Afirmações Verificadas ({{ result.claims.length }})</h4>
      <div *ngFor="let claim of result.claims" class="claim-card">
        <p><strong>{{ claim.text }}</strong></p>
        <p>Veracidade: <span class="badge">{{ claim.veracity }}</span></p>
        <p>Confiança: {{ (claim.confidence * 100).toFixed(0) }}%</p>
        <p class="explanation">{{ claim.explanation }}</p>
      </div>
    </div>

    <!-- Red Flags -->
    <div *ngIf="result.red_flags.length > 0" class="red-flags-section">
      <h4>⚠️ Sinais de Alerta ({{ result.red_flags.length }})</h4>
      <ul>
        <li *ngFor="let flag of result.red_flags">{{ flag }}</li>
      </ul>
    </div>

    <!-- Fontes -->
    <div *ngIf="result.sources_checked.length > 0" class="sources-section">
      <h4>📚 Fontes Consultadas ({{ result.sources_checked.length }})</h4>
      <div *ngFor="let source of result.sources_checked" class="source-card">
        <h5>{{ source.title }}</h5>
        <p>{{ source.summary }}</p>
        <a [href]="source.url" target="_blank">Visitar fonte</a>
        <span class="badge">{{ source.credibility }}</span>
      </div>
    </div>

    <!-- Metadados -->
    <div class="metadata">
      <small>Tempo de processamento: {{ result.processing_time }}s</small>
    </div>
  </div>
</div>
```

## Passo 4: Adicionar no app.module.ts

```typescript
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    // ... seus componentes
    FactCheckComponent
  ],
  imports: [
    // ... outros imports
    HttpClientModule,
    FormsModule
  ],
  providers: [FactCheckService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Passo 5: Upload de Arquivos (Opcional)

Para permitir upload de imagens e vídeos locais:

### No Component:

```typescript
onFileSelected(event: any) {
  const file: File = event.target.files[0];
  
  if (file) {
    // Converter para base64 ou fazer upload
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.content = e.target.result; // Base64
      // Ou fazer upload para servidor e usar URL
    };
    reader.readAsDataURL(file);
  }
}
```

### No HTML:

```html
<input 
  type="file" 
  (change)="onFileSelected($event)"
  accept="image/*,video/*">
```

## Passo 6: Estilização (CSS)

```css
.factcheck-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.credibility-box {
  border: 3px solid;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
}

.claim-card, .source-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
}

.red-flags-section {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin: 20px 0;
}

.badge {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
```

## Testando a Integração

1. Inicie o backend:
   ```bash
   cd factcheck-backend
   uvicorn app.main:app --reload
   ```

2. Inicie o Angular:
   ```bash
   ng serve
   ```

3. Acesse: http://localhost:4200

## Troubleshooting

### Erro de CORS

Se aparecer erro de CORS, verifique:
- Backend está rodando
- `.env` tem a origem correta do Angular
- Reinicie o backend após alterar `.env`

### Erro 500

- Verifique se `GEMINI_API_KEY` está configurada
- Veja os logs do backend no terminal

### Requisição demora muito

- Use `quickCheck()` ao invés de `checkFacts()` para análise mais rápida
- Desabilite `check_sources` para pular busca externa

## Próximos Passos

- Adicionar autenticação (JWT)
- Implementar cache de resultados
- Adicionar histórico de verificações
- Melhorar feedback visual durante processamento

