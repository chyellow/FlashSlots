from fastapi import APIRouter
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.db_check import router as db_check_router
from app.api.v1.routes.profiles import router as profiles_router
from app.api.v1.routes.auth import router as auth_router  # <-- add this
from services.api.app.api.v1.routes import router as reservations_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(db_check_router, tags=["db"])
api_router.include_router(profiles_router, tags=["profiles"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])  # <-- add this
api_router.include_router(reservations_router,tags=["reservations"])