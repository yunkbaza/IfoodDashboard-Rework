#!/usr/bin/env python3
import requests
import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.pedido import Pedido, ItemPedido

API_URL = "http://127.0.0.1:8000/api/pedidos"

def seed_limpo():
    db = SessionLocal()
    try:
        print("🧹 Limpando base de dados antiga...")
        db.query(ItemPedido).delete()
        db.query(Pedido).delete()
        db.commit()
    except Exception as e:
        print(f"⚠️ Nota: Erro ao limpar (pode estar vazia): {e}")
    finally:
        db.close()
    
    print("🌱 Gerando 150 novos pedidos (Histórico de 6 meses)...")
    produtos = [
        {"nome": "Hambúrguer Artesanal", "preco": 35.0, "custo": 12.0},
        {"nome": "Batata Frita", "preco": 18.0, "custo": 4.5},
        {"nome": "Refrigerante Lata", "preco": 7.0, "custo": 2.8},
        {"nome": "Combo Casal", "preco": 85.0, "custo": 32.0}
    ]
    bairros = ["Centro", "Vila Mariana", "Pinheiros", "Moema", "Tatuapé"]

    for i in range(150):
        # Agora gera dados dos últimos 180 dias!
        dias_atras = random.randint(0, 180)
        hora = random.randint(11, 23)
        
        data_pedido = datetime.now() - timedelta(days=dias_atras)
        data_pedido = data_pedido.replace(hour=hora, minute=random.randint(0, 59))
        
        prod = random.choice(produtos)
        qtd = random.randint(1, 4)

        payload = {
            "id_pedido": f"IFD-{random.randint(10000, 99999)}",
            "status": "CONCLUIDO",
            "valor_total": (prod["preco"] * qtd) + 5.90,
            "taxa_entrega": 5.90,
            "forma_pagamento": random.choice(["CARTAO", "PIX", "DINHEIRO"]),
            "bairro_destino": random.choice(bairros),
            "data_hora": data_pedido.isoformat(),
            "itens": [{
                "nome_produto": prod["nome"],
                "quantidade": qtd,
                "preco_unitario": prod["preco"],
                "custo_producao": prod["custo"] * qtd
            }]
        }
        
        try:
            requests.post(API_URL, json=payload)
        except:
            pass
        
    print("✅ Base de Dados populada com histórico longo!")

if __name__ == "__main__":
    seed_limpo()