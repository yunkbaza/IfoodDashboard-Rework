import requests
import random
from datetime import datetime, timedelta

API_URL = "http://localhost:8000/api/pedidos"

def seed_data():
    print("Iniciando geração de dados de teste...")
    
    produtos = [
        {"nome": "Hambúrguer Artesanal", "preco": 35.0, "custo": 12.0},
        {"nome": "Batata Frita", "preco": 18.0, "custo": 4.5},
        {"nome": "Refrigerante Lata", "preco": 7.0, "custo": 2.8},
        {"nome": "Combo Casal", "preco": 85.0, "custo": 32.0}
    ]

    # Lista de bairros para gerar inteligência de geolocalização
    bairros = ["Centro", "Vila Mariana", "Pinheiros", "Moema", "Tatuapé", "Liberdade", "Itaim Bibi"]

    for i in range(50):
        dias_atras = random.randint(0, 7)
        data_pedido = datetime.utcnow() - timedelta(days=dias_atras)
        
        prod = random.choice(produtos)
        qtd = random.randint(1, 3)
        valor_total = (prod["preco"] * qtd) + 5.90 

        payload = {
            "id_pedido": f"IFD-{random.randint(10000, 99999)}",
            "status": "CONCLUIDO",
            "valor_total": valor_total,
            "taxa_entrega": 5.90,
            "forma_pagamento": random.choice(["CARTAO", "PIX", "DINHEIRO"]),
            "bairro_destino": random.choice(bairros), # <-- Sorteando o bairro
            "itens": [
                {
                    "nome_produto": prod["nome"],
                    "quantidade": qtd,
                    "preco_unitario": prod["preco"]
                }
            ]
        }

        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 200:
                print(f"Pedido {i+1} criado com sucesso!")
            else:
                print(f"Erro {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Erro ao criar pedido: {e}")

if __name__ == "__main__":
    seed_data()