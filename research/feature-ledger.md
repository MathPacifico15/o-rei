# Matriz de comportamento e implementação

Esta matriz é a revisão para a implementação do repositório original. Substitui as decisões antigas sobre oito áreas e loop semanal; não invalida capturas históricas. Evidências da referência são material de pesquisa, nunca assets do produto.

**C** = comportamento observado em navegador. **D** = descrição pública, sem comprovar todos os efeitos na execução. **O** = regra original ou evolução do código fornecido. **U** = desconhecido.

| Recurso | Evidência REA | Confiança | O REI implementado | Diferenciação e pendências |
|---|---|---|---|---|
| Interface central | career4.json; capturas de 26/10 na conversa | C | Dados do atleta e painel de decisões; loja/histórico sobre a carreira | Visual do repositório mantido |
| Retomada | implementation-resume.json | C, limitada à continuação visível | Envelope v8 com estado do fluxo e recuperação | Esquema e validação próprios; não inferidos do armazenamento alheio |
| Cartas | career2.json; guia pública atual | C para início, D para todas as raridades | Três escolhas; uma por temporada; ganho visível | Catálogo, atributos e probabilidades próprios |
| Eventos | career4.json; guia pública atual | C para um evento; D para abrangência | 80 cotidianos e contextuais, 2–4/temporada, intervalo de 3 temporadas | Textos e balanceamento próprios; sem prometer catálogo idêntico |
| Loja | guia pública atual; loja executada em 26/10 na conversa, ev_6d35ecec198c5c3a3b84f191aa3cb4e5c883bf1d7e8025b17d3752bbb6701bd3 | C para apresentação; D para efeitos acumulados | Equipe, consumíveis, patrimônio, extrato e duração | Valores próprios; nenhum anúncio ou compra monetizada |
| Psicólogo | guia pública atual | D | Benefício de forma; removida conversão aleatória de derrota em vitória | Magnitude própria na escala de forma do O REI |
| Mercado | guia pública atual | D | Oferta, renovação, negociação, saída e transferência futura | +12%/35% são decisões O, não fórmulas descobertas |
| Imprensa | guia pública atual | D | Coletiva contextual e assessoria que mostra efeitos da próxima resposta | Conteúdo brasileiro original |
| Liga, acesso e permanência | guia pública; REA `ev_87dacb2603eb75d69f705d1d5243c2d41b3aa317ee789254903192d5a6efbe85` e captura histórica do guia | D para regras descritas; U para fórmulas e todos os formatos por país | Campeão vem da tabela; promoção direta e playoff vêm do regulamento; zona de queda da primeira divisão suspende o movimento e abre final de permanência | A guia descreve acesso direto/playoffs em parte da pirâmide e uma final antes de cair da primeira. Pontos, desempates e parâmetros por país são regras explícitas e originais do O REI, não fórmulas extraídas. |
| Minijogos | implementation-training.json; treinamento de 26/10, ev_89303d52f77b86dbc5d55e790c68a158cb2ad67675dde9ea231271870c5a4d9e | C para tutorial/controles e treino; D para regras de finais; U para fórmulas internas | Dez modalidades existentes, motor próprio, pausa, teclado/toque, treino e resultado binário (vitória/derrota) | Pontos visíveis removidos. Só o treino permite escolher nível; na carreira a pressão é calculada por clube adversário, competição e fase — decisão original O REI. |
| Copa do Mundo e Super Mundial | treino público: `timing-final.json`, `training-index-en.json`; REA `ev_9388302da65e3944856c41466415ef4be65cf68169b7016c7c295e527fc70970` | C para a categoria pública de jogos de Mundial; D para a existência de decisões especiais; U para classificação e fórmulas internas | Copa: 48 seleções/12 grupos/8 jogos. Super Mundial: 32 clubes/8 grupos/7 jogos. Toda partida é minijogo, com uma modalidade fixa e dificuldade crescente | Formatos, ranking do ciclo, sorteio salvo de empate/pênaltis e limiar OVR 82 são decisões originais solicitadas para O REI. Não são apresentados como regras descobertas da referência. |
| Idolatria | guia pública atual | D | Vínculo por clube, níveis, marcos permanentes, homenagem e estátua no arquivo | Limiares e influência no legado vêm do O REI |
| Resumo | imagem fornecida pelo usuário; resumo observado em 26/10, ev_484c6b369b0b8b58ab120ef739b5d4ebf6aad84eee6eebdbd7de966110f061d4 | C para apresentação | Totais, passagens, títulos agrupados, seleção e PNG | Composição própria; não copia a arte da imagem |
| Online | guia e telas públicas históricas | D/U | Adiado conforme decisão expressa do usuário | Sem submissões a ranking ou API privada |

## Capturas atuais preservadas

- `evidence/public-guide-2026-10-26.json`: ev_0e968304fed659ce3c9ec7d966de5def8b7bc8af6b7805e1800aed71aa18fa03. Guia pública; descrição não equivale a executar efeitos.
- `evidence/qa-mobile-2026-10-26.json`: ev_daaad303ec30525b55157d2a7eddfc02f1e71b3950fc8719df7fccfedbb5c715. **O REI local**, não referência: criação, carta, treino e pausa.
- IDs adicionais acima foram devolvidos pelo REA nesta conversa; quando não há JSON local da captura, não se alega que o arquivo existe.

Nenhuma autenticação, endpoint privado, código-fonte do alvo, ranking ou mecanismo de servidor foi inspecionado. Cenários públicos usaram perfis temporários e cliques limitados. As capturas anteriores permanecem históricas, incluindo tentativas incompletas claramente identificadas no índice.

## Investigação complementar — salários

- REA `ev_71185fb481a850e860b92e428421b422b3c93ae61bd78d9bad2534692635246c`: abertura pública da página inicial em perfil temporário. Não apresenta uma fórmula salarial.
- Tentativas de chegar à criação de carreira encontraram diálogos de novidades; não estabelecem a fórmula, valores ou progressão de salários. As fórmulas internas permanecem desconhecidas.
- REA `ev_3cbc88b44c7aca8bcf82b62e6f5f18cb822d0d13cc2dddf43b7b159da77075a8`: carreira pública iniciada, acontecimento resolvido e primeira temporada concluída. O painel exibiu ganhos acumulados de US$ 48 mil e o resumo exibiu US$ 48 mil ganhos na temporada. A observação não identifica salário contratual, periodicidade de pagamento ou fórmula.
- O REI usa uma fórmula original mensal, dependente de habilidade e orçamento, e preços próprios. Não se afirma equivalência matemática à referência.
- Decisão de calibração do O REI: novos contratos iniciais partem de US$ 4 mil mensais (US$ 48 mil em 12 meses sem prêmios), compatível em ordem de grandeza com o cenário observado; uma única amostra não demonstra uma regra geral do jogo de referência. Saves antigos mantêm seus contratos.
- Validação local: REA `ev_a09df088c08254c3da6db7868ee22016cefa60d2b2cecddbf50594691d50986e` confirmou a criação de carreira e exibição de US$ 4 mil mensais. Um teste separado de navegador percorreu 26 temporadas até a aposentadoria, com duas transferências, recarga do save, compra e exportação da retrospectiva; a conferência do saldo com o extrato passou. `scripts/browser-worlds.mjs` jogou 8 partidas de Copa e 7 de Super Mundial até a celebração, sem repetição do tutorial. Estas evidências são do O REI local, não da referência.

## Mercado: investigação adicional em 2 de novembro

- O guia público descreve propostas, renovação, negociação com risco e pedidos de saída. É descrição pública, não uma negociação executada nesta investigação; o conteúdo e a disponibilidade podem mudar.
- REA `ev_16b72c64765026797f72f83394d03c2d3425522043639ed3b546452b1d903c4b` analisou estaticamente 73 scripts recebidos na página pública inicial. Essa análise não demonstra que o código de cálculo do mercado foi localizado nem executado. As fórmulas de oferta e salário e a lógica de servidor permanecem desconhecidas.
- O REI: até cinco ofertas distintas e renovação; salário, papel, país, liga, duração e previsão de jogos são exibidos; a negociação existente tem regras originais e risco informado. A renovação usa arredondamento que mantém salários positivos. Saves e ofertas já geradas não são modificados retroativamente.
- Limitações pendentes: não foi observada uma negociação real na referência, nem foram estabelecidas suas fórmulas de elegibilidade e salário; portanto, não se declara clonagem fiel desses sistemas.

### Repaginação original do mercado do O REI

- A partir desta versão, faixas de OVR orientam a força dos interessados sem excluir países inteiros. O sorteio usa nível atual, histórico limitado, forma recente, idade, reputação e orçamento do clube, e favorece diversidade de países. São geradas cinco ou seis ofertas quando há candidatos suficientes.
- Antes das propostas, o jogador pode priorizar um país. Negocia uma vez por oferta escolhendo salário, papel ou duração; aceite, recusa e retirada seguem probabilidades próprias do O REI. Empréstimos são solicitados pelo jogador e terminam com retorno ao contrato de origem.
- Essas regras são decisões originais, não novas observações sobre a referência. Saves antigos e propostas já abertas permanecem válidos.
