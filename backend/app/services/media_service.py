"""
Serviço de análise de mídia (imagens e vídeos)
"""
import logging
import os
import tempfile
import base64
from typing import Dict, Any, Optional, List
from pathlib import Path
import httpx

# Imports condicionais para evitar erros se não instalado
try:
    from PIL import Image
    import pytesseract
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL/pytesseract não disponível. Análise de imagem limitada.")

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logging.warning("OpenCV não disponível. Análise de vídeo limitada.")

try:
    from moviepy.editor import VideoFileClip
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    logging.warning("MoviePy não disponível. Extração de áudio limitada.")

import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)


class MediaService:
    """Serviço para análise de imagens e vídeos"""
    
    def __init__(self):
        """Inicializa o serviço de mídia"""
        self.temp_dir = tempfile.gettempdir()
        
        # Configurar Gemini para visão
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Usar modelo com suporte a visão
            self.vision_model = genai.GenerativeModel('gemini-2.0-flash-exp')
            logger.info("✅ Gemini Vision API inicializada")
        else:
            self.vision_model = None
            logger.warning("⚠️ Gemini API não configurada para análise de mídia")
    
    async def analyze_image(self, image_source: str) -> Dict[str, Any]:
        """
        Analisa uma imagem (URL ou caminho local)
        
        Args:
            image_source: URL ou caminho da imagem
            
        Returns:
            Dicionário com análise da imagem
        """
        try:
            # Baixar imagem se for URL
            if image_source.startswith(('http://', 'https://')):
                image_path = await self._download_image(image_source)
            else:
                image_path = image_source
            
            # Análise com Gemini Vision (preferencial)
            if self.vision_model:
                gemini_analysis = await self._analyze_image_with_gemini(image_path)
                
                # Complementar com OCR se disponível
                if PIL_AVAILABLE:
                    ocr_text = self._extract_text_from_image(image_path)
                    if ocr_text:
                        gemini_analysis['extracted_text'] = ocr_text
                
                return gemini_analysis
            
            # Fallback: apenas OCR
            elif PIL_AVAILABLE:
                ocr_text = self._extract_text_from_image(image_path)
                return {
                    'extracted_text': ocr_text,
                    'description': 'Texto extraído via OCR',
                    'analysis': 'Análise visual não disponível (Gemini não configurado)',
                    'contains_text': bool(ocr_text)
                }
            
            else:
                raise Exception("Nenhum método de análise de imagem disponível")
                
        except Exception as e:
            logger.error(f"Erro ao analisar imagem: {e}")
            raise Exception(f"Erro na análise de imagem: {str(e)}")
    
    async def analyze_video(self, video_source: str) -> Dict[str, Any]:
        """
        Analisa um vídeo (URL ou caminho local)
        
        Args:
            video_source: URL ou caminho do vídeo
            
        Returns:
            Dicionário com análise do vídeo
        """
        try:
            # Baixar vídeo se for URL
            if video_source.startswith(('http://', 'https://')):
                video_path = await self._download_video(video_source)
            else:
                video_path = video_source
            
            analysis = {
                'frames_analyzed': [],
                'audio_transcription': None,
                'summary': '',
                'duration': 0
            }
            
            # Extrair frames-chave
            if CV2_AVAILABLE:
                frames = self._extract_key_frames(video_path)
                analysis['frames_analyzed'] = len(frames)
                
                # Analisar frames com Gemini
                if self.vision_model and frames:
                    frame_analyses = []
                    for i, frame_path in enumerate(frames[:5]):  # Limitar a 5 frames
                        frame_analysis = await self._analyze_image_with_gemini(frame_path)
                        frame_analyses.append(frame_analysis)
                    
                    # Consolidar análises
                    analysis['frames_content'] = frame_analyses
            
            # Extrair e transcrever áudio
            if MOVIEPY_AVAILABLE:
                audio_path = self._extract_audio(video_path)
                if audio_path:
                    # Aqui poderia usar Gemini ou Whisper para transcrição
                    # Por enquanto, apenas indicar que áudio foi extraído
                    analysis['audio_extracted'] = True
                    analysis['audio_path'] = audio_path
            
            # Obter duração
            if CV2_AVAILABLE:
                analysis['duration'] = self._get_video_duration(video_path)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Erro ao analisar vídeo: {e}")
            raise Exception(f"Erro na análise de vídeo: {str(e)}")
    
    async def _analyze_image_with_gemini(self, image_path: str) -> Dict[str, Any]:
        """
        Analisa imagem usando Gemini Vision
        
        Args:
            image_path: Caminho da imagem
            
        Returns:
            Análise da imagem
        """
        try:
            # Carregar imagem
            image = Image.open(image_path)
            
            # Prompt para análise de fact-checking
            prompt = """Analise esta imagem do ponto de vista de verificação de fatos (fact-checking).

Forneça sua análise no formato JSON:

{
  "description": "<descrição detalhada do que aparece na imagem>",
  "contains_text": <true ou false>,
  "extracted_text": "<texto visível na imagem, se houver>",
  "claims": ["<afirmações visuais ou textuais identificadas>"],
  "red_flags": ["<sinais de alerta: manipulação, deepfake, contexto enganoso, etc>"],
  "authenticity_score": <0 a 1, probabilidade de ser autêntica>,
  "context_needed": "<contexto adicional necessário para verificação completa>"
}

Responda APENAS com o JSON, sem texto adicional."""

            # Gerar análise
            response = self.vision_model.generate_content([prompt, image])
            
            # Parsear resposta
            result = self._parse_json_response(response.text)
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao analisar com Gemini Vision: {e}")
            return {
                'description': 'Erro na análise',
                'contains_text': False,
                'extracted_text': '',
                'claims': [],
                'red_flags': ['Erro ao processar imagem'],
                'authenticity_score': 0.5,
                'context_needed': 'Análise manual necessária'
            }
    
    def _extract_text_from_image(self, image_path: str) -> str:
        """
        Extrai texto de imagem usando OCR
        
        Args:
            image_path: Caminho da imagem
            
        Returns:
            Texto extraído
        """
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image, lang='por+eng')
            return text.strip()
        except Exception as e:
            logger.error(f"Erro no OCR: {e}")
            return ""
    
    def _extract_key_frames(self, video_path: str, num_frames: int = 5) -> List[str]:
        """
        Extrai frames-chave do vídeo
        
        Args:
            video_path: Caminho do vídeo
            num_frames: Número de frames a extrair
            
        Returns:
            Lista de caminhos dos frames salvos
        """
        try:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            frame_paths = []
            interval = max(1, total_frames // num_frames)
            
            for i in range(num_frames):
                frame_num = i * interval
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
                ret, frame = cap.read()
                
                if ret:
                    frame_path = os.path.join(self.temp_dir, f"frame_{i}.jpg")
                    cv2.imwrite(frame_path, frame)
                    frame_paths.append(frame_path)
            
            cap.release()
            return frame_paths
            
        except Exception as e:
            logger.error(f"Erro ao extrair frames: {e}")
            return []
    
    def _extract_audio(self, video_path: str) -> Optional[str]:
        """
        Extrai áudio do vídeo
        
        Args:
            video_path: Caminho do vídeo
            
        Returns:
            Caminho do áudio extraído ou None
        """
        try:
            video = VideoFileClip(video_path)
            audio_path = os.path.join(self.temp_dir, "extracted_audio.mp3")
            video.audio.write_audiofile(audio_path, logger=None)
            video.close()
            return audio_path
        except Exception as e:
            logger.error(f"Erro ao extrair áudio: {e}")
            return None
    
    def _get_video_duration(self, video_path: str) -> float:
        """
        Obtém duração do vídeo em segundos
        
        Args:
            video_path: Caminho do vídeo
            
        Returns:
            Duração em segundos
        """
        try:
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            cap.release()
            return duration
        except Exception as e:
            logger.error(f"Erro ao obter duração: {e}")
            return 0
    
    async def _download_image(self, url: str) -> str:
        """
        Baixa imagem de URL
        
        Args:
            url: URL da imagem
            
        Returns:
            Caminho do arquivo baixado
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
                # Salvar em arquivo temporário
                ext = Path(url).suffix or '.jpg'
                temp_path = os.path.join(self.temp_dir, f"downloaded_image{ext}")
                
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Erro ao baixar imagem: {e}")
            raise
    
    async def _download_video(self, url: str) -> str:
        """
        Baixa vídeo de URL
        
        Args:
            url: URL do vídeo
            
        Returns:
            Caminho do arquivo baixado
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=60.0)
                response.raise_for_status()
                
                # Salvar em arquivo temporário
                ext = Path(url).suffix or '.mp4'
                temp_path = os.path.join(self.temp_dir, f"downloaded_video{ext}")
                
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Erro ao baixar vídeo: {e}")
            raise
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """
        Parseia resposta JSON do Gemini
        
        Args:
            text: Texto da resposta
            
        Returns:
            Dicionário parseado
        """
        import json
        
        try:
            # Limpar markdown
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Erro ao parsear JSON: {text}")
            return {}


# Instância global do serviço
media_service = MediaService()

