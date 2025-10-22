"""
Serviço de busca externa para verificação de fontes
"""
import httpx
import logging
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

from app.config import settings
from app.models import Source

logger = logging.getLogger(__name__)


class SearchService:
    """Serviço para buscar informações em fontes externas"""
    
    def __init__(self):
        """Inicializa o serviço de busca"""
        self.google_search_available = bool(settings.GOOGLE_SEARCH_API_KEY and settings.GOOGLE_SEARCH_ENGINE_ID)
        self.news_api_available = bool(settings.NEWS_API_KEY)
        
        if self.google_search_available:
            logger.info("✅ Google Search API configurada")
        if self.news_api_available:
            logger.info("✅ News API configurada")
    
    async def search_sources(self, query: str, max_results: int = 5) -> List[Source]:
        """
        Busca fontes externas relacionadas à query
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados
            
        Returns:
            Lista de fontes encontradas
        """
        sources = []
        
        # Tentar Google Search API
        if self.google_search_available:
            try:
                google_sources = await self._google_search(query, max_results)
                sources.extend(google_sources)
            except Exception as e:
                logger.error(f"Erro ao buscar no Google: {e}")
        
        # Tentar News API
        if self.news_api_available and len(sources) < max_results:
            try:
                news_sources = await self._news_api_search(query, max_results - len(sources))
                sources.extend(news_sources)
            except Exception as e:
                logger.error(f"Erro ao buscar na News API: {e}")
        
        # Se nenhuma API está configurada, fazer busca genérica
        if not sources:
            logger.warning("Nenhuma API de busca configurada, retornando fontes genéricas")
            sources = self._get_generic_sources(query)
        
        return sources[:max_results]
    
    async def _google_search(self, query: str, max_results: int) -> List[Source]:
        """
        Busca usando Google Custom Search API
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados
            
        Returns:
            Lista de fontes
        """
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": settings.GOOGLE_SEARCH_API_KEY,
            "cx": settings.GOOGLE_SEARCH_ENGINE_ID,
            "q": query,
            "num": min(max_results, 10)
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
        
        sources = []
        for item in data.get("items", []):
            source = Source(
                title=item.get("title", ""),
                url=item.get("link", ""),
                credibility="medium",  # Poderia ser avaliado por domínio
                relevance=0.8,
                summary=item.get("snippet", "")
            )
            sources.append(source)
        
        logger.info(f"✅ Google Search retornou {len(sources)} resultados")
        return sources
    
    async def _news_api_search(self, query: str, max_results: int) -> List[Source]:
        """
        Busca usando News API
        
        Args:
            query: Termo de busca
            max_results: Número máximo de resultados
            
        Returns:
            Lista de fontes
        """
        url = "https://newsapi.org/v2/everything"
        params = {
            "apiKey": settings.NEWS_API_KEY,
            "q": query,
            "pageSize": min(max_results, 20),
            "language": "pt",
            "sortBy": "relevancy"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
        
        sources = []
        for article in data.get("articles", []):
            source = Source(
                title=article.get("title", ""),
                url=article.get("url", ""),
                credibility="medium",
                relevance=0.7,
                summary=article.get("description", "")
            )
            sources.append(source)
        
        logger.info(f"✅ News API retornou {len(sources)} resultados")
        return sources
    
    def _get_generic_sources(self, query: str) -> List[Source]:
        """
        Retorna fontes genéricas confiáveis para consulta manual
        
        Args:
            query: Termo de busca
            
        Returns:
            Lista de fontes genéricas
        """
        # Fontes confiáveis brasileiras e internacionais
        trusted_sources = [
            {
                "title": "Agência Lupa - Fact-checking",
                "url": f"https://piaui.folha.uol.com.br/lupa/?s={query.replace(' ', '+')}",
                "credibility": "high",
                "summary": "Agência de fact-checking brasileira"
            },
            {
                "title": "Aos Fatos",
                "url": f"https://www.aosfatos.org/?s={query.replace(' ', '+')}",
                "credibility": "high",
                "summary": "Plataforma de fact-checking brasileira"
            },
            {
                "title": "E-Farsas",
                "url": f"https://www.e-farsas.com/?s={query.replace(' ', '+')}",
                "credibility": "high",
                "summary": "Site brasileiro de verificação de boatos"
            },
            {
                "title": "Snopes",
                "url": f"https://www.snopes.com/?s={query.replace(' ', '+')}",
                "credibility": "high",
                "summary": "Site internacional de fact-checking"
            },
            {
                "title": "FactCheck.org",
                "url": f"https://www.factcheck.org/?s={query.replace(' ', '+')}",
                "credibility": "high",
                "summary": "Projeto de fact-checking da Universidade da Pensilvânia"
            }
        ]
        
        sources = []
        for src in trusted_sources:
            sources.append(Source(
                title=src["title"],
                url=src["url"],
                credibility=src["credibility"],
                relevance=0.6,
                summary=src["summary"]
            ))
        
        logger.info(f"📚 Retornando {len(sources)} fontes genéricas confiáveis")
        return sources
    
    async def fetch_url_content(self, url: str) -> Optional[str]:
        """
        Busca o conteúdo de uma URL
        
        Args:
            url: URL a ser buscada
            
        Returns:
            Conteúdo textual da página ou None
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0, follow_redirects=True)
                response.raise_for_status()
                
                # Parsear HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Remover scripts e estilos
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Extrair texto
                text = soup.get_text()
                
                # Limpar texto
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                return text[:5000]  # Limitar tamanho
                
        except Exception as e:
            logger.error(f"Erro ao buscar URL {url}: {e}")
            return None
    
    def evaluate_source_credibility(self, url: str) -> str:
        """
        Avalia a credibilidade de uma fonte baseado no domínio
        
        Args:
            url: URL da fonte
            
        Returns:
            Nível de credibilidade (high, medium, low)
        """
        # Domínios confiáveis
        high_credibility_domains = [
            "gov.br", "edu.br", "bbc.com", "reuters.com", "apnews.com",
            "nature.com", "science.org", "who.int", "un.org",
            "folha.uol.com.br", "estadao.com.br", "g1.globo.com",
            "aosfatos.org", "piaui.folha.uol.com.br", "snopes.com"
        ]
        
        # Domínios suspeitos
        low_credibility_indicators = [
            "blogspot", "wordpress.com", "wix.com", "weebly.com",
            "tumblr.com"
        ]
        
        url_lower = url.lower()
        
        for domain in high_credibility_domains:
            if domain in url_lower:
                return "high"
        
        for indicator in low_credibility_indicators:
            if indicator in url_lower:
                return "low"
        
        return "medium"


# Instância global do serviço
search_service = SearchService()

