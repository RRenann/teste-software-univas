import { test, expect, unico, emailUnico } from './support/fixtures'

// Jornada J04 (docs/especificacao.md): exclusão de usuário.
test.describe('J04 — Exclusão de usuário', () => {
  test('exclui o usuário ao confirmar e ele não volta após recarregar', async ({ page, dados }) => {
    // Preparação
    const email = emailUnico('j04')
    await dados.criarUsuario({ name: unico('Usuario J04'), email })
    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })
    await expect(linha).toBeVisible()

    // Jornada: Excluir e confirmar
    page.once('dialog', (d) => d.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()

    // O título só aparece com a lista carregada: evita aprovar durante o carregamento
    await expect(linha).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Usuários', level: 2 })).toBeVisible()
    await expect(linha).toHaveCount(0)

    // Persistência
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Usuários', level: 2 })).toBeVisible()
    await expect(linha).toHaveCount(0)
  })

  test('mantém o usuário na lista ao cancelar a confirmação, inclusive após recarregar', async ({
    page,
    dados
  }) => {
    // Preparação
    const email = emailUnico('j04')
    await dados.criarUsuario({ name: unico('Usuario J04'), email })
    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })

    // Jornada: Excluir e cancelar. O tipo registrado comprova que houve confirmação.
    let tipoDialogo = ''
    page.once('dialog', async (d) => {
      tipoDialogo = d.type()
      await d.dismiss()
    })
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect.poll(() => tipoDialogo).toBe('confirm')
    await expect(linha).toBeVisible()

    // Persistência
    await page.reload()
    await expect(linha).toBeVisible()
  })
})
