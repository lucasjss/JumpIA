"""
Aplicação FastAPI principal
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.models import HealthResponse, ErrorResponse
from app.api.routes import router as api_router
from app.api.upload_routes import router as upload_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento do ciclo de vida da aplicação"""
    logger.info("🚀 Iniciando FactCheck Backend API...")
    logger.info(f"📝 Versão: {settings.APP_VERSION}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    
    # Verificar configurações essenciais
    if not settings.GEMINI_API_KEY:
        logger.warning("⚠️  GEMINI_API_KEY não configurada!")
    else:
        logger.info("✅ Gemini API configurada")
    
    yield
    
    logger.info("👋 Encerrando FactCheck Backend API...")


# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para verificação de fatos (fact-checking) usando Gemini AI",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas da API
app.include_router(api_router, prefix="/api")
app.include_router(upload_router, prefix="/api")

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raiz"""
    return {
        "message": "FactCheck Backend API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check da API"""
    services = {
        "gemini": bool(settings.GEMINI_API_KEY),
        "google_search": bool(settings.GOOGLE_SEARCH_API_KEY),
        "news_api": bool(settings.NEWS_API_KEY)
    }
    
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        services=services
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler para exceções HTTP"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            detail=str(exc)
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler para exceções gerais"""
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Erro interno do servidor",
            detail=str(exc) if settings.DEBUG else None
        ).model_dump()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

