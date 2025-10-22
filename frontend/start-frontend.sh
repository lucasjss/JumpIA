#!/bin/bash

# Script de inicialização do Frontend JumpIA
# Autor: Manus AI
# Data: 2025-10-22

echo "========================================="
echo "  Iniciando Frontend JumpIA"
echo "========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "Erro: Execute este script do diretório jump-ia"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Iniciar o servidor de desenvolvimento
echo "Iniciando servidor de desenvolvimento..."
echo "Acesse: http://localhost:4200"
echo ""
npm start

echo ""
echo "========================================="
echo "  Frontend encerrado"
echo "========================================="

