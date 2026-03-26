import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.pedido import Pedido, ItemPedido, Avaliacao

def popular():
    db = SessionLocal()
    print("🧹 Limpando dados antigos...")
    db.query(ItemPedido).delete()
    db.query(Pedido).delete()
    db.query(Avaliacao).delete()
    
    bairros = ["Pinheiros", "Moema", "Itaim Bibi", "Vila Mariana", "Perdizes", "Bela Vista", "Santana"]
    pagamentos = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"]
    produtos = [
        {"nome": "Hambúrguer Artesanal", "preco": 35.0},
        {"nome": "Batata Frita Grande", "preco": 18.0},
        {"nome": "Refrigerante Lata", "preco": 7.0},
        {"nome": "Milkshake Chocolate", "preco": 22.0},
        {"nome": "Combo Casal", "preco": 85.0}
    ]

    print("🍔 Gerando 100 pedidos e avaliações...")
    
    for i in range(100):
        # Gera uma data aleatória nos últimos 30 dias
        data_aleatoria = datetime.now() - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        status = random.choice(["CONCLUIDO", "CONCLUIDO", "CONCLUIDO", "PREPARANDO", "PENDENTE"])
        
        novo_pedido = Pedido(
            id_pedido=f"PED-{1000 + i}",
            status=status,
            valor_total=0, # Será calculado abaixo
            taxa_entrega=random.choice([5.0, 7.0, 10.0]),
            forma_pagamento=random.choice(pagamentos),
            bairro_destino=random.choice(bairros),
            data_hora=data_aleatoria
        )
        
        db.add(novo_pedido)
        db.flush() # Para gerar o ID do pedido antes de adicionar itens

        # Adiciona 1 a 3 itens por pedido
        subtotal = 0
        for _ in range(random.randint(1, 3)):
            prod = random.choice(produtos)
            qtd = random.randint(1, 2)
            item = ItemPedido(
                id_pedido=novo_pedido.id_pedido,
                nome_produto=prod["nome"],
                quantidade=qtd,
                preco_unitario=prod["preco"]
            )
            subtotal += prod["preco"] * qtd
            db.add(item)
        
        novo_pedido.valor_total = subtotal + novo_pedido.taxa_entrega

    # Injetar 5 avaliações críticas para testar a IA
    comentarios = [
        "A comida chegou muito fria e o motoboy se perdeu no bairro.",
        "Pedi sem cebola e veio com muita cebola! Melhorem a atenção.",
        "O hambúrguer estava ótimo, mas demorou 1 hora e meia.",
        "Esqueceram a minha bebida, tive que ligar lá duas vezes.",
        "A batata estava murcha e sem sal. Decepcionado."
    ]
    
    for texto in comentarios:
        av = Avaliacao(
            cliente=f"Cliente {random.randint(1, 50)}",
            nota=random.randint(1, 2),
            texto=texto,
            sentimento="negativo",
            data=datetime.now()
        )
        db.add(av)

    db.commit()
    db.close()
    print("✅ Banco de dados populado com sucesso! Agora o Dashboard vai brilhar.")

if __name__ == "__main__":
    popular()