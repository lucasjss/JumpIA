#!/bin/bash

# Script de inicialização do Backend JumpIA
# Autor: Manus AI
# Data: 2025-10-22

echo "========================================="
echo "  Iniciando Backend JumpIA"
echo "========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "app/main.py" ]; then
    echo "Erro: Execute este script do diretório factcheck-backend"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "Erro: Arquivo .env não encontrado"
    echo "Copie .env.example para .env e configure as variáveis"
    exit 1
fi

# Verificar se as dependências estão instaladas
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Instalando dependências..."
    pip3 install -r requirements.txt
fi

# Iniciar o servidor
echo "Iniciando servidor na porta 8000..."
echo ""
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo ""
echo "========================================="
echo "  Backend encerrado"
echo "========================================="

