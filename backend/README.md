# Fact-Checking Backend API

Backend completo para sistema de fact-checking com integração Gemini AI, suporte a **texto, URLs, imagens e vídeos**.

## 🚀 Funcionalidades

- ✅ **Análise de Texto** - Verificação de notícias, artigos e textos em geral
- ✅ **Análise de URLs** - Extração e verificação de conteúdo de páginas web
- ✅ **Análise de Imagens** - OCR, detecção de manipulação e análise visual com Gemini Vision
- ✅ **Análise de Vídeos** - Extração de frames, análise visual e transcrição de áudio
- ✅ **Busca de Fontes Externas** - Integração com Google Search API e News API
- ✅ **Detecção de Red Flags** - Identificação automática de sinais de alerta
- ✅ **Multilíngue** - Suporte para português, inglês e espanhol
- ✅ **API REST** - Documentação interativa com Swagger/OpenAPI
- ✅ **CORS Habilitado** - Pronto para integração com Angular

## 📋 Requisitos

- Python 3.11 ou superior
- Conta no Google AI Studio (para API Key do Gemini)
- (Opcional) Tesseract OCR para análise de texto em imagens
- (Opcional) FFmpeg para processamento de vídeo

## 🔧 Instalação Rápida

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY

# 3. Testar instalação
python test_api.py

# 4. Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse: http://localhost:8000/docs

## 📁 Estrutura do Projeto

```
factcheck-backend/
├── app/
│   ├── main.py                    # Aplicação FastAPI principal
│   ├── config.py                  # Configurações
│   ├── models.py                  # Modelos Pydantic
│   ├── api/
│   │   └── routes.py              # Endpoints da API
│   ├── services/
│   │   ├── gemini_service.py      # Integração Gemini
│   │   ├── media_service.py       # Análise de imagem/vídeo
│   │   ├── search_service.py      # Busca externa
│   │   ├── preprocessing.py       # Pré-processamento
│   │   └── factcheck_service.py   # Lógica principal
│   └── utils/
│       └── helpers.py             # Funções auxiliares
├── requirements.txt               # Dependências Python
├── .env.example                   # Exemplo de variáveis de ambiente
├── test_api.py                    # Script de testes
├── README.md                      # Este arquivo
├── INSTALACAO.md                  # Guia detalhado de instalação
├── API_DOCUMENTATION.md           # Documentação completa da API
└── INTEGRACAO_ANGULAR.md          # Guia de integração com Angular
```

## 🔑 Configuração

### Obter API Key do Gemini

1. Acesse: https://aistudio.google.com/
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Copie a chave e adicione no arquivo `.env`

### Arquivo .env

```env
# OBRIGATÓRIO
GEMINI_API_KEY=sua_chave_aqui

# OPCIONAL - Para busca de fontes externas
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
NEWS_API_KEY=

# Configurações da aplicação
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
DEBUG=True
```

## 📡 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/factcheck` | Verificação completa de fatos |
| POST | `/api/factcheck/quick` | Verificação rápida (sem fontes) |
| GET | `/api/sources/trusted` | Lista de fontes confiáveis |
| GET | `/api/info` | Informações da API |
| GET | `/health` | Health check |
| GET | `/docs` | Documentação interativa |

## 💡 Exemplos de Uso

### Verificar Texto

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "content": "O Brasil é o maior produtor de café do mundo.",
    "content_type": "text",
    "check_sources": false,
    "language": "pt"
  }'
```

### Verificar URL/Notícia

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "content": "https://example.com/noticia",
    "content_type": "url",
    "check_sources": true,
    "language": "pt"
  }'
```

### Verificar Imagem

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "content": "https://example.com/imagem.jpg",
    "content_type": "image",
    "language": "pt"
  }'
```

### Verificar Vídeo

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "content": "https://example.com/video.mp4",
    "content_type": "video",
    "language": "pt"
  }'
```

## 🎨 Integração com Angular

Veja o guia completo em: **[INTEGRACAO_ANGULAR.md](INTEGRACAO_ANGULAR.md)**

Exemplo rápido:

```typescript
// factcheck.service.ts
import { HttpClient } from '@angular/common/http';

export class FactCheckService {
  private apiUrl = 'http://localhost:8000/api';

  checkFacts(content: string, type: string) {
    return this.http.post(`${this.apiUrl}/factcheck`, {
      content: content,
      content_type: type,
      check_sources: true,
      language: 'pt'
    });
  }
}
```

## 🧪 Testes

```bash
# Testar módulos
python test_api.py

# Testar endpoint (com servidor rodando)
python test_factcheck_endpoint.py

# Testar manualmente
curl http://localhost:8000/health
```

## 📚 Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia detalhado de instalação e configuração
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentação completa da API
- **[INTEGRACAO_ANGULAR.md](INTEGRACAO_ANGULAR.md)** - Como integrar com Angular
- **Swagger UI** - http://localhost:8000/docs (quando servidor estiver rodando)

## 🛠️ Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **Google Gemini** - IA para análise semântica e visão computacional
- **Pydantic** - Validação de dados
- **BeautifulSoup** - Parsing de HTML
- **Pillow + Tesseract** - OCR para extração de texto de imagens
- **OpenCV + MoviePy** - Processamento de vídeo
- **httpx** - Cliente HTTP assíncrono

## 🔒 Segurança

⚠️ **Importante para Produção:**

- Implementar autenticação (JWT, OAuth)
- Adicionar rate limiting
- Validar e sanitizar todos os inputs
- Usar HTTPS
- Não expor chaves de API no código
- Implementar logging e monitoramento

## 🐛 Solução de Problemas

### Erro: "GEMINI_API_KEY não configurada"
- Verifique se o arquivo `.env` existe e contém a chave
- Reinicie o servidor após alterar `.env`

### Erro de CORS
- Adicione a origem do frontend em `ALLOWED_ORIGINS` no `.env`
- Reinicie o servidor

### Análise de imagem não funciona
- Instale Tesseract: `sudo apt-get install tesseract-ocr`
- Instale dependências: `pip install pytesseract pillow`

### Análise de vídeo não funciona
- Instale FFmpeg: `sudo apt-get install ffmpeg`
- Instale dependências: `pip install opencv-python moviepy`

## 📈 Roadmap

- [ ] Autenticação JWT
- [ ] Banco de dados para histórico
- [ ] Cache de resultados
- [ ] Rate limiting
- [ ] Suporte a mais idiomas
- [ ] Análise de áudio standalone
- [ ] Detecção de deepfakes
- [ ] API de webhooks

## 📄 Licença

Este projeto é fornecido como está, sem garantias.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `/docs`
2. Verifique os arquivos de documentação (INSTALACAO.md, API_DOCUMENTATION.md)
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para combater desinformação**

