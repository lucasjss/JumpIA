"""
Rotas para upload de arquivos (imagens e vídeos)
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
import logging
import os
import tempfile
from typing import Optional

from app.models import FactCheckResponse, ContentType
from app.services.factcheck_service import factcheck_service
from app.models import FactCheckRequest

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/factcheck/upload",
    response_model=FactCheckResponse,
    tags=["Fact-Checking"],
    summary="Verificar fatos de arquivo enviado (imagem ou vídeo)",
    description="""
    Realiza verificação de fatos de um arquivo enviado (imagem ou vídeo).
    
    Suporta:
    - Imagens: JPG, PNG, GIF, WEBP
    - Vídeos: MP4, AVI, MOV, WEBM
    
    A análise inclui:
    - Detecção de conteúdo gerado por IA
    - Detecção de deepfake
    - Identificação de manipulação
    - Extração de texto (OCR)
    - Análise de credibilidade
    """
)
async def factcheck_upload(
    file: UploadFile = File(..., description="Arquivo de imagem ou vídeo"),
    check_sources: bool = Form(default=False, description="Se deve buscar fontes externas"),
    language: str = Form(default="pt", description="Idioma (pt, en, es)")
):
    """
    Endpoint para upload e verificação de arquivos
    
    Args:
        file: Arquivo enviado (imagem ou vídeo)
        check_sources: Se deve buscar fontes externas
        language: Idioma do conteúdo
        
    Returns:
        Análise completa de fact-checking
    """
    try:
        logger.info(f"📤 Upload recebido: {file.filename} ({file.content_type})")
        
        # Validar tipo de arquivo
        allowed_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"]
        allowed_video_types = ["video/mp4", "video/avi", "video/quicktime", "video/webm", "video/x-msvideo"]
        
        content_type = None
        if file.content_type in allowed_image_types:
            content_type = ContentType.IMAGE
        elif file.content_type in allowed_video_types:
            content_type = ContentType.VIDEO
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não suportado: {file.content_type}. "
                       f"Envie imagens (JPG, PNG, GIF, WEBP) ou vídeos (MP4, AVI, MOV, WEBM)."
            )
        
        # Validar tamanho do arquivo (máximo 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        file_size = 0
        
        # Salvar arquivo temporário
        temp_dir = tempfile.gettempdir()
        file_extension = os.path.splitext(file.filename)[1]
        temp_file_path = os.path.join(temp_dir, f"upload_{os.urandom(8).hex()}{file_extension}")
        
        try:
            with open(temp_file_path, "wb") as temp_file:
                while chunk := await file.read(8192):  # Ler em chunks de 8KB
                    file_size += len(chunk)
                    if file_size > max_size:
                        raise HTTPException(
                            status_code=413,
                            detail=f"Arquivo muito grande. Tamanho máximo: 50MB"
                        )
                    temp_file.write(chunk)
            
            logger.info(f"📁 Arquivo salvo temporariamente: {temp_file_path} ({file_size / 1024 / 1024:.2f}MB)")
            
            # Criar requisição de fact-checking
            request = FactCheckRequest(
                content=temp_file_path,
                content_type=content_type,
                check_sources=check_sources,
                language=language
            )
            
            # Processar fact-checking
            response = await factcheck_service.check_content(request)
            
            logger.info(f"✅ Análise concluída: {response.overall_credibility}")
            
            return response
            
        finally:
            # Limpar arquivo temporário
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                    logger.info(f"🗑️ Arquivo temporário removido: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Não foi possível remover arquivo temporário: {e}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao processar upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@router.post(
    "/factcheck/upload/batch",
    tags=["Fact-Checking"],
    summary="Verificar múltiplos arquivos",
    description="Permite enviar múltiplos arquivos para verificação em lote"
)
async def factcheck_upload_batch(
    files: list[UploadFile] = File(..., description="Lista de arquivos"),
    check_sources: bool = Form(default=False),
    language: str = Form(default="pt")
):
    """
    Endpoint para upload em lote
    
    Args:
        files: Lista de arquivos
        check_sources: Se deve buscar fontes externas
        language: Idioma
        
    Returns:
        Lista de análises
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 10 arquivos por requisição"
        )
    
    results = []
    
    for file in files:
        try:
            result = await factcheck_upload(file, check_sources, language)
            results.append({
                "filename": file.filename,
                "status": "success",
                "result": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
    
    return {
        "total": len(files),
        "processed": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results
    }

