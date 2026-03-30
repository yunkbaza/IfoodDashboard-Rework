import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.pedido import Pedido, ItemPedido, Avaliacao, Loja, Base

def popular():
    db = SessionLocal()
    print("🧹 Resetando tabelas para demonstração limpa...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 1. Criar Unidades (Essencial para o Escopo Multi-loja)
    lojas = [
        Loja(nome="Burger Matriz - Jardins", cnpj="12.345.678/0001-01", cidade="São Paulo"),
        Loja(nome="Burger Express - Pinheiros", cnpj="12.345.678/0002-02", cidade="São Paulo")
    ]
    db.add_all(lojas)
    db.commit()
    for l in lojas: db.refresh(l)

    bairros = ["Pinheiros", "Moema", "Itaim Bibi", "Vila Mariana", "Perdizes", "Bela Vista"]
    pagamentos = ["PIX", "CARTÃO DE CRÉDITO", "DINHEIRO"]
    produtos = [
        {"nome": "Hambúrguer Artesanal", "preco": 35.0, "custo": 12.0},
        {"nome": "Batata Frita Grande", "preco": 18.0, "custo": 5.0},
        {"nome": "Refrigerante Lata", "preco": 7.0, "custo": 2.5}
    ]

    print(f"🍔 Gerando pedidos para {len(lojas)} unidades...")
    
    for loja in lojas:
        for i in range(50):
            data_aleatoria = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            # 10% de taxa de cancelamento (para o KPI do Dashboard brilhar)
            status = random.choices(["CONCLUIDO", "CANCELADO"], weights=[90, 10])[0]
            
            novo_pedido = Pedido(
                id_pedido=f"PED-{loja.id}-{1000 + i}",
                loja_id=loja.id, # ✅ Vínculo Multi-loja
                status=status,
                valor_total=0,
                taxa_entrega=7.0,
                forma_pagamento=random.choice(pagamentos),
                bairro_destino=random.choice(bairros),
                data_hora=data_aleatoria
            )
            db.add(novo_pedido)
            db.flush()

            subtotal = 0
            for _ in range(random.randint(1, 3)):
                prod = random.choice(produtos)
                qtd = random.randint(1, 2)
                item = ItemPedido(
                    id_pedido=novo_pedido.id_pedido,
                    nome_produto=prod["nome"],
                    quantidade=qtd,
                    preco_unitario=prod["preco"],
                    custo_producao=prod["custo"] # ✅ Importante para o gráfico de Lucro
                )
                subtotal += (prod["preco"] * qtd)
                db.add(item)
            
            novo_pedido.valor_total = subtotal + novo_pedido.taxa_entrega

        # Injetar críticas por loja para testar a Auditoria IA
        av = Avaliacao(
            loja_id=loja.id,
            cliente=f"Cliente {loja.nome}",
            nota=2,
            texto="O pedido demorou muito e chegou frio. Decepcionante.",
            sentimento="negativo",
            data=datetime.now()
        )
        db.add(av)

    db.commit()
    db.close()
    print("✅ Banco populado! O Dashboard agora possui visão consolidada e individual.")

if __name__ == "__main__":
    popular()