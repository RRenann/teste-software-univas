import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Users from '../../src/components/Users'
import { api } from '../../src/services/api'

// RF04 (docs/especificacao.md): ao clicar em "Adicionar Usuário", é exibido um formulário
// com os campos Nome e Email e o botão Criar.
describe('Users — abrir formulário de cadastro (RF04)', () => {
  beforeEach(() => {
    // Mock: GET /users responde com lista vazia
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: [] } })
  })

  // Sem globals no Vitest, o Testing Library não desmonta o componente sozinho
  afterEach(() => {
    cleanup()
  })

  // Abre o formulário como o usuário faria
  async function abrirFormulario() {
    const user = userEvent.setup()
    render(<Users />)
    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
  }

  it('exibe o campo Nome ao clicar em "Adicionar Usuário"', async () => {
    // Arrange + Act
    await abrirFormulario()

    // Assert
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
  })

  it('exibe o campo Email ao clicar em "Adicionar Usuário"', async () => {
    // Arrange + Act
    await abrirFormulario()

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('exibe o botão "Criar" ao clicar em "Adicionar Usuário"', async () => {
    // Arrange + Act
    await abrirFormulario()

    // Assert
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })
})
