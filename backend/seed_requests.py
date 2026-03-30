import requests
import random
from datetime import datetime, timedelta

# Dica: Verifique se o token de admin está ativo para estas chamadas
API_URL = "http://127.0.0.1:8000/api/pedidos/simular" 

def seed_via_api():
    print("🚀 Simulando tráfego via API...")
    
    # 1. Primeiro buscamos as lojas existentes
    try:
        # Nota: Estas chamadas podem precisar do Header 'Authorization: Bearer <TOKEN>'
        # se o seu backend já estiver com o cadeado ativado.
        for i in range(10):
            # Usando o seu endpoint de simulação que já criámos no main.py
            response = requests.post(API_URL) 
            if response.status_code == 200:
                print(f"Evento {i+1}: Novo pedido disparado via WebSocket!")
            else:
                print(f"Atenção: Status {response.status_code}. Verifique a autenticação.")
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    seed_via_api()