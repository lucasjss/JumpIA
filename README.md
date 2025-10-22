# JumpIA - Detector de Fake News

Sistema completo de detecção de fake news com frontend Angular e backend FastAPI integrados.

## Estrutura do Projeto

```
JumpIA-Integrated/
├── frontend/          # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   └── agent/     # Página principal de análise
│   │   │   └── services/
│   │   │       └── factcheck.service.ts  # Serviço de integração com API
│   │   └── ...
│   ├── start-frontend.sh      # Script de inicialização
│   └── package.json
│
└── backend/           # API FastAPI
    ├── app/
    │   ├── api/
    │   │   ├── routes.py          # Rotas principais
    │   │   └── upload_routes.py   # Upload de arquivos
    │   ├── services/
    │   │   └── factcheck_service.py  # Lógica de verificação
    │   └── main.py
    ├── start-backend.sh          # Script de inicialização
    ├── requirements.txt
    └── .env

```

## Funcionalidades

### Frontend (Angular 20)
- Interface moderna e responsiva com Tailwind CSS
- Análise de múltiplos tipos de conteúdo:
  - Texto
  - URLs
  - Imagens
  - Vídeos
- Visualização detalhada de resultados
- Indicadores visuais de credibilidade
- Sistema de drag-and-drop para arquivos

### Backend (FastAPI + Gemini AI)
- API RESTful completa
- Verificação de fatos usando Gemini AI
- Análise de credibilidade
- Detecção de sinais de alerta (red flags)
- Busca de fontes externas (opcional)
- Suporte a múltiplos idiomas (PT, EN, ES)
- Upload e análise de imagens e vídeos

## Requisitos

### Backend
- Python 3.11+
- pip3
- Gemini API Key (obrigatória)

### Frontend
- Node.js 22+
- npm

## Instalação e Execução

### 1. Backend

```bash
cd backend

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e adicione sua GEMINI_API_KEY

# Instalar dependências
pip3 install -r requirements.txt

# Iniciar servidor (método 1 - script)
./start-backend.sh

# OU iniciar servidor (método 2 - manual)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

O backend estará disponível em:
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (método 1 - script)
./start-frontend.sh

# OU iniciar servidor (método 2 - manual)
npm start
```

O frontend estará disponível em:
- Aplicação: http://localhost:4200

## Uso

1. Acesse http://localhost:4200/agent
2. Escolha o tipo de conteúdo a analisar:
   - **Texto**: Cole o texto diretamente
   - **URL**: Cole o link da notícia
   - **Arquivo**: Arraste ou selecione uma imagem/vídeo
3. Marque "Buscar fontes externas" para análise mais detalhada (mais lento)
4. Clique em "Analisar"
5. Visualize os resultados:
   - Pontuação de credibilidade
   - Resumo da análise
   - Afirmações verificadas
   - Sinais de alerta
   - Fontes consultadas

## API Endpoints

### Fact-Checking
- `POST /api/factcheck` - Verificação completa com fontes
- `POST /api/factcheck/quick` - Verificação rápida sem fontes
- `POST /api/factcheck/upload` - Upload e análise de arquivos

### Informações
- `GET /health` - Status da API
- `GET /api/info` - Informações e capacidades
- `GET /api/sources/trusted` - Lista de fontes confiáveis

### Documentação Completa
Acesse http://localhost:8000/docs para documentação interativa completa da API.

## Configuração

### Backend (.env)

```env
# Obrigatório
GEMINI_API_KEY=sua_chave_aqui

# Opcional
GOOGLE_SEARCH_API_KEY=sua_chave_aqui
GOOGLE_SEARCH_ENGINE_ID=seu_id_aqui
NEWS_API_KEY=sua_chave_aqui

# Configuração
DEBUG=True
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### Frontend

A URL da API é configurada automaticamente no serviço `factcheck.service.ts`:
- Desenvolvimento local: http://localhost:8000/api
- Produção: Configurar conforme necessário

## Tecnologias Utilizadas

### Frontend
- Angular 20
- TypeScript 5.9
- Tailwind CSS 4
- RxJS 7.8
- HttpClient para requisições

### Backend
- FastAPI 0.109
- Python 3.11
- Google Gemini AI
- Pydantic para validação
- Uvicorn como servidor ASGI
- Python-multipart para upload
- BeautifulSoup4 para scraping
- OpenCV e MoviePy para análise de mídia

## Estrutura de Resposta da API

```json
{
  "content": "Texto analisado",
  "content_type": "text",
  "overall_credibility": "high|medium|low|very_low|unverifiable",
  "credibility_score": 0.85,
  "summary": "Resumo da análise",
  "claims": [
    {
      "text": "Afirmação identificada",
      "veracity": "true|false|partially_true|unverifiable",
      "confidence": 0.95,
      "explanation": "Explicação detalhada",
      "sources": []
    }
  ],
  "sources_checked": [
    {
      "title": "Título da fonte",
      "url": "https://...",
      "credibility": "high|medium|low",
      "relevance": 0.9,
      "summary": "Resumo do conteúdo"
    }
  ],
  "red_flags": ["Lista de sinais de alerta"],
  "timestamp": "2025-10-22T12:00:00",
  "processing_time": 5.2
}
```

## Limitações

- O agente só consegue verificar notícias até 2024 (limitação do modelo Gemini)
- Tamanho máximo de arquivo: 50MB
- Análise com busca de fontes é mais lenta (10-30 segundos)
- Requer conexão com internet para funcionar

## Troubleshooting

### Backend não inicia
- Verifique se a GEMINI_API_KEY está configurada no .env
- Verifique se todas as dependências estão instaladas
- Veja os logs para erros específicos

### Frontend não conecta ao backend
- Verifique se o backend está rodando na porta 8000
- Verifique o CORS no arquivo .env do backend
- Abra o console do navegador para ver erros

### Erro 500 na análise
- Verifique se a GEMINI_API_KEY é válida
- Verifique os logs do backend
- Tente com conteúdo mais curto primeiro

## Desenvolvimento

### Adicionar novas funcionalidades

1. **Backend**: Adicione rotas em `app/api/routes.py`
2. **Frontend**: Adicione métodos em `factcheck.service.ts`
3. **UI**: Atualize componentes em `src/app/pages/agent/`

### Testes

```bash
# Backend
cd backend
python3 test_api.py

# Frontend
cd frontend
npm test
```

## Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

## Suporte

Para questões e suporte:
- Verifique a documentação da API em /docs
- Consulte os logs do backend e frontend
- Revise os arquivos de configuração

## Autor

Desenvolvido e integrado por Leonardo Fonseca e Lucas Jesus

---

**Nota**: Este sistema utiliza IA para análise de conteúdo. Os resultados devem ser usados como referência e não como verdade absoluta. Sempre verifique informações importantes em múltiplas fontes confiáveis.

