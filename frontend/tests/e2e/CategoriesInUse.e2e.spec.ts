import { test, expect, unico, emailUnico } from './support/fixtures'

// Jornada J06 (docs/especificacao.md): categoria em uso (RN02 e API03).
test.describe('J06 — Categoria em uso', () => {
  test('exibe erro ao excluir categoria com tarefa e a mantém após recarregar', async ({
    page,
    dados
  }) => {
    // Preparação
    const nome = unico('Categoria J06')
    const usuario = await dados.criarUsuario({
      name: unico('Usuario J06'),
      email: emailUnico('j06')
    })
    const categoria = await dados.criarCategoria({ name: nome })
    await dados.criarTarefa({
      title: unico('Tarefa J06'),
      userId: usuario.id,
      categoryId: categoria.id
    })
    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nome })

    // Jornada
    page.once('dialog', (d) => d.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()

    // A especificação exige "uma mensagem de erro", sem definir o texto
    await expect(page.getByText(/erro/i)).toBeVisible()
    await expect(linha).toBeVisible()

    // Persistência
    await page.reload()
    await expect(linha).toBeVisible()
  })
})
