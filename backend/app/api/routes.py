"""
Rotas da API REST
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging

from app.models import FactCheckRequest, FactCheckResponse, ErrorResponse
from app.services.factcheck_service import factcheck_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/factcheck",
    response_model=FactCheckResponse,
    status_code=status.HTTP_200_OK,
    tags=["Fact-Checking"],
    summary="Verificar fatos de um conteúdo",
    description="""
    Realiza verificação de fatos (fact-checking) de um conteúdo fornecido.
    
    O conteúdo pode ser:
    - **Texto**: Notícia, artigo ou qualquer texto
    - **URL**: Link para uma página web (o conteúdo será extraído)
    - **Imagem**: URL de imagem (ainda não implementado)
    
    A análise inclui:
    - Avaliação de credibilidade geral
    - Identificação e verificação de afirmações específicas
    - Busca de fontes externas (opcional)
    - Detecção de sinais de alerta (red flags)
    - Explicações detalhadas
    """
)
async def check_facts(request: FactCheckRequest):
    """
    Endpoint principal para fact-checking
    
    Args:
        request: Requisição com conteúdo a ser verificado
        
    Returns:
        Análise completa de fact-checking
    """
    try:
        logger.info(f"📥 Nova requisição de fact-checking: {request.content_type}")
        
        # Validar requisição
        if not request.content or len(request.content.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conteúdo muito curto ou vazio. Mínimo de 10 caracteres."
            )
        
        # Realizar fact-checking
        response = await factcheck_service.check_content(request)
        
        logger.info(f"✅ Fact-checking concluído: {response.overall_credibility}")
        return response
        
    except ValueError as e:
        logger.error(f"Erro de validação: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except NotImplementedError as e:
        logger.error(f"Funcionalidade não implementada: {e}")
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Erro interno: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar requisição. Tente novamente."
        )


@router.post(
    "/factcheck/quick",
    response_model=FactCheckResponse,
    status_code=status.HTTP_200_OK,
    tags=["Fact-Checking"],
    summary="Verificação rápida (sem busca de fontes)",
    description="Realiza verificação rápida sem buscar fontes externas"
)
async def quick_check(request: FactCheckRequest):
    """
    Endpoint para fact-checking rápido (sem busca de fontes)
    
    Args:
        request: Requisição com conteúdo a ser verificado
        
    Returns:
        Análise de fact-checking sem fontes externas
    """
    # Forçar check_sources = False para análise rápida
    request.check_sources = False
    return await check_facts(request)


@router.get(
    "/sources/trusted",
    tags=["Fontes"],
    summary="Listar fontes confiáveis",
    description="Retorna lista de fontes confiáveis para fact-checking"
)
async def get_trusted_sources():
    """
    Retorna lista de fontes confiáveis
    
    Returns:
        Lista de fontes confiáveis
    """
    trusted_sources = [
        {
            "name": "Agência Lupa",
            "url": "https://piaui.folha.uol.com.br/lupa/",
            "type": "fact-checking",
            "country": "BR"
        },
        {
            "name": "Aos Fatos",
            "url": "https://www.aosfatos.org/",
            "type": "fact-checking",
            "country": "BR"
        },
        {
            "name": "E-Farsas",
            "url": "https://www.e-farsas.com/",
            "type": "fact-checking",
            "country": "BR"
        },
        {
            "name": "Comprova",
            "url": "https://projetocomprova.com.br/",
            "type": "fact-checking",
            "country": "BR"
        },
        {
            "name": "Snopes",
            "url": "https://www.snopes.com/",
            "type": "fact-checking",
            "country": "US"
        },
        {
            "name": "FactCheck.org",
            "url": "https://www.factcheck.org/",
            "type": "fact-checking",
            "country": "US"
        },
        {
            "name": "PolitiFact",
            "url": "https://www.politifact.com/",
            "type": "fact-checking",
            "country": "US"
        },
        {
            "name": "Full Fact",
            "url": "https://fullfact.org/",
            "type": "fact-checking",
            "country": "UK"
        }
    ]
    
    return {
        "total": len(trusted_sources),
        "sources": trusted_sources
    }


@router.get(
    "/info",
    tags=["Info"],
    summary="Informações sobre a API",
    description="Retorna informações sobre capacidades e limitações da API"
)
async def get_api_info():
    """
    Retorna informações sobre a API
    
    Returns:
        Informações da API
    """
    return {
        "name": "FactCheck Backend API",
        "version": "1.0.0",
        "description": "API para verificação de fatos usando Gemini AI",
        "features": {
            "text_analysis": True,
            "url_analysis": True,
            "image_analysis": True,
            "video_analysis": True,
            "external_sources": True,
            "red_flags_detection": True,
            "multilingual": True
        },
        "supported_languages": ["pt", "en", "es"],
        "content_types": ["text", "url", "image", "video"],
        "endpoints": {
            "factcheck": "/api/factcheck",
            "quick_check": "/api/factcheck/quick",
            "trusted_sources": "/api/sources/trusted",
            "health": "/health",
            "docs": "/docs"
        }
    }

