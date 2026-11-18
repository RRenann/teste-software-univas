# Relatório — Testes unitários com IA generativa

**Aluno(s):** Renan Carlos
**Ferramenta de IA utilizada:** Claude Code
**Unidade testada:** `backend/src/utils/categoryRules.ts` — RN02 (`canDeleteCategory(tasksCount)`)
**Arquivo de teste:** `backend/tests/unit/categoryRules.test.ts`

## 1. Tabela de casos (elaborada antes de usar a IA)

Regra (docs/especificacao.md, RN02): uma categoria só pode ser excluída quando não possui
nenhuma tarefa associada (`tasksCount === 0`); com uma ou mais tarefas, a exclusão é proibida.

| # | Entrada | Resultado esperado | Técnica (partição, valor-limite, inválido) | Regra |
|---|---------|--------------------|--------------------------------------------|-------|
| 1 | `tasksCount = 0`  | `true` (pode excluir)     | valor-limite (limite inferior da partição "sem tarefas") | RN02 
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

---

# Atividade prática — Frontend (componente `Users`)

**Unidade testada:** `frontend/src/components/Users.tsx` — RF04
**Arquivo de teste:** `frontend/tests/unit/Users.form.test.tsx`
**Escopo:** dos requisitos RF01, RF02, RF04, RF05, RF06 e RF07, foi escolhido apenas o **RF04**.
A etapa 4 (sabotagens) não foi realizada, por orientação da atividade.

Requisito (docs/especificacao.md, RF04): ao clicar em "Adicionar Usuário", é exibido um formulário
com os campos **Nome** e **Email** e o botão **Criar**.

## 1. Tabela de casos (elaborada antes de usar a IA)

| # | Preparação (mock) | Ação do usuário | Resultado esperado | Req. |
|---|-------------------|-----------------|--------------------|------|
| 1 | `api.get` → lista vazia | clicar em "Adicionar Usuário" | campo **Nome** visível, localizável pelo rótulo | RF04 |
| 2 | `api.get` → lista vazia | clicar em "Adicionar Usuário" | campo **Email** visível, localizável pelo rótulo | RF04 |
| 3 | `api.get` → lista vazia | clicar em "Adicionar Usuário" | botão **Criar** visível | RF04 |

## 2. Prompt utilizado

```
Contexto: componente frontend/src/components/Users.tsx,
requisitos RF04 e RF05 de docs/especificacao.md.
Tarefa: escreva testes em
frontend/tests/unit/Users.form.test.tsx.
Casos obrigatórios (definidos por mim):
| Req. | Mock | Ação | Esperado |
| RF04 | get -> lista vazia | clicar "Adicionar..." | Nome, Email, "Criar" |
| RF05 | get -> lista vazia | abrir, digitar, | formulário fechado |
| | | clicar "Cancelar" | |
Restrições: siga o AGENTS.md. Use getByRole ou
getByLabelText e userEvent. Não altere src/.
Se algum teste não puder passar sem alterar src/,
interrompa e explique o motivo.
Saída: execute npm test e relacione cada teste a
uma linha da tabela.
```

Observação: o prompt pedia RF04 e RF05. Depois, o escopo foi reduzido a um requisito (RF04),
e os testes de RF05 foram retirados do arquivo.

## 3. Revisão do teste gerado

| Problema encontrado no teste gerado | Ajuste solicitado ou realizado |
|-------------------------------------|--------------------------------|
| Na primeira execução, o teste do botão "Criar" falhava com "Found multiple elements with the role button": o componente de um teste continuava renderizado no teste seguinte (o Vitest do projeto não usa `globals`, então o Testing Library não faz `cleanup` automático). | Foi adicionado `afterEach(cleanup)` no arquivo de teste. Nenhum valor esperado foi alterado. |
| A IA acrescentou um teste que não estava na tabela ("limpa os campos ao cancelar", da RF05). | O teste foi removido junto com os demais de RF05 quando o escopo foi reduzido a RF04. |
| Sinal de alerta verificado: a IA poderia contornar a falha localizando os campos com `getAllByRole('textbox')[0]` ou `container.querySelector`. | Isso não foi feito. Os campos são localizados pelo rótulo (`getByLabelText`), como pede a RF07 e o AGENTS.md, e o teste falha, evidenciando o defeito. |
| Checklist: `src/` não foi alterado; não há `.skip`/`.only`/`.todo`; asserções específicas (`toBeInTheDocument`); HTTP isolado com `vi.spyOn(api, 'get')`; interação com `userEvent`; um comportamento por teste. | Conforme. |

## 4. Resultados

- Testes criados: 3 | aprovados: 1 | reprovados: 2
  - ✅ exibe o botão "Criar" ao clicar em "Adicionar Usuário" (caso 3)
  - ❌ exibe o campo Nome ao clicar em "Adicionar Usuário" (caso 1)
  - ❌ exibe o campo Email ao clicar em "Adicionar Usuário" (caso 2)
- Cobertura de linhas da unidade: não medida (o Vitest não gera o relatório de cobertura quando há testes falhando)
- Sabotagem manual (frontend): etapa 4 não realizada, por orientação da atividade.

## 5. Defeitos encontrados (divergências entre especificação e código)

| Regra | Comportamento especificado | Comportamento observado | Teste que evidencia |
|-------|----------------------------|-------------------------|---------------------|
| RF04 / RF07 | Ao abrir o formulário, os campos Nome e Email são exibidos e cada campo está associado ao seu rótulo, podendo ser localizado por `getByLabelText`. | Os `<label>` "Nome:" e "Email:" não estão associados aos `<input>` (sem `htmlFor`/`id` e sem o input dentro do label). O Testing Library acusa: *"Found a label with the text of: /nome/i, however no form control was found associated to that label."* | `exibe o campo Nome ao clicar em "Adicionar Usuário"` e `exibe o campo Email ao clicar em "Adicionar Usuário"` |

O defeito foi registrado e não foi corrigido: alterações em `src/` não fazem parte da entrega.
