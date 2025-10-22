#!/bin/bash

echo "=========================================="
echo "  FactCheck Backend API"
echo "=========================================="
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "   Copiando .env.example para .env..."
    cp .env.example .env
    echo "   ✓ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Configure sua GEMINI_API_KEY no arquivo .env"
    echo ""
fi

# Verificar se GEMINI_API_KEY está configurada
if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env || grep -q "GEMINI_API_KEY=$" .env; then
    echo "⚠️  GEMINI_API_KEY não configurada!"
    echo "   Edite o arquivo .env e adicione sua chave do Gemini"
    echo "   Obtenha em: https://aistudio.google.com/"
    echo ""
fi

echo "🚀 Iniciando servidor..."
echo ""
echo "   URL: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Health: http://localhost:8000/health"
echo ""
echo "   Pressione Ctrl+C para parar"
echo ""
echo "=========================================="
echo ""

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

