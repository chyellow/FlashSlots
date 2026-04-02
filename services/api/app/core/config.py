from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    cors_origins: str = "http://localhost:5173"
    hold_minutes: int = 5

    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()