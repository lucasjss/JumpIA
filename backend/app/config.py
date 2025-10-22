"""
Configurações da aplicação
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente"""
    
    # Application
    APP_NAME: str = "FactCheck Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:4200,http://localhost:3000"
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    
    # Google Search API (opcional)
    GOOGLE_SEARCH_API_KEY: str = ""
    GOOGLE_SEARCH_ENGINE_ID: str = ""
    
    # News API (opcional)
    NEWS_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Retorna lista de origens permitidas para CORS"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Instância global de configurações
settings = Settings()

