# Guia de Instalação e Configuração

## Pré-requisitos

- Python 3.11 ou superior
- pip (gerenciador de pacotes Python)
- Conta no Google AI Studio para obter API Key do Gemini

## Passo 1: Clonar ou baixar o projeto

```bash
cd /seu/diretorio
# Se estiver usando git:
# git clone <url-do-repositorio>
```

## Passo 2: Instalar dependências

```bash
cd factcheck-backend
pip install -r requirements.txt
```

## Passo 3: Configurar variáveis de ambiente

### 3.1. Criar arquivo .env

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

### 3.2. Obter API Key do Gemini

1. Acesse: https://aistudio.google.com/
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Copie a chave gerada

### 3.3. Editar arquivo .env

Abra o arquivo `.env` e configure:

```env
# OBRIGATÓRIO
GEMINI_API_KEY=sua_chave_gemini_aqui

# OPCIONAL - APIs de busca externa
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
NEWS_API_KEY=

# Configurações da aplicação
APP_NAME=FactCheck Backend API
APP_VERSION=1.0.0
DEBUG=True
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

**Importante:** A `GEMINI_API_KEY` é **obrigatória** para o funcionamento da API. As outras chaves são opcionais.

## Passo 4: Testar a instalação

Execute o script de teste:

```bash
python test_api.py
```

Você deve ver:

```
============================================================
TODOS OS TESTES PASSARAM COM SUCESSO!
============================================================
```

## Passo 5: Iniciar o servidor

### Modo desenvolvimento (com auto-reload):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Modo produção:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Passo 6: Verificar se está funcionando

Abra o navegador e acesse:

- **API**: http://localhost:8000/
- **Documentação interativa**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health

## Configuração de CORS para Angular

Se seu frontend Angular estiver rodando em uma porta diferente, adicione a origem no arquivo `.env`:

```env
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000,http://localhost:5000
```

## Solução de Problemas

### Erro: "GEMINI_API_KEY não configurada"

- Verifique se o arquivo `.env` existe
- Verifique se a chave está correta
- Reinicie o servidor após alterar o `.env`

### Erro: "Port already in use"

Outro processo está usando a porta 8000. Você pode:

1. Parar o processo: `lsof -ti:8000 | xargs kill -9`
2. Ou usar outra porta: `uvicorn app.main:app --port 8001`

### Erro ao instalar dependências

Atualize o pip:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Próximos Passos

Após a instalação, consulte:

- `API_DOCUMENTATION.md` - Documentação completa da API
- `INTEGRACAO_ANGULAR.md` - Como integrar com o frontend Angular

