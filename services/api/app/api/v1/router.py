from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.businesses import router as businesses_router
from app.api.v1.routes.db_check import router as db_check_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.openings import router as openings_router
from app.api.v1.routes.profiles import router as profiles_router
from app.api.v1.routes.reservations import router as reservations_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(db_check_router)
api_router.include_router(auth_router)
api_router.include_router(profiles_router)
api_router.include_router(businesses_router)
api_router.include_router(openings_router)
api_router.include_router(reservations_router)