import { test, expect } from '@playwright/test';

test.describe('Módulo de Feedbacks e IA', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Injeta o token ANTES de qualquer navegação para bypassar o Login
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'fake-jwt-token');
      window.localStorage.setItem('user_name', 'Allan Gabriel');
    });

    // 2. Mock da API de Lojas
    await page.route('**/api/lojas*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nome: "Loja Teste" }]),
      });
    });

    // 3. Mock da API de Avaliações (O que aparece no banco)
    await page.route('**/api/avaliacoes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            cliente: "João Silva",
            sentimento: "negativo",
            data: new Date().toISOString(),
            nota: 2,
            texto: "A comida chegou fria e demorou muito."
          }
        ]),
      });
    });

    // 4. Mock da API de IA (Simulando a resposta do Gemini)
    // O asterisco garante que pega a rota mesmo se tiver ?lojaId=1 no final
    await page.route('**/api/feedbacks/analise*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            tipo: "TrendingDown",
            titulo: "Problema de Temperatura",
            reclamacao: "Vários clientes reclamando de comida fria.",
            dica: "Verificar bags de isolamento térmico."
          }
        ]),
      });
    });
  });

  test('Deve carregar feedbacks e exibir análise da IA com sucesso', async ({ page }) => {
    // Aumentamos a resiliência da navegação para esperar a rede acalmar
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Verifica se fomos chutados para a tela de login por acidente
    if (page.url().includes('/login')) {
       console.log("⚠️ Redirecionado para login, tentando forçar entrada...");
       await page.evaluate(() => localStorage.setItem('token', 'fake-jwt-token'));
       await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    }

    // ✅ SELETOR INFALÍVEL: Pega o 3º botão dentro do menu de navegação lateral (Dashboard, Operação, Feedbacks)
    const feedbackMenu = page.locator('nav button').nth(2);
    await expect(feedbackMenu).toBeVisible({ timeout: 10000 });
    await feedbackMenu.click();

    // Verificação dos dados do Mock (Banco de Dados)
    await expect(page.locator('text=João Silva')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=A comida chegou fria')).toBeVisible();

    // Verificação da IA (Procurando APENAS pelos dados do Mock)
    // Nós injetamos "Problema de Temperatura" no mock, então sabemos que ELE TEM QUE EXISTIR.
    const tituloInsight = page.locator('text=Problema de Temperatura');
    await expect(tituloInsight).toBeVisible({ timeout: 15000 });
    
    const dicaInsight = page.locator('text=Verificar bags de isolamento');
    await expect(dicaInsight).toBeVisible();
  });
});