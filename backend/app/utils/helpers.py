"""
Funções auxiliares
"""
from datetime import datetime
from typing import Any, Dict
import json


def format_timestamp(dt: datetime = None) -> str:
    """
    Formata timestamp para string ISO
    
    Args:
        dt: Datetime object (usa agora se None)
        
    Returns:
        String formatada
    """
    if dt is None:
        dt = datetime.utcnow()
    return dt.isoformat()


def safe_json_loads(text: str, default: Any = None) -> Any:
    """
    Carrega JSON de forma segura
    
    Args:
        text: String JSON
        default: Valor padrão em caso de erro
        
    Returns:
        Objeto parseado ou default
    """
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """
    Trunca texto mantendo palavras inteiras
    
    Args:
        text: Texto a ser truncado
        max_length: Tamanho máximo
        suffix: Sufixo a adicionar
        
    Returns:
        Texto truncado
    """
    if len(text) <= max_length:
        return text
    
    truncated = text[:max_length].rsplit(' ', 1)[0]
    return truncated + suffix


def calculate_confidence_score(scores: list[float]) -> float:
    """
    Calcula score de confiança médio
    
    Args:
        scores: Lista de scores
        
    Returns:
        Score médio (0-1)
    """
    if not scores:
        return 0.5
    
    return sum(scores) / len(scores)


def normalize_url(url: str) -> str:
    """
    Normaliza URL
    
    Args:
        url: URL a ser normalizada
        
    Returns:
        URL normalizada
    """
    url = url.strip()
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    return url


def extract_domain(url: str) -> str:
    """
    Extrai domínio de uma URL
    
    Args:
        url: URL completa
        
    Returns:
        Domínio extraído
    """
    from urllib.parse import urlparse
    
    try:
        parsed = urlparse(url)
        return parsed.netloc
    except Exception:
        return ""


def sanitize_input(text: str) -> str:
    """
    Sanitiza input do usuário
    
    Args:
        text: Texto a ser sanitizado
        
    Returns:
        Texto sanitizado
    """
    # Remover caracteres de controle
    sanitized = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
    
    # Limitar tamanho
    max_length = 50000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()

