from fastapi import APIRouter

router_usuario = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router_usuario.get("/")
def listar_usuarios():
    return {
        "mensaje": "Lista de usuarios"
    }