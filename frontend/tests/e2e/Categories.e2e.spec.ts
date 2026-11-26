import { test, expect, unico } from './support/fixtures'

// Jornada J05 (docs/especificacao.md): cadastro, edição e exclusão de categoria
// (mesmas regras de J02, J03 e J04, com os campos Nome e Descrição).
test.describe('J05 — Cadastro, edição e exclusão de categoria', () => {
  test('cria uma categoria pela tela e ela continua na lista após recarregar', async ({
    page,
    dados
  }) => {
    // Defeito registrado (RNF01): os campos não estão associados aos rótulos
    test.fail()

    const nome = unico('Categoria J05')
    const descricao = unico('Descricao J05')

    // Jornada
    await page.goto('/categories')
    await page.getByRole('button', { name: 'Adicionar Categoria' }).click()
    // RNF01: campo localizável pelo rótulo (asserção explícita: test.fail() não cobre timeout)
    await expect(page.getByLabel('Nome:')).toBeVisible()
    await page.getByLabel('Nome:').fill(nome)
    await page.getByLabel('Descrição:').fill(descricao)
    await page.getByRole('button', { name: 'Criar' }).click()

    // O formulário fecha depois da gravação: só então a categoria pode ser registrada
    await expect(page.getByRole('button', { name: 'Criar' })).toBeHidden()
    await dados.registrarCategoriaPorNome(nome)
    const linha = page.getByRole('row').filter({ hasText: nome })
    await expect(linha).toContainText(descricao)

    // Persistência
    await page.reload()
    await expect(linha).toContainText(descricao)
  })

  test('exibe o novo nome da categoria, e não o anterior, inclusive após recarregar', async ({
    page,
    dados
  }) => {
    // Defeito registrado (RNF01): os campos não estão associados aos rótulos
    test.fail()

    // Preparação
    const nomeAnterior = unico('Categoria anterior')
    const nomeNovo = unico('Categoria nova')
    const descricao = unico('Descricao J05')
    await dados.criarCategoria({ name: nomeAnterior, description: descricao })
    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: descricao })
    await expect(linha).toContainText(nomeAnterior)

    // Jornada
    await linha.getByRole('button', { name: 'Editar' }).click()
    // RNF01: campo localizável pelo rótulo (asserção explícita: test.fail() não cobre timeout)
    await expect(page.getByLabel('Nome:')).toBeVisible()
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

  test('exclui a categoria ao confirmar e ela não volta após recarregar', async ({
    page,
    dados
  }) => {
    // Preparação
    const nome = unico('Categoria J05')
    await dados.criarCategoria({ name: nome })
    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nome })
    await expect(linha).toBeVisible()

    // Jornada: Excluir e confirmar
    page.once('dialog', (d) => d.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()

    // O título só aparece com a lista carregada: evita aprovar durante o carregamento
    await expect(linha).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Categorias', level: 2 })).toBeVisible()
    await expect(linha).toHaveCount(0)

    // Persistência
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Categorias', level: 2 })).toBeVisible()
    await expect(linha).toHaveCount(0)
  })

  test('mantém a categoria na lista ao cancelar a confirmação, inclusive após recarregar', async ({
    page,
    dados
  }) => {
    // Preparação
    const nome = unico('Categoria J05')
    await dados.criarCategoria({ name: nome })
    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nome })

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
