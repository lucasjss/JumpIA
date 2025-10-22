"""
Modelos de dados da aplicação usando Pydantic
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    """Tipo de conteúdo a ser verificado"""
    TEXT = "text"
    URL = "url"
    IMAGE = "image"
    VIDEO = "video"


class CredibilityLevel(str, Enum):
    """Nível de credibilidade da informação"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    VERY_LOW = "very_low"
    UNVERIFIABLE = "unverifiable"


class FactCheckRequest(BaseModel):
    """Requisição para fact-checking"""
    content: str = Field(..., description="Texto, URL ou conteúdo a ser verificado")
    content_type: ContentType = Field(default=ContentType.TEXT, description="Tipo de conteúdo")
    check_sources: bool = Field(default=True, description="Se deve buscar fontes externas")
    language: str = Field(default="pt", description="Idioma do conteúdo (pt, en, es, etc)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "O Brasil é o maior produtor de café do mundo.",
                "content_type": "text",
                "check_sources": True,
                "language": "pt"
            }
        }


class Source(BaseModel):
    """Fonte verificada"""
    title: str = Field(..., description="Título da fonte")
    url: Optional[str] = Field(None, description="URL da fonte")
    credibility: str = Field(..., description="Credibilidade da fonte")
    relevance: float = Field(..., ge=0, le=1, description="Relevância da fonte (0-1)")
    summary: Optional[str] = Field(None, description="Resumo do conteúdo da fonte")


class Claim(BaseModel):
    """Afirmação encontrada no texto"""
    text: str = Field(..., description="Texto da afirmação")
    veracity: str = Field(..., description="Veracidade (verdadeiro, falso, parcialmente verdadeiro, etc)")
    confidence: float = Field(..., ge=0, le=1, description="Confiança na avaliação (0-1)")
    explanation: str = Field(..., description="Explicação da avaliação")
    sources: List[Source] = Field(default_factory=list, description="Fontes que suportam ou refutam")


class FactCheckResponse(BaseModel):
    """Resposta da verificação de fatos"""
    content: str = Field(..., description="Conteúdo original verificado")
    content_type: ContentType = Field(..., description="Tipo de conteúdo")
    overall_credibility: CredibilityLevel = Field(..., description="Credibilidade geral")
    credibility_score: float = Field(..., ge=0, le=1, description="Score de credibilidade (0-1)")
    summary: str = Field(..., description="Resumo da análise")
    claims: List[Claim] = Field(default_factory=list, description="Afirmações encontradas e verificadas")
    sources_checked: List[Source] = Field(default_factory=list, description="Fontes consultadas")
    red_flags: List[str] = Field(default_factory=list, description="Sinais de alerta encontrados")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp da verificação")
    processing_time: float = Field(..., description="Tempo de processamento em segundos")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "O Brasil é o maior produtor de café do mundo.",
                "content_type": "text",
                "overall_credibility": "high",
                "credibility_score": 0.92,
                "summary": "A afirmação é verdadeira. O Brasil é de fato o maior produtor de café do mundo.",
                "claims": [
                    {
                        "text": "O Brasil é o maior produtor de café do mundo",
                        "veracity": "verdadeiro",
                        "confidence": 0.95,
                        "explanation": "Dados da ICO confirmam que o Brasil produz cerca de 37% do café mundial.",
                        "sources": []
                    }
                ],
                "sources_checked": [],
                "red_flags": [],
                "timestamp": "2025-10-17T12:00:00",
                "processing_time": 2.5
            }
        }


class HealthResponse(BaseModel):
    """Resposta do health check"""
    status: str = Field(..., description="Status da API")
    version: str = Field(..., description="Versão da API")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: Dict[str, bool] = Field(..., description="Status dos serviços integrados")


class ErrorResponse(BaseModel):
    """Resposta de erro"""
    error: str = Field(..., description="Mensagem de erro")
    detail: Optional[str] = Field(None, description="Detalhes adicionais do erro")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

