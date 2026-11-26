# Relatório — Testes E2E com IA generativa

**Aluno:** Renan Carlos
**Ferramenta de IA:** Claude Code
**Jornadas:** obrigatórias J03, J04, J05 e J06; complementares J07 e J08
**Arquivos de teste** (pasta `frontend/tests/e2e/`):

| Jornada | Arquivo |
|---------|---------|
| J03 | `UsersEdit.e2e.spec.ts` |
| J04 | `UsersDelete.e2e.spec.ts` |
| J05 | `Categories.e2e.spec.ts` |
| J06 | `CategoriesInUse.e2e.spec.ts` |
| J07 | `UsersDuplicateEmail.e2e.spec.ts` |
| J08 | `TasksCompleted.e2e.spec.ts` |

## 1. Tabela de casos

Montei a tabela a partir do `docs/especificacao.md` antes de gerar os testes. Para a J04 passei
os dois casos já prontos no prompt (seção 2). Nas outras jornadas segui a mesma ideia: um caso
para o caminho principal e, quando a jornada tem uma alternativa (cancelar a confirmação, por
exemplo), um caso para ela.

| # | Jornada | Preparação | Passos do usuário | Após recarregar |
|---|---------|------------|-------------------|-----------------|
| 1 | J03 | usuário criado pela API (`dados`) | clicar em Editar, trocar o Nome, clicar em Atualizar | aparece o nome novo e o antigo some |
| 2 | J04 | usuário criado pela API (`dados`) | clicar em Excluir e confirmar | o usuário não aparece |
| 3 | J04 (alternativa) | usuário criado pela API (`dados`) | clicar em Excluir e cancelar | o usuário continua na lista |
| 4 | J05 | nenhuma | clicar em Adicionar Categoria, preencher Nome e Descrição, clicar em Criar | a categoria aparece com a descrição |
| 5 | J05 | categoria criada pela API (`dados`) | clicar em Editar, trocar o Nome, clicar em Atualizar | aparece o nome novo e o antigo some |
| 6 | J05 | categoria criada pela API (`dados`) | clicar em Excluir e confirmar | a categoria não aparece |
| 7 | J05 (alternativa) | categoria criada pela API (`dados`) | clicar em Excluir e cancelar | a categoria continua na lista |
| 8 | J06 | usuário, categoria e uma tarefa nessa categoria, pela API (`dados`) | clicar em Excluir e confirmar; aparece uma mensagem de erro | a categoria continua na lista |
| 9 | J07 | usuário criado pela API (`dados`) | clicar em Adicionar Usuário, preencher Nome e o **mesmo** Email, clicar em Criar; aparece "Email já cadastrado" | só existe uma linha com aquele email |
| 10 | J08 | usuário, categoria e tarefa com status `COMPLETED`, pela API (`dados`) | clicar em Editar, escolher Status "Pendente", clicar em Atualizar | a tarefa continua com `COMPLETED` |

Casos que pensei e deixei de fora:

- **Cancelar a edição (J03 e J05):** a especificação não diz o que deve acontecer, então eu não
  teria um resultado esperado para comparar.
- **Cancelar a exclusão na J06:** é a mesma tela e o mesmo diálogo do caso 7, então não
  acrescentaria nada.
- **J07, formulário continua aberto com os dados digitados:** isso está no RF09, mas a J07 só
  fala da mensagem. Fiquei só com o que a jornada pede.
- **J08, outras transições proibidas (ex.: `COMPLETED` → `IN_PROGRESS`):** já são cobertas pelos
  testes unitários da RN01. No E2E fiquei com o exemplo que a jornada cita.

## 2. Prompt usado

Usei este prompt para a J04 (os casos são os da tabela acima, linhas 2 e 3):

```
Contexto: jornada J04 de docs/especificacao.md, tela
/users. A aplicação está em execução (docker compose).
Tarefa: escreva o teste E2E em
frontend/tests/e2e/UsersDelete.e2e.spec.ts.
Casos obrigatórios (definidos por mim):
| # | Preparação | Passos | Após recarregar |
| 1 | usuário via dados | Excluir e confirmar | não aparece |
| 2 | usuário via dados | Excluir e cancelar | aparece |
Restrições: siga o AGENTS.md (seção Testes E2E). Use a
fixture dados, getByRole/getByLabel e page.once('dialog').
Sem waitForTimeout. Não altere src/ nem a configuração.
Saída: execute npm run test:e2e e relacione cada teste
a uma linha da tabela.
```

Para as outras jornadas usei o mesmo modelo, trocando a jornada, o arquivo e a tabela de casos.

## 3. Problemas nos testes gerados e o que ajustei

| Problema | O que fiz |
|----------|-----------|
| Nos casos 4, 5 e 10, o teste travava no `fill`/`selectOption` esperando o campo até dar o tempo limite (30 s). O `test.fail()` não aceita tempo esgotado como "falha esperada", e a suíte ficava vermelha. | Coloquei antes `await expect(page.getByLabel(...)).toBeVisible()` (é exatamente o que a RNF01 exige). Assim o teste falha rápido, no ponto certo. Não tirei nenhuma verificação. |
| Possível falso positivo: enquanto a tela mostra "Carregando...", a linha também não aparece, e o teste de exclusão podia passar sem ter excluído nada. | Antes de conferir que a linha sumiu, o teste espera o título da tela, que só aparece com a lista carregada. Fiz o mesmo no caso 9, antes de contar as linhas. |
| Possível falso positivo: se ninguém trata o diálogo, o Playwright cancela sozinho. O teste de cancelar podia passar mesmo sem a tela ter pedido confirmação. | Nos casos de cancelar, o teste confere que apareceu mesmo um diálogo do tipo `confirm`. |
| No caso 10, a primeira versão conferia uma mensagem com a palavra "erro" depois de Atualizar. | A J08 não fala de mensagem, só que a alteração é recusada. Tirei essa verificação e deixei só o que a especificação diz: a linha não passa a mostrar `PENDING` e, depois de recarregar, continua `COMPLETED`. |
| No teste J02 do professor, o registro para limpeza é feito logo depois do clique, antes de a gravação terminar. | No caso 4 o registro só acontece depois que o formulário fecha. Não mexi no arquivo do professor. |

Também conferi os sinais de alerta: não tem `waitForTimeout`, `force`, seletor CSS/XPath,
`data-testid`, `.skip` nem `.only`, e não alterei `src/` nem o `playwright.config.ts`.

## 4. Resultados

- Testes criados por mim: **10**. Passaram: **6** (casos 1, 2, 3, 6, 7 e 8).
- Falharam por defeito da aplicação e ficaram marcados com `test.fail()`: **4** (casos 4, 5, 9 e 10).
  Os testes não foram mudados para passar. Ver seção 5.
- Suíte E2E inteira (meus 10 + os 4 de exemplo do professor): **14 de 14** com o resultado
  esperado. O Playwright mostra "14 passed" porque conta as falhas esperadas como certas.
- Com `--repeat-each=5`: **70 de 70** com o resultado esperado. Nenhum teste ficou instável.

Observação sobre o ambiente: na minha máquina a porta 3000 estava ocupada por outro projeto.
Por isso subi o frontend deste projeto com `npx vite --port 3100` (backend e banco no Docker,
como sempre) e rodei os testes com `E2E_BASE_URL=http://localhost:3100`. Não mudei nenhuma
configuração.

### Sabotagens do frontend

| # | Sabotagem | Qual teste pegou |
|---|-----------|------------------|
| S1 | Usuários: não envia o PUT | caso 1 |
| S2 | Usuários: troca o nome só na tela | caso 1 (depois de recarregar) |
| S3 | Usuários: não envia o DELETE | caso 2 |
| S4 | Usuários: tira a linha só da tela | caso 2 (depois de recarregar) |
| S5 | Usuários: exclui mesmo quando a pessoa cancela | caso 3 |
| S6 | Categorias: tira a linha só da tela | caso 6 (depois de recarregar) e caso 8 |
| S7 | Categorias: exclui mesmo quando a pessoa cancela | caso 7 |
| S8 | Categorias: não mostra o erro ao excluir | caso 8 |
| S9 | Categorias: tira a linha mesmo com erro | caso 8 |
| S10 | Categorias: não envia o POST* | caso 4 |
| S11 | Categorias: não envia o PUT* | caso 5 |

Resultado: os testes pegaram as **11 de 11** sabotagens.

\* Nessa cópia também corrigi os rótulos. Sem isso, os casos 4 e 5 param antes, no defeito dos
rótulos. Nas S10 e S11 o `test.fail()` continua no arquivo: o teste afetado falha e o outro
passa. Para comparar, só com os rótulos corrigidos, os casos 4 e 5 fazem a jornada inteira e
passam.

## 5. Defeitos encontrados

| Regra | O que a especificação diz | O que acontece | Teste que mostra |
|-------|---------------------------|----------------|------------------|
| RNF01 (J05) | Todo campo de formulário pode ser achado pelo texto do rótulo. | Em `Categories.tsx`, os rótulos "Nome:" e "Descrição:" não estão ligados aos campos (falta `htmlFor`/`id`). | casos 4 e 5 |
| RF09 / API01 (J07) | Ao cadastrar um email que já existe, aparece "Email já cadastrado". | A tela mostra "Erro ao salvar usuário". O `catch` de `Users.tsx` usa a mesma mensagem para qualquer erro e não trata o `409`. | caso 9 |
| RNF01 (J08) | Todo campo de formulário pode ser achado pelo texto do rótulo, em todas as telas. | Em `Tasks.tsx`, nenhum rótulo está ligado ao seu campo (Título, Descrição, Status, Prioridade, Usuário e Categoria). | caso 10 |

**Limitações:**

- Enquanto os rótulos de Categorias e Tarefas não forem corrigidos, os casos 4, 5 e 10 não
  conseguem achar outros problemas nessas telas. Na J08, por exemplo, ainda não dá para saber se
  a recusa da mudança de status funciona pela interface. Quando corrigirem, o Playwright vai
  avisar "Expected to fail, but passed", e aí é só tirar o `test.fail()`.
- No caso 9, a parte "após recarregar" (não duplicar o usuário) nunca chega a rodar, porque o
  teste para antes, na mensagem.
- A J06 não diz qual é o texto do erro, então o teste aceita qualquer mensagem com a palavra
  "erro".
- O teste J02 do professor pode deixar usuários `j02...@teste.com` sobrando no banco, porque o
  registro para limpeza acontece ao mesmo tempo que a gravação.

## 6. Revisão do aluno

- Li a tabela de casos de todas as jornadas e conferi cada linha com a especificação.
- Li os 6 arquivos de teste e conferi se cada um segue a jornada pela interface, como o usuário
  faria, e se confere a persistência depois de recarregar.
- Conferi se cada `test.fail()` corresponde a um defeito real, olhando o print e o
  `error-context.md` da falha (nos casos 9 e 10 aparece "Erro ao salvar usuário" e o rótulo
  "Status:" solto, sem campo ligado).
- Observações: ...
