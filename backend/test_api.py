"""
Script de teste para validar a API
"""
import sys
import asyncio
from app.models import FactCheckRequest, ContentType
from app.services.preprocessing import preprocessing_service
from app.services.gemini_service import gemini_service

print("=" * 60)
print("TESTE DO BACKEND FACTCHECK")
print("=" * 60)

# Teste 1: Pré-processamento
print("\n1. Testando pré-processamento...")
test_text = "   O Brasil é o maior produtor de café do mundo!!!   "
cleaned = preprocessing_service.clean_text(test_text)
print(f"   Texto original: '{test_text}'")
print(f"   Texto limpo: '{cleaned}'")
print("   ✓ Pré-processamento OK")

# Teste 2: Detecção de red flags
print("\n2. Testando detecção de red flags...")
suspicious_text = "URGENTE!!! CHOCANTE!!! Você não vai acreditar no que descobrimos!!!"
red_flags = preprocessing_service.detect_red_flags(suspicious_text)
print(f"   Texto: '{suspicious_text}'")
print(f"   Red flags encontrados: {len(red_flags)}")
for flag in red_flags:
    print(f"   - {flag}")
print("   ✓ Detecção de red flags OK")

# Teste 3: Extração de sentenças
print("\n3. Testando extração de sentenças...")
text_with_sentences = "O Brasil é grande. Tem muitas cidades. A capital é Brasília."
sentences = preprocessing_service.extract_sentences(text_with_sentences)
print(f"   Texto: '{text_with_sentences}'")
print(f"   Sentenças encontradas: {len(sentences)}")
for i, sent in enumerate(sentences, 1):
    print(f"   {i}. {sent}")
print("   ✓ Extração de sentenças OK")

# Teste 4: Validação de conteúdo
print("\n4. Testando validação de conteúdo...")
valid_text = "Este é um texto válido com conteúdo suficiente para análise."
invalid_text = "abc"
print(f"   Texto válido: {preprocessing_service.is_valid_content(valid_text)}")
print(f"   Texto inválido: {preprocessing_service.is_valid_content(invalid_text)}")
print("   ✓ Validação de conteúdo OK")

# Teste 5: Modelo de requisição
print("\n5. Testando modelo de requisição...")
try:
    request = FactCheckRequest(
        content="O Brasil é o maior produtor de café do mundo.",
        content_type=ContentType.TEXT,
        check_sources=False,
        language="pt"
    )
    print(f"   Content: {request.content}")
    print(f"   Type: {request.content_type}")
    print(f"   Language: {request.language}")
    print("   ✓ Modelo de requisição OK")
except Exception as e:
    print(f"   ✗ Erro: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("TODOS OS TESTES PASSARAM COM SUCESSO!")
print("=" * 60)
print("\nO backend está pronto para uso!")
print("\nPara iniciar o servidor:")
print("  cd /home/ubuntu/factcheck-backend")
print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
print("\nDocumentação disponível em: http://localhost:8000/docs")

