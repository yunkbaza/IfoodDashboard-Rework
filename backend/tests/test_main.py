from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_listar_lojas_sem_token():
    # Testa se a API bloqueia acesso sem login (Segurança)
    response = client.get("/api/lojas")
    assert response.status_code == 401 # Esperamos um erro de autorização