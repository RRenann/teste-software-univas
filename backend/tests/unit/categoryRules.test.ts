import { describe, it, expect } from 'vitest'
import { canDeleteCategory } from '../../src/utils/categoryRules'

// RN02 — Exclusão de categoria (docs/especificacao.md):
// uma categoria só pode ser excluída quando não possui nenhuma tarefa associada
// (tasksCount === 0); com uma ou mais tarefas, a exclusão é proibida.
describe('canDeleteCategory', () => {
  it.each([
    { tasksCount: 0, esperado: true, tecnica: 'valor-limite', descricao: 'permite excluir categoria sem tarefas' },
    { tasksCount: 1, esperado: false, tecnica: 'valor-limite', descricao: 'impede excluir categoria com exatamente uma tarefa' },
    { tasksCount: 10, esperado: false, tecnica: 'partição', descricao: 'impede excluir categoria com várias tarefas' },
  ])('$descricao (tasksCount = $tasksCount, $tecnica)', ({ tasksCount, esperado }) => {
    // Arrange: tasksCount vem da tabela de casos

    // Act
    const resultado = canDeleteCategory(tasksCount)

    // Assert
    expect(resultado).toBe(esperado)
  })
})
