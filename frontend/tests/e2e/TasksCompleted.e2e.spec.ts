import { test, expect, unico, emailUnico } from './support/fixtures'

// Jornada J08 (docs/especificacao.md): tarefa concluída (RN01 e API05).
test.describe('J08 — Tarefa concluída', () => {
  test('recusa a mudança de Concluída para Pendente e mantém COMPLETED após recarregar', async ({
    page,
    dados
  }) => {
    // Defeito registrado (RNF01): os campos da tela de Tarefas não estão
    // associados aos rótulos
    test.fail()

    // Preparação: tarefa já concluída
    const titulo = unico('Tarefa J08')
    const usuario = await dados.criarUsuario({
      name: unico('Usuario J08'),
      email: emailUnico('j08')
    })
    const categoria = await dados.criarCategoria({ name: unico('Categoria J08') })
    await dados.criarTarefa({
      title: titulo,
      userId: usuario.id,
      categoryId: categoria.id,
      status: 'COMPLETED'
    })
    await page.goto('/tasks')
    const linha = page.getByRole('row').filter({ hasText: titulo })
    await expect(linha).toContainText('COMPLETED')

    // Jornada: Editar, trocar o status para Pendente e Atualizar
    await linha.getByRole('button', { name: 'Editar' }).click()
    // RNF01: o campo tem que ser achado pelo rótulo. Sem esta verificação o
    // selectOption espera até estourar o tempo, e o test.fail() não cobre isso.
    await expect(page.getByLabel('Status:')).toBeVisible()
    await page.getByLabel('Status:').selectOption({ label: 'Pendente' })
    await page.getByRole('button', { name: 'Atualizar' }).click()

    // Resultado: a alteração é recusada. A especificação não define mensagem,
    // então só confiro que a lista não passou a mostrar PENDING.
    await expect(linha).toContainText('COMPLETED')
    await expect(linha).not.toContainText('PENDING')

    // Persistência: o status gravado continua COMPLETED
    await page.reload()
    await expect(linha).toContainText('COMPLETED')
  })
})
