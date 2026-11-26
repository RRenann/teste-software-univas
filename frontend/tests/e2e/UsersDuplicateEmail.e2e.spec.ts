import { test, expect, unico, emailUnico } from './support/fixtures'

// Jornada J07 (docs/especificacao.md): email já cadastrado (RF09 e API01).
test.describe('J07 — Email já cadastrado', () => {
  test('exibe "Email já cadastrado" e não duplica o usuário após recarregar', async ({
    page,
    dados
  }) => {
    // Defeito registrado (RF09): a tela mostra "Erro ao salvar usuário"
    // no lugar de "Email já cadastrado"
    test.fail()

    // Preparação: já existe um usuário com esse email
    const email = emailUnico('j07')
    await dados.criarUsuario({ name: unico('Usuario J07'), email })

    // Jornada: tenta cadastrar outro usuário com o mesmo email
    await page.goto('/users')
    await page.getByRole('button', { name: 'Adicionar Usuário' }).click()
    await page.getByLabel('Nome:').fill(unico('Outro J07'))
    await page.getByLabel('Email:').fill(email)
    await page.getByRole('button', { name: 'Criar' }).click()

    // Resultado visível: a mensagem da especificação (RF09)
    await expect(page.getByText('Email já cadastrado')).toBeVisible()

    // Persistência: continua existindo só uma linha com esse email
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Usuários', level: 2 })).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(1)
  })
})
