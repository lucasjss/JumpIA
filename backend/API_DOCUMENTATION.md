# Documentação da API - FactCheck Backend

## Visão Geral

API REST para verificação de fatos (fact-checking) usando inteligência artificial (Gemini) e fontes externas confiáveis.

**Base URL**: `http://localhost:8000`

**Formato**: JSON

**CORS**: Habilitado para origens configuradas

## Autenticação

Atualmente a API não requer autenticação. Em produção, recomenda-se implementar autenticação via JWT ou API Key.

## Endpoints

### 1. Health Check

Verifica o status da API e serviços integrados.

**Endpoint**: `GET /health`

**Resposta de Sucesso (200)**:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-17T14:39:54.780396",
  "services": {
    "gemini": true,
    "google_search": false,
    "news_api": false
  }
}
```

---

### 2. Informações da API

Retorna informações sobre capacidades e endpoints disponíveis.

**Endpoint**: `GET /api/info`

**Resposta de Sucesso (200)**:

```json
{
  "name": "FactCheck Backend API",
  "version": "1.0.0",
  "description": "API para verificação de fatos usando Gemini AI",
  "features": {
    "text_analysis": true,
    "url_analysis": true,
    "image_analysis": false,
    "external_sources": true,
    "red_flags_detection": true,
    "multilingual": true
  },
  "supported_languages": ["pt", "en", "es"],
  "content_types": ["text", "url"],
  "endpoints": {
    "factcheck": "/api/factcheck",
    "quick_check": "/api/factcheck/quick",
    "trusted_sources": "/api/sources/trusted",
    "health": "/health",
    "docs": "/docs"
  }
}
```

---

### 3. Verificação de Fatos (Completa)

Realiza verificação completa de fatos, incluindo busca de fontes externas.

**Endpoint**: `POST /api/factcheck`

**Headers**:
```
Content-Type: application/json
```

**Body**:

```json
{
  "content": "O Brasil é o maior produtor de café do mundo.",
  "content_type": "text",
  "check_sources": true,
  "language": "pt"
}
```

**Parâmetros**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| content | string | Sim | Texto, URL ou conteúdo a ser verificado |
| content_type | string | Não | Tipo: "text", "url", "image" (padrão: "text") |
| check_sources | boolean | Não | Se deve buscar fontes externas (padrão: true) |
| language | string | Não | Idioma: "pt", "en", "es" (padrão: "pt") |

**Resposta de Sucesso (200)**:

```json
{
  "content": "O Brasil é o maior produtor de café do mundo.",
  "content_type": "text",
  "overall_credibility": "high",
  "credibility_score": 0.92,
  "summary": "A afirmação é verdadeira. O Brasil é de fato o maior produtor de café do mundo.",
  "claims": [
    {
      "text": "O Brasil é o maior produtor de café do mundo",
      "veracity": "verdadeiro",
      "confidence": 0.95,
      "explanation": "Dados da ICO confirmam que o Brasil produz cerca de 37% do café mundial.",
      "sources": []
    }
  ],
  "sources_checked": [
    {
      "title": "Agência Lupa - Fact-checking",
      "url": "https://piaui.folha.uol.com.br/lupa/",
      "credibility": "high",
      "relevance": 0.6,
      "summary": "Agência de fact-checking brasileira"
    }
  ],
  "red_flags": [],
  "timestamp": "2025-10-17T12:00:00",
  "processing_time": 2.5
}
```

**Respostas de Erro**:

- **400 Bad Request**: Conteúdo inválido ou muito curto
- **500 Internal Server Error**: Erro ao processar requisição
- **501 Not Implemented**: Funcionalidade não implementada (ex: análise de imagem)

---

### 4. Verificação Rápida

Realiza verificação rápida **sem** buscar fontes externas.

**Endpoint**: `POST /api/factcheck/quick`

**Body**: Mesmo formato do endpoint `/api/factcheck`

**Diferença**: Ignora o parâmetro `check_sources` e sempre executa sem busca externa.

---

### 5. Fontes Confiáveis

Lista fontes confiáveis recomendadas para fact-checking.

**Endpoint**: `GET /api/sources/trusted`

**Resposta de Sucesso (200)**:

```json
{
  "total": 8,
  "sources": [
    {
      "name": "Agência Lupa",
      "url": "https://piaui.folha.uol.com.br/lupa/",
      "type": "fact-checking",
      "country": "BR"
    },
    {
      "name": "Aos Fatos",
      "url": "https://www.aosfatos.org/",
      "type": "fact-checking",
      "country": "BR"
    }
  ]
}
```

---

## Modelos de Dados

### CredibilityLevel (Enum)

Níveis de credibilidade:

- `high`: Alta credibilidade (score >= 0.8)
- `medium`: Média credibilidade (0.6 <= score < 0.8)
- `low`: Baixa credibilidade (0.4 <= score < 0.6)
- `very_low`: Muito baixa credibilidade (0.2 <= score < 0.4)
- `unverifiable`: Não verificável (score < 0.2)

### ContentType (Enum)

Tipos de conteúdo suportados:

- `text`: Texto direto
- `url`: URL de página web
- `image`: Imagem (não implementado ainda)

### Claim (Objeto)

Afirmação encontrada e verificada:

```json
{
  "text": "string",
  "veracity": "string",
  "confidence": 0.95,
  "explanation": "string",
  "sources": []
}
```

### Source (Objeto)

Fonte verificada:

```json
{
  "title": "string",
  "url": "string",
  "credibility": "high|medium|low",
  "relevance": 0.8,
  "summary": "string"
}
```

---

## Exemplos de Uso

### Exemplo 1: Verificar texto simples

```bash
curl -X POST http://localhost:8000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{
    "content": "A Terra é plana.",
    "content_type": "text",
    "check_sources": false,
    "language": "pt"
  }'
```

### Exemplo 2: Verificar URL

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

### Exemplo 3: Verificação rápida

```bash
curl -X POST http://localhost:8000/api/factcheck/quick \
  -H "Content-Type: application/json" \
  -d '{
    "content": "O Brasil tem 200 milhões de habitantes.",
    "language": "pt"
  }'
```

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 500 | Erro interno do servidor |
| 501 | Funcionalidade não implementada |

---

## Rate Limiting

Atualmente não há rate limiting implementado. Em produção, recomenda-se:

- Limitar requisições por IP
- Implementar cache de resultados
- Usar filas para processamento assíncrono

---

## Documentação Interativa

Acesse a documentação interativa (Swagger UI):

**URL**: http://localhost:8000/docs

Ou a documentação alternativa (ReDoc):

**URL**: http://localhost:8000/redoc

---

## Suporte e Contato

Para dúvidas ou problemas, consulte o README.md do projeto.

