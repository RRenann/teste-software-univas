import { test, expect, unico, emailUnico } from './support/fixtures'

// Jornada J03 (docs/especificacao.md): edição de usuário.
test.describe('J03 — Edição de usuário', () => {
  test('exibe o novo nome, e não o anterior, inclusive após recarregar', async ({ page, dados }) => {
    // Preparação
    const email = emailUnico('j03')
    const nomeAnterior = unico('Nome anterior')
    const nomeNovo = unico('Nome novo')
    await dados.criarUsuario({ name: nomeAnterior, email })
    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })
    await expect(linha).toContainText(nomeAnterior)

    // Jornada
    await linha.getByRole('button', { name: 'Editar' }).click()
    await page.getByLabel('Nome:').fill(nomeNovo)
    await page.getByRole('button', { name: 'Atualizar' }).click()

    // Resultado visível
    await expect(linha).toContainText(nomeNovo)
    await expect(page.getByText(nomeAnterior)).toHaveCount(0)

    // Persistência
    await page.reload()
    await expect(linha).toContainText(nomeNovo)
    await expect(page.getByText(nomeAnterior)).toHaveCount(0)
  })
})
