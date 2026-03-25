import requests

API_KEY = "AIzaSyDY-4Vs6VhCUy1NsAhTn62TRS8UPAY5y9k"
# Vamos testar a versão v1beta que é a que você estava usando
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("\n✅ CONEXÃO ESTABELECIDA! Seus modelos disponíveis são:\n")
        for m in models:
            print(f"- {m['name']} (Suporta: {m['supportedGenerationMethods']})")
    else:
        print(f"\n❌ ERRO {response.status_code}: {response.text}")
except Exception as e:
    print(f"Erro fatal: {e}")