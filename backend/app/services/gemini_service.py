"""
Serviço de integração com Google Gemini API
"""
import google.generativeai as genai
import logging
import json
from typing import Dict, Any, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Serviço para interação com Gemini API"""
    
    def __init__(self):
        """Inicializa o serviço Gemini"""
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY não configurada!")
            self.model = None
            return
        
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"✅ Gemini API inicializada com modelo: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Erro ao inicializar Gemini API: {e}")
            self.model = None
    
    async def analyze_content(self, content: str, language: str = "pt") -> Dict[str, Any]:
        """
        Analisa o conteúdo usando Gemini para fact-checking
        
        Args:
            content: Texto a ser analisado
            language: Idioma do conteúdo
            
        Returns:
            Dicionário com análise estruturada
        """
        if not self.model:
            raise Exception("Gemini API não está configurada")
        
        try:
            prompt = self._build_factcheck_prompt(content, language)
            
            logger.info("🤖 Enviando requisição para Gemini API...")
            response = self.model.generate_content(prompt)
            
            # Extrair e parsear resposta
            result = self._parse_gemini_response(response.text)
            logger.info("✅ Análise do Gemini concluída")
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao analisar conteúdo com Gemini: {e}")
            raise Exception(f"Erro na análise com Gemini: {str(e)}")
    
    def _build_factcheck_prompt(self, content: str, language: str) -> str:
        """Constrói o prompt para fact-checking"""
        
        language_names = {
            "pt": "português",
            "en": "inglês",
            "es": "espanhol"
        }
        lang_name = language_names.get(language, "português")
        
        prompt = f"""Você é um especialista em verificação de fatos. Analise o seguinte conteúdo em {lang_name} e forneça uma análise detalhada.

CONTEÚDO A SER ANALISADO:
{content}

Por favor, forneça sua análise no seguinte formato JSON:

{{
  "credibility_score": <número entre 0 e 1, onde 1 é totalmente confiável>,
  "overall_credibility": "<alto, médio, baixo, muito baixo ou não verificável>",
  "summary": "<resumo geral da análise em 2-3 frases>",
  "claims": [
    {{
      "text": "<afirmação específica encontrada>",
      "veracity": "<verdadeiro, falso, parcialmente verdadeiro, não verificável>",
      "confidence": <número entre 0 e 1>,
      "explanation": "<explicação detalhada da avaliação>"
    }}
  ],
  "red_flags": [
    "<lista de sinais de alerta encontrados, como linguagem sensacionalista, falta de fontes, etc>"
  ],
  "recommendations": [
    "<recomendações de fontes confiáveis para verificar as informações>"
  ]
}}

IMPORTANTE:
- Seja objetivo e baseado em fatos
- Identifique todas as afirmações verificáveis
- Aponte inconsistências lógicas ou falta de evidências
- Considere o contexto e nuances
- Responda APENAS com o JSON, sem texto adicional
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parseia a resposta do Gemini
        
        Args:
            response_text: Texto da resposta do Gemini
            
        Returns:
            Dicionário com dados estruturados
        """
        try:
            # Tentar extrair JSON da resposta
            # Remover possíveis markdown code blocks
            text = response_text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            # Parsear JSON
            result = json.loads(text)
            
            # Validar campos essenciais
            if "credibility_score" not in result:
                result["credibility_score"] = 0.5
            if "overall_credibility" not in result:
                result["overall_credibility"] = "medium"
            if "summary" not in result:
                result["summary"] = "Análise realizada com sucesso."
            if "claims" not in result:
                result["claims"] = []
            if "red_flags" not in result:
                result["red_flags"] = []
            if "recommendations" not in result:
                result["recommendations"] = []
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao parsear resposta JSON do Gemini: {e}")
            logger.debug(f"Resposta original: {response_text}")
            
            # Retornar análise básica em caso de erro
            return {
                "credibility_score": 0.5,
                "overall_credibility": "medium",
                "summary": "Não foi possível realizar análise estruturada completa.",
                "claims": [],
                "red_flags": ["Erro ao processar resposta da IA"],
                "recommendations": []
            }
    
    async def extract_claims(self, content: str) -> List[str]:
        """
        Extrai afirmações específicas do conteúdo
        
        Args:
            content: Texto a ser analisado
            
        Returns:
            Lista de afirmações encontradas
        """
        if not self.model:
            raise Exception("Gemini API não está configurada")
        
        try:
            prompt = f"""Extraia todas as afirmações verificáveis do seguinte texto. 
Retorne apenas uma lista JSON de strings, sem explicações adicionais.

TEXTO:
{content}

Formato esperado: ["afirmação 1", "afirmação 2", ...]
"""
            
            response = self.model.generate_content(prompt)
            
            # Parsear resposta
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            claims = json.loads(text)
            return claims if isinstance(claims, list) else []
            
        except Exception as e:
            logger.error(f"Erro ao extrair afirmações: {e}")
            return []
    
    async def check_consistency(self, content: str) -> Dict[str, Any]:
        """
        Verifica consistência interna do conteúdo
        
        Args:
            content: Texto a ser analisado
            
        Returns:
            Análise de consistência
        """
        if not self.model:
            raise Exception("Gemini API não está configurada")
        
        try:
            prompt = f"""Analise a consistência lógica e interna do seguinte texto.
Identifique contradições, inconsistências ou problemas lógicos.

TEXTO:
{content}

Retorne um JSON no formato:
{{
  "is_consistent": <true ou false>,
  "inconsistencies": ["lista de inconsistências encontradas"],
  "logical_issues": ["problemas lógicos identificados"]
}}
"""
            
            response = self.model.generate_content(prompt)
            
            # Parsear resposta
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            result = json.loads(text)
            return result
            
        except Exception as e:
            logger.error(f"Erro ao verificar consistência: {e}")
            return {
                "is_consistent": True,
                "inconsistencies": [],
                "logical_issues": []
            }


# Instância global do serviço
gemini_service = GeminiService()

