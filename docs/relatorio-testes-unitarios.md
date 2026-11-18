# Relatório — Testes unitários com IA generativa

**Aluno(s):**
**Ferramenta de IA utilizada:** Claude Code
**Unidade testada:** `backend/src/utils/categoryRules.ts` — RN02 (`canDeleteCategory(tasksCount)`)
**Arquivo de teste:** `backend/tests/unit/categoryRules.test.ts`

## 1. Tabela de casos (elaborada antes de usar a IA)

Regra (docs/especificacao.md, RN02): uma categoria só pode ser excluída quando não possui
nenhuma tarefa associada (`tasksCount === 0`); com uma ou mais tarefas, a exclusão é proibida.

| # | Entrada | Resultado esperado | Técnica (partição, valor-limite, inválido) | Regra |
|---|---------|--------------------|--------------------------------------------|-------|
| 1 | `tasksCount = 0`  | `true` (pode excluir)     | valor-limite (limite inferior da partição "sem tarefas") | RN02 |
| 2 | `tasksCount = 1`  | `false` (não pode excluir) | valor-limite (primeiro valor da partição "com tarefas")  | RN02 |
| 3 | `tasksCount = 10` | `false` (não pode excluir) | partição (representante de "várias tarefas")            | RN02 |

## 2. Prompt utilizado

```
Contexto: função canDeleteCategory em
backend/src/utils/categoryRules.ts, regra RN02 de
docs/especificacao.md. Use a implementação apenas
para conhecer a assinatura da função.
Tarefa: escreva testes unitários em
backend/tests/unit/categoryRules.test.ts.
Casos obrigatórios (definidos por mim):
| tasksCount | esperado | técnica |
| 0 | true | valor-limite |
| 1 | false | valor-limite |
| 10 | false | partição |
Restrições: siga o AGENTS.md. Não altere src/.
Saída: execute npm test e liste cada teste com o
caso da tabela que ele verifica.
```

## 3. Revisão do teste gerado

| Problema encontrado no teste gerado | Ajuste solicitado ou realizado |
|-------------------------------------|--------------------------------|
| O exemplo original tinha três `it` separados repetindo a mesma estrutura, e só o primeiro seguia o padrão AAA. | Os três casos viraram um único `it.each` com tabela de casos (entrada, resultado esperado, técnica e descrição), como pede a convenção do projeto. |
| O comentário do arquivo não citava a regra da especificação. | O cabeçalho passou a citar a RN02 de `docs/especificacao.md` com o texto da regra. |
| Os nomes dos testes não mostravam a técnica usada. | O título de cada caso agora inclui o `tasksCount` e a técnica (`valor-limite` / `partição`). |

## 4. Resultados

- Testes criados: 3 | aprovados: 3 | reprovados: 0
- Cobertura de linhas da unidade: 100 % (`categoryRules.ts` tem 1 linha executável, coberta pelos testes)
- Score de mutação (backend): **100 %** (Stryker em `src/utils/categoryRules.ts`: 4 mutantes, 4 mortos, 0 sobreviventes, 0 sem cobertura)
  - O caso `tasksCount = 0` matou 3 mutantes e o caso `tasksCount = 1` matou 1.
  - O caso `tasksCount = 10` não matou nenhum mutante sozinho: os valores-limite (0 e 1) já bastam
    para detectar as mutações. Ele foi mantido como representante da partição "várias tarefas".

## 5. Defeitos encontrados (divergências entre especificação e código)

| Regra | Comportamento especificado | Comportamento observado | Teste que evidencia |
|-------|----------------------------|-------------------------|---------------------|
| RN02 | — | Nenhuma divergência: o código segue a especificação nos três casos. | — |

**Limitação:** a especificação não diz o que fazer com entradas inválidas (`tasksCount`
negativo ou não inteiro, como `-1` ou `1.5`). Por isso não há casos inválidos na tabela.
Se o professor definir esse comportamento, os casos devem ser adicionados.
