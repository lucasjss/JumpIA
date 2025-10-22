"""
Serviço principal de fact-checking
"""
import logging
import time
from typing import Dict, Any

from app.models import (
    FactCheckRequest, FactCheckResponse, ContentType,
    CredibilityLevel, Claim, Source
)
from app.services.gemini_service import gemini_service
from app.services.search_service import search_service
from app.services.preprocessing import preprocessing_service
from app.services.media_service import media_service

logger = logging.getLogger(__name__)


class FactCheckService:
    """Serviço principal para coordenar fact-checking"""
    
    async def check_content(self, request: FactCheckRequest) -> FactCheckResponse:
        """
        Realiza fact-checking completo do conteúdo
        
        Args:
            request: Requisição de fact-checking
            
        Returns:
            Resposta com análise completa
        """
        start_time = time.time()
        
        try:
            # 1. Pré-processar conteúdo
            logger.info("📝 Pré-processando conteúdo...")
            content = await self._preprocess_content(request)
            
            # 2. Validar conteúdo
            if not preprocessing_service.is_valid_content(content):
                raise ValueError("Conteúdo inválido ou muito curto para análise")
            
            # 3. Detectar red flags iniciais
            logger.info("🚩 Detectando sinais de alerta...")
            red_flags = preprocessing_service.detect_red_flags(content)
            
            # 4. Analisar com Gemini
            logger.info("🤖 Analisando com Gemini AI...")
            gemini_analysis = await gemini_service.analyze_content(content, request.language)
            
            # 5. Buscar fontes externas (se solicitado)
            sources_checked = []
            if request.check_sources:
                logger.info("🔍 Buscando fontes externas...")
                sources_checked = await self._search_external_sources(content, gemini_analysis)
            
            # 6. Consolidar análise
            logger.info("📊 Consolidando análise...")
            response = await self._build_response(
                request=request,
                content=content,
                gemini_analysis=gemini_analysis,
                sources_checked=sources_checked,
                red_flags=red_flags,
                start_time=start_time
            )
            
            processing_time = time.time() - start_time
            logger.info(f"✅ Fact-checking concluído em {processing_time:.2f}s")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Erro no fact-checking: {e}", exc_info=True)
            raise
    
    async def _preprocess_content(self, request: FactCheckRequest) -> str:
        """
        Pré-processa o conteúdo baseado no tipo
        
        Args:
            request: Requisição de fact-checking
            
        Returns:
            Conteúdo processado
        """
        content = request.content
        
        if request.content_type == ContentType.URL:
            # Buscar conteúdo da URL
            logger.info(f"🌐 Buscando conteúdo da URL: {content}")
            url_content = await search_service.fetch_url_content(content)
            
            if not url_content:
                raise ValueError(f"Não foi possível buscar conteúdo da URL: {content}")
            
            content = url_content
        
        elif request.content_type == ContentType.IMAGE:
            # Analisar imagem
            logger.info(f"🖼️ Analisando imagem: {content}")
            image_analysis = await media_service.analyze_image(content)
            
            # Combinar texto extraído com descrição
            extracted_text = image_analysis.get('extracted_text', '')
            description = image_analysis.get('description', '')
            
            content = f"ANÁLISE DE IMAGEM:\n\n"
            content += f"Descrição: {description}\n\n"
            if extracted_text:
                content += f"Texto extraído: {extracted_text}\n\n"
            
            # Adicionar claims da imagem
            image_claims = image_analysis.get('claims', [])
            if image_claims:
                content += f"Afirmações identificadas: {', '.join(image_claims)}"
        
        elif request.content_type == ContentType.VIDEO:
            # Analisar vídeo
            logger.info(f"🎥 Analisando vídeo: {content}")
            video_analysis = await media_service.analyze_video(content)
            
            content = f"ANÁLISE DE VÍDEO:\n\n"
            content += f"Duração: {video_analysis.get('duration', 0):.2f}s\n"
            content += f"Frames analisados: {video_analysis.get('frames_analyzed', 0)}\n\n"
            
            # Consolidar análises de frames
            frames_content = video_analysis.get('frames_content', [])
            if frames_content:
                content += "Conteúdo visual identificado:\n"
                for i, frame in enumerate(frames_content, 1):
                    content += f"{i}. {frame.get('description', 'N/A')}\n"
        
        # Limpar texto
        content = preprocessing_service.clean_text(content)
        
        return content
    
    async def _search_external_sources(
        self,
        content: str,
        gemini_analysis: Dict[str, Any]
    ) -> list[Source]:
        """
        Busca fontes externas para verificação
        
        Args:
            content: Conteúdo a ser verificado
            gemini_analysis: Análise do Gemini
            
        Returns:
            Lista de fontes encontradas
        """
        sources = []
        
        # Extrair principais afirmações para buscar
        claims = gemini_analysis.get("claims", [])
        
        if claims:
            # Buscar fontes para a primeira afirmação (mais relevante)
            main_claim = claims[0].get("text", "")
            if main_claim:
                try:
                    claim_sources = await search_service.search_sources(main_claim, max_results=3)
                    sources.extend(claim_sources)
                except Exception as e:
                    logger.error(f"Erro ao buscar fontes para afirmação: {e}")
        
        # Se não encontrou fontes, buscar com o conteúdo geral (primeiras palavras)
        if not sources:
            query = " ".join(content.split()[:10])  # Primeiras 10 palavras
            try:
                general_sources = await search_service.search_sources(query, max_results=5)
                sources.extend(general_sources)
            except Exception as e:
                logger.error(f"Erro ao buscar fontes gerais: {e}")
        
        return sources
    
    async def _build_response(
        self,
        request: FactCheckRequest,
        content: str,
        gemini_analysis: Dict[str, Any],
        sources_checked: list[Source],
        red_flags: list[str],
        start_time: float
    ) -> FactCheckResponse:
        """
        Constrói a resposta final de fact-checking
        
        Args:
            request: Requisição original
            content: Conteúdo processado
            gemini_analysis: Análise do Gemini
            sources_checked: Fontes verificadas
            red_flags: Sinais de alerta detectados
            start_time: Timestamp de início
            
        Returns:
            Resposta completa
        """
        # Converter claims do Gemini para modelo Claim
        claims = []
        for claim_data in gemini_analysis.get("claims", []):
            claim = Claim(
                text=claim_data.get("text", ""),
                veracity=claim_data.get("veracity", "não verificável"),
                confidence=claim_data.get("confidence", 0.5),
                explanation=claim_data.get("explanation", ""),
                sources=[]  # Fontes específicas por claim poderiam ser adicionadas
            )
            claims.append(claim)
        
        # Determinar credibilidade geral
        credibility_score = gemini_analysis.get("credibility_score", 0.5)
        overall_credibility = self._determine_credibility_level(credibility_score)
        
        # Combinar red flags
        all_red_flags = list(set(red_flags + gemini_analysis.get("red_flags", [])))
        
        # Calcular tempo de processamento
        processing_time = time.time() - start_time
        
        # Construir resposta
        response = FactCheckResponse(
            content=content[:500],  # Limitar tamanho do conteúdo na resposta
            content_type=request.content_type,
            overall_credibility=overall_credibility,
            credibility_score=credibility_score,
            summary=gemini_analysis.get("summary", "Análise concluída."),
            claims=claims,
            sources_checked=sources_checked,
            red_flags=all_red_flags,
            processing_time=round(processing_time, 2)
        )
        
        return response
    
    def _determine_credibility_level(self, score: float) -> CredibilityLevel:
        """
        Determina o nível de credibilidade baseado no score
        
        Args:
            score: Score de credibilidade (0-1)
            
        Returns:
            Nível de credibilidade
        """
        if score >= 0.8:
            return CredibilityLevel.HIGH
        elif score >= 0.6:
            return CredibilityLevel.MEDIUM
        elif score >= 0.4:
            return CredibilityLevel.LOW
        elif score >= 0.2:
            return CredibilityLevel.VERY_LOW
        else:
            return CredibilityLevel.UNVERIFIABLE


# Instância global do serviço
factcheck_service = FactCheckService()

