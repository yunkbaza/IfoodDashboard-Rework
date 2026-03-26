import os
import requests
import json
from dotenv import load_dotenv

# 1. Carrega as variáveis do ficheiro .env
load_dotenv()

# 2. Busca a chave
API_KEY = os.getenv("GEMINI_API_KEY")

print("--- 🔍 DETETIVE DE CHAVE ---")
if not API_KEY:
    print("❌ ERRO: O Python não encontrou a GEMINI_API_KEY no .env!")
    print("Verifique se o arquivo se chama exatamente '.env' e está nesta pasta.")
    exit()

# Mostra só o início para conferirmos se não é a chave "leaked" (aquela era AIzaSyBg...)
print(f"✅ Chave carregada do .env: {API_KEY[:10]}...")

# 3. Configura a chamada para o Gemini 2.0 Flash
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
payload = {
    "contents": [{"parts": [{"text": "Oi, Gemini! Se você estiver lendo isso com uma chave válida, responda: 'Conexão de elite estabelecida!'"}]}]
}

print("\n🚀 Enviando teste para a Google...")

try:
    resposta = requests.post(url, json=payload, timeout=10)
    
    print(f"Status Code: {resposta.status_code}")
    
    if resposta.status_code == 200:
        dados = resposta.json()
        texto = dados['candidates'][0]['content']['parts'][0]['text']
        print(f"\n💎 RESPOSTA DA IA: {texto}")
        print("\n🎉 TUDO CERTO! Pode rodar o seu main.py agora.")
    elif resposta.status_code == 403:
        print("\n❌ ERRO 403: A Google ainda diz que esta chave está vazada (leaked) ou bloqueada.")
        print("Mensagem: ", resposta.text)
    else:
        print(f"\n❓ ERRO DESCONHECIDO ({resposta.status_code}):")
        print(resposta.text)

except Exception as e:
    print(f"\n💥 ERRO DE CONEXÃO: {e}")