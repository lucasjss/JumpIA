"""
Serviço de pré-processamento de texto
"""
import re
import logging
from typing import List, Dict, Any
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class PreprocessingService:
    """Serviço para pré-processar e limpar texto"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Limpa e normaliza o texto
        
        Args:
            text: Texto a ser limpo
            
        Returns:
            Texto limpo
        """
        # Remover HTML tags se houver
        text = BeautifulSoup(text, "html.parser").get_text()
        
        # Remover URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remover múltiplos espaços
        text = re.sub(r'\s+', ' ', text)
        
        # Remover espaços no início e fim
        text = text.strip()
        
        return text
    
    @staticmethod
    def extract_sentences(text: str) -> List[str]:
        """
        Extrai sentenças do texto
        
        Args:
            text: Texto a ser processado
            
        Returns:
            Lista de sentenças
        """
        # Dividir por pontos, exclamações e interrogações
        sentences = re.split(r'[.!?]+', text)
        
        # Limpar e filtrar sentenças vazias
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return sentences
    
    @staticmethod
    def detect_red_flags(text: str) -> List[str]:
        """
        Detecta sinais de alerta no texto
        
        Args:
            text: Texto a ser analisado
            
        Returns:
            Lista de sinais de alerta encontrados
        """
        red_flags = []
        text_lower = text.lower()
        
        # Linguagem sensacionalista
        sensationalist_words = [
            "chocante", "urgente", "exclusivo", "bomba", "escândalo",
            "revelação", "descoberta incrível", "você não vai acreditar",
            "médicos odeiam", "governo esconde", "mídia não mostra"
        ]
        
        for word in sensationalist_words:
            if word in text_lower:
                red_flags.append(f"Linguagem sensacionalista detectada: '{word}'")
                break
        
        # Excesso de pontuação
        if text.count('!') > 3:
            red_flags.append("Uso excessivo de pontos de exclamação")
        
        # Texto todo em maiúsculas
        if len(text) > 20 and text.isupper():
            red_flags.append("Texto todo em maiúsculas (CAPS LOCK)")
        
        # Falta de fontes
        has_source_indicators = any(word in text_lower for word in [
            "segundo", "de acordo com", "conforme", "fonte", "estudo",
            "pesquisa", "dados", "relatório", "publicado"
        ])
        
        if not has_source_indicators and len(text) > 100:
            red_flags.append("Ausência de indicadores de fontes")
        
        # Números sem contexto
        numbers = re.findall(r'\d+', text)
        if len(numbers) > 5:
            has_context = any(word in text_lower for word in [
                "%", "por cento", "milhão", "mil", "bilhão", "estudo", "pesquisa"
            ])
            if not has_context:
                red_flags.append("Números sem contexto adequado")
        
        # Apelo emocional excessivo
        emotional_words = [
            "medo", "terror", "pânico", "desespero", "tragédia",
            "catástrofe", "apocalipse", "fim do mundo"
        ]
        
        emotional_count = sum(1 for word in emotional_words if word in text_lower)
        if emotional_count >= 2:
            red_flags.append("Apelo emocional excessivo")
        
        # Teorias da conspiração
        conspiracy_indicators = [
            "conspiração", "illuminati", "nova ordem mundial",
            "governo secreto", "controle mental", "chip"
        ]
        
        for indicator in conspiracy_indicators:
            if indicator in text_lower:
                red_flags.append("Possível teoria da conspiração")
                break
        
        return red_flags
    
    @staticmethod
    def extract_entities(text: str) -> Dict[str, List[str]]:
        """
        Extrai entidades nomeadas do texto (versão simplificada)
        
        Args:
            text: Texto a ser processado
            
        Returns:
            Dicionário com entidades por tipo
        """
        entities = {
            "dates": [],
            "numbers": [],
            "organizations": [],
            "locations": []
        }
        
        # Extrair datas (formato simples)
        dates = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text)
        entities["dates"] = dates
        
        # Extrair números
        numbers = re.findall(r'\d+(?:\.\d+)?', text)
        entities["numbers"] = numbers[:10]  # Limitar quantidade
        
        # Extrair palavras capitalizadas (possíveis nomes próprios)
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        entities["organizations"] = list(set(capitalized))[:10]
        
        return entities
    
    @staticmethod
    def calculate_readability(text: str) -> Dict[str, Any]:
        """
        Calcula métricas de legibilidade do texto
        
        Args:
            text: Texto a ser analisado
            
        Returns:
            Dicionário com métricas
        """
        sentences = PreprocessingService.extract_sentences(text)
        words = text.split()
        
        num_sentences = len(sentences)
        num_words = len(words)
        num_chars = len(text)
        
        avg_words_per_sentence = num_words / num_sentences if num_sentences > 0 else 0
        avg_chars_per_word = num_chars / num_words if num_words > 0 else 0
        
        return {
            "num_sentences": num_sentences,
            "num_words": num_words,
            "num_chars": num_chars,
            "avg_words_per_sentence": round(avg_words_per_sentence, 2),
            "avg_chars_per_word": round(avg_chars_per_word, 2)
        }
    
    @staticmethod
    def is_valid_content(text: str) -> bool:
        """
        Verifica se o conteúdo é válido para análise
        
        Args:
            text: Texto a ser validado
            
        Returns:
            True se válido, False caso contrário
        """
        if not text or len(text.strip()) < 10:
            return False
        
        # Verificar se não é apenas números ou caracteres especiais
        alpha_chars = sum(c.isalpha() for c in text)
        if alpha_chars < len(text) * 0.3:
            return False
        
        return True


# Instância global do serviço
preprocessing_service = PreprocessingService()

