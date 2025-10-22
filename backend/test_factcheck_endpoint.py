"""
Teste do endpoint de fact-checking
"""
import requests
import json

print("=" * 70)
print("TESTE DO ENDPOINT /api/factcheck")
print("=" * 70)

# Dados de teste
test_data = {
    "content": "O Brasil é o maior produtor de café do mundo. A produção brasileira representa cerca de 37% do café mundial.",
    "content_type": "text",
    "check_sources": False,  # Desabilitar busca de fontes para teste rápido
    "language": "pt"
}

print("\nEnviando requisição...")
print(f"URL: http://localhost:8000/api/factcheck")
print(f"Conteúdo: {test_data['content'][:80]}...")

try:
    response = requests.post(
        "http://localhost:8000/api/factcheck",
        json=test_data,
        timeout=30
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n" + "=" * 70)
        print("RESULTADO DA VERIFICAÇÃO")
        print("=" * 70)
        print(f"\nCredibilidade Geral: {result['overall_credibility']}")
        print(f"Score de Credibilidade: {result['credibility_score']}")
        print(f"\nResumo: {result['summary']}")
        print(f"\nAfirmações encontradas: {len(result['claims'])}")
        
        for i, claim in enumerate(result['claims'], 1):
            print(f"\n  {i}. {claim['text']}")
            print(f"     Veracidade: {claim['veracity']}")
            print(f"     Confiança: {claim['confidence']}")
            print(f"     Explicação: {claim['explanation'][:100]}...")
        
        print(f"\nRed Flags: {len(result['red_flags'])}")
        for flag in result['red_flags']:
            print(f"  - {flag}")
        
        print(f"\nFontes verificadas: {len(result['sources_checked'])}")
        print(f"Tempo de processamento: {result['processing_time']}s")
        
        print("\n" + "=" * 70)
        print("✓ TESTE CONCLUÍDO COM SUCESSO!")
        print("=" * 70)
    else:
        print(f"\n✗ Erro na requisição:")
        print(response.text)
        
except Exception as e:
    print(f"\n✗ Erro ao testar endpoint: {e}")

