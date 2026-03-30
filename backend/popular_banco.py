import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.pedido import Pedido, ItemPedido, Avaliacao, Loja, Base

def popular_consolidado():
    db = SessionLocal()
    
    print("🧹 Limpando dados para uma demonstração impecável...")
    # Reset completo para garantir que os IDs e relacionamentos fiquem limpos
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 1. CRIAR AS LOJAS (O diferencial que o iFood quer ver)
    lojas = [
        Loja(nome="Burger Matriz - Jardins", cnpj="12.345.678/0001-01", cidade="São Paulo"),
        Loja(nome="Burger Express - Pinheiros", cnpj="12.345.678/0002-02", cidade="São Paulo"),
        Loja(nome="Burger Pocket - Itaim", cnpj="12.345.678/0003-03", cidade="São Paulo")
    ]
    db.add_all(lojas)
    db.commit()
    for l in lojas: db.refresh(l)

    bairros = ["Pinheiros", "Moema", "Itaim Bibi", "Vila Mariana", "Perdizes", "Bela Vista", "Santana"]
    pagamentos = ["PIX", "CARTÃO DE CRÉDITO", "CARTÃO DE DÉBITO", "DINHEIRO"]
    produtos = [
        {"nome": "Hambúrguer Artesanal", "preco": 35.0, "custo": 12.0},
        {"nome": "Batata Frita Grande", "preco": 18.0, "custo": 5.0},
        {"nome": "Refrigerante Lata", "preco": 7.0, "custo": 2.5},
        {"nome": "Combo Casal", "preco": 85.0, "custo": 32.0}
    ]

    print(f"📊 Gerando histórico de 30 dias para {len(lojas)} unidades...")
    
    # Gerar pedidos para cada loja
    for loja in lojas:
        for i in range(150): # Mais pedidos para os gráficos ficarem bonitos
            # Gera data aleatória com foco em horários de pico (almoço e jantar)
            dias_atras = random.randint(0, 30)
            hora = random.choice([11, 12, 13, 18, 19, 20, 21, 22])
            data_pedido = datetime.now() - timedelta(days=dias_atras)
            data_pedido = data_pedido.replace(hour=hora, minute=random.randint(0, 59))
            
            # Taxa de cancelamento de 8% para auditoria
            status = random.choices(["CONCLUIDO", "CANCELADO"], weights=[92, 8])[0]
            
            novo_pedido = Pedido(
                id_pedido=f"IFD-{loja.id}-{1000 + i}",
                loja_id=loja.id,
                status=status,
                valor_total=0,
                taxa_entrega=random.choice([5.0, 7.0, 10.0]),
                forma_pagamento=random.choice(pagamentos),
                bairro_destino=random.choice(bairros),
                data_hora=data_pedido
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
                    custo_producao=prod["custo"] # ✅ Essencial para o cálculo de lucro real
                )
                subtotal += (prod["preco"] * qtd)
                db.add(item)
            
            novo_pedido.valor_total = subtotal + novo_pedido.taxa_entrega

        # 2. INJETAR AVALIAÇÕES CRÍTICAS (Para brilhar na Auditoria IA)
        comentarios = [
            "A comida chegou muito fria e o motoboy se perdeu no bairro.",
            "Pedi sem cebola e veio com muita cebola! Melhorem a atenção.",
            "O hambúrguer estava ótimo, mas demorou 1 hora e meia.",
            "Esqueceram a minha bebida, tive que ligar lá duas vezes.",
            "A batata estava murcha e sem sal. Decepcionado."
        ]
        
        for texto in comentarios:
            db.add(Avaliacao(
                loja_id=loja.id,
                cliente=f"Cliente {random.randint(1, 100)}",
                nota=random.randint(1, 2),
                texto=texto,
                sentimento="negativo",
                data=datetime.now() - timedelta(days=random.randint(0, 5))
            ))

    db.commit()
    db.close()
    print("✅ Missão cumprida! O banco está pronto para a negociação.")

if __name__ == "__main__":
    popular_consolidado()