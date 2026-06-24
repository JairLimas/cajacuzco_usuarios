from fastapi import FastAPI
from app.routes.usuario import router_usuario

app = FastAPI(
    title="Banco Cuzco API",
    version="1.0.0"
)

app.include_router(router_usuario)