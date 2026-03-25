import os
import requests
import json
from dotenv import load_dotenv

# Carrega as variáveis do ficheiro .env
load_dotenv()

# Tenta buscar a chave do ficheiro .env
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ ERRO: O Python não encontrou a chave GEMINI_API_KEY no ficheiro .env!")
    print("Certifique-se de que o ficheiro se chama exatamente '.env' e está na pasta backend.")
    exit()

print(f"✅ Chave encontrada! Testando a chave: {API_KEY[:10]}... (escondida por segurança)")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
payload = {"contents": [{"parts": [{"text": "Olá, IA. Estás aí?"}]}]}

resposta = requests.post(url, json=payload)

print(f"\nStatus da Google: {resposta.status_code}")
print("Mensagem Exata da Google:")
print(json.dumps(resposta.json(), indent=2, ensure_ascii=False))