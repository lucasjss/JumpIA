# Guia de Início Rápido - JumpIA

## Instalação em 5 Minutos

### Pré-requisitos
- Python 3.11+
- Node.js 22+
- Gemini API Key ([Obter aqui](https://makersuite.google.com/app/apikey))

### Passo 1: Extrair Arquivos

```bash
tar -xzf JumpIA-Integrated.tar.gz
cd JumpIA-Integrated
```

### Passo 2: Configurar Backend

```bash
cd backend

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env e adicionar sua GEMINI_API_KEY
nano .env  # ou vim, ou seu editor preferido

# Instalar dependências
pip3 install -r requirements.txt
```

### Passo 3: Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install
```

### Passo 4: Iniciar Aplicação

**Terminal 1 - Backend:**
```bash
cd backend
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend
./start-frontend.sh
```

### Passo 5: Usar

Abra seu navegador em: **http://localhost:4200/agent**

## Teste Rápido da API

```bash
# Health check
curl http://localhost:8000/health

# Teste de análise
curl -X POST http://localhost:8000/api/factcheck/quick \
  -H "Content-Type: application/json" \
  -d '{
    "content": "A Terra é redonda e gira ao redor do Sol.",
    "content_type": "text",
    "check_sources": false,
    "language": "pt"
  }'
```

## Estrutura de Diretórios

```
JumpIA-Integrated/
├── backend/           # API FastAPI
│   ├── app/
│   ├── .env          # Configuração (CRIAR)
│   └── start-backend.sh
├── frontend/          # App Angular
│   ├── src/
│   └── start-frontend.sh
└── README.md         # Documentação completa
```

## URLs Importantes

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Solução de Problemas Rápidos

### Backend não inicia
```bash
# Verificar se porta 8000 está livre
lsof -i :8000

# Verificar se .env está configurado
cat backend/.env | grep GEMINI_API_KEY
```

### Frontend não inicia
```bash
# Verificar se porta 4200 está livre
lsof -i :4200

# Limpar cache e reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
```bash
# Verificar CORS no backend
cat backend/.env | grep ALLOWED_ORIGINS

# Deve conter: http://localhost:4200
```

## Próximos Passos

1. Leia o [README.md](README.md) completo para documentação detalhada
2. Explore a [documentação da API](http://localhost:8000/docs)
3. Teste diferentes tipos de conteúdo (texto, URL, imagens)
4. Configure APIs opcionais (Google Search, News API) para melhor desempenho

## Suporte

- Consulte o README.md para documentação completa
- Veja os logs do backend e frontend para diagnóstico
- Teste a API diretamente em /docs


