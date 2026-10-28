# Investigação de interface — El Ídolo

Data: 27 de outubro de 2026. Alvo: https://www.potrerofutbol.ar/el-idolo

## Escopo e evidência

O REA inspecionou o site em um Chromium temporário. A primeira investigação criou uma carreira aleatória e jogou uma decisão no treino. Na continuação, uma sessão separada percorreu a carreira de história acessada pelo cartão Messi: o jogador gerado foi Matías Vera, atacante habilidoso, começando no Newell's e transferido ao Barcelona. As escolhas foram realizadas pela UI com Playwright; o REA registrou DOM, acessibilidade, recursos e scripts em capturas passivas antes e depois da final. Não houve alteração do estado interno do jogo. Cookies opcionais foram recusados; nenhuma conta foi acessada.

Foram concluídas duas decisões reais da carreira na temporada 2028/29: Copa América, escolhendo o lado do chute contra o goleiro, e Champions League, Barcelona contra Arsenal, parando o marcador na zona correta. Ambas terminaram em vitória. Depois de confirmar a final, o resumo apresentou os dois títulos e o Golden Boy. O jogo apresenta essas partidas como decisões curtas de minijogo; não foi observada uma simulação jogável de 90 minutos. A carreira foi acompanhada até a terceira temporada, não até a aposentadoria.

Esta é uma amostra de execução, não um inventário de todos os estados e minijogos. O navegador recebeu arquivos compilados; não foram recuperados o repositório original, o JSX/TSX original nem o backend. Os nomes com hash podem mudar. Evidências e inventário dos scripts observados: [rea-maggio-analysis.json](evidence/rea-maggio-analysis.json).

### Fluxo completo da final observado

1. **Antes da jogada:** perfil com overall 74, Barcelona, 18 anos, atributos e idolatria; painel da competição com título Champions League, Barcelona e Arsenal, instrução, barra, zona de acerto e botão para parar.
2. **Jogada:** clique no controle de parada, sem manipulação do relógio ou dos dados da carreira.
3. **Resultado:** confirmação de acerto e vitória, mantendo competição e adversários na tela; o controle ativo é substituído pela ação de continuar.
4. **Confirmação:** o resumo da temporada passa a mostrar Champions League e Copa América como títulos; o contador do perfil passa para dois títulos. Os valores de fama, partidas e dinheiro ainda apresentam animações, portanto capturas feitas em instantes diferentes podem mostrar contagens intermediárias.

Evidências REA: `ev_fd0a56082f8000baab5a63d604d11b973c1363e12c2b35cf4f4ea798ce0f20b6` (antes da Champions), `ev_3a1491678a8ac469a179703469ccf3af62afcfbc4d603b8f0fc7b48d48d5db3a` (vitória) e `ev_91567d2339ea978e1e849265e4acf8819310013e913e59c59437132291a66137` (resumo confirmado). As capturas passivas filtram outras origens, têm cobertura limitada ao intervalo de observação e não demonstram que todas as funções dos scripts carregados executaram.

## Arquivos de UI observados no navegador

- [Folha do El Ídolo](https://www.potrerofutbol.ar/assets/elIdolo-BXktXw5m.css) e [estilos gerais](https://www.potrerofutbol.ar/assets/index-C5IPIWRA.css).
- [Página El Ídolo](https://www.potrerofutbol.ar/assets/ElIdoloPage-DAbR4Ys3.js), [módulo El Ídolo](https://www.potrerofutbol.ar/assets/elIdolo-CErBEEha.js) e [entrada da aplicação](https://www.potrerofutbol.ar/assets/index-B9XZ_sH7.js).
- Recursos relacionados identificados no carregamento: `MotionPrimitives-m02_odId.js`, `PalmaresCard-CZ9jnaFt.js`, `BanderaFondo-epqwpHVy.js`, `PremiumPlus-BEJ4qvxr.js` e sua folha CSS. Os nomes sugerem funções, mas não demonstram quais partes executaram em cada tela. `engine--wX2rA9o.js`, `attributes-RPPup6BP.js` e `events-BLmAYocs.js` também foram carregados e provavelmente incluem lógica além da UI.
- As cartas de especialização observadas usam classes como `elidolo-pop` e `tx-tarjeta`; o menu de treino usa cartões com bordas, fundo escuro e estados hover. As folhas recebidas declaram Inter, Anton e Barlow Condensed. O fundo é quase preto, os painéis são slate e os acentos principais são verdes, com amarelo e ciano para valores. Botões e faixas têm cortes diagonais; a idolatria é uma barra segmentada. Os estilos computados de todos os elementos e breakpoints ainda não foram medidos individualmente.

### Módulos públicos de UI localizados

Além da página principal, foram adquiridos nove bundles públicos para análise estática pelo REA. Os nomes e responsabilidades abaixo orientam a leitura; a presença de um arquivo não prova que todas as suas ramificações foram alcançadas.

- [IdoloStats-BrAIehvM.js](https://www.potrerofutbol.ar/assets/IdoloStats-BrAIehvM.js): candidato principal para painel do atleta e estatísticas.
- [IdolMeter-BMj3qeOY.js](https://www.potrerofutbol.ar/assets/IdolMeter-BMj3qeOY.js): medidor de idolatria.
- [IdoloBanner-s8Bhv5SM.js](https://www.potrerofutbol.ar/assets/IdoloBanner-s8Bhv5SM.js): banner associado ao modo carreira.
- [EventCard-DozyGY84.js](https://www.potrerofutbol.ar/assets/EventCard-DozyGY84.js): cartão de acontecimento e escolhas.
- [PickCards-BlB7_I2P.js](https://www.potrerofutbol.ar/assets/PickCards-BlB7_I2P.js): seleção de cartas de melhoria.
- [OfferBoard-BrU3wJm8.js](https://www.potrerofutbol.ar/assets/OfferBoard-BrU3wJm8.js): propostas de transferência. A proposta Newell's → Barcelona foi observada na sessão.
- [PalmaresCard-CZ9jnaFt.js](https://www.potrerofutbol.ar/assets/PalmaresCard-CZ9jnaFt.js): candidato para palmarés/retrospectiva; essa tela não foi percorrida integralmente nesta sessão.
- `MotionPrimitives-m02_odId.js`: primitivas de movimento; `ElIdoloPage-DAbR4Ys3.js`: composição da página e coordenação do fluxo.

O REA analisou os nove arquivos JavaScript sem executá-los e registrou zero falhas de parsing. Evidência estática: `ev_9b61ebc34a33e1f2dbf2b08d947c094d0ab2f020b867792f6f30c822f93d54df`; resumo: `ev_1779a7c8794deed3c01d03722626c082208a718871f5b8416e2eec814bc22fe1`. O grafo é parcial: dependências fora desse subconjunto e relações dinâmicas permanecem desconhecidas, e a análise semântica foi limitada a 12.000 nós globais/3.000 por arquivo. Não é uma recuperação de todo o código original. A análise de CSS foi textual, separada do parser JavaScript. As cópias públicas para pesquisa ficam em `work/potrero-ui-reference/`, ignoradas pelo Git; não são usadas como código da aplicação.

## Telas e componentes observados

1. **Entrada:** navegação do site, abas de modos, desafio do dia, criação de carreira com nacionalidade, país, liga, clube, nome, posição, seleção aleatória e botão de início. Abaixo aparecem carreiras especiais, modo história, ranking, treino e loja.
2. **Perfil da carreira:** overall, nome, idade, fama, clube, seleção, barra de idolatria, quatro estatísticas, atributos individuais, valor, faturamento e glória. Ações de loja, empresário, histórico e aposentadoria acompanham o perfil.
3. **Escolhas iniciais:** cartões de identidade (supersticioso, misto ou habilidoso) e três cartões de especialização com descrição e bônus. A seleção da especialização levou diretamente à simulação da temporada.
4. **Resumo da temporada:** painel editorial com ano e número da temporada, manchete, texto de desempenho, clube e colocação, estatísticas resumidas e botão de continuar. Na observação, jogos da liga foram simulados em bloco.
5. **Treino:** três dificuldades e catálogo de desafios agrupados por habilidade/intuição e por posição ou competição. No momento da captura a página listava 19 desafios de habilidade e 14 de intuição.
6. **Decisão de timing:** competição, times, instrução para parar um marcador na zona verde e botão de parar. No treino, resultado com ações de repetir/retornar; na final da carreira, vitória seguida por confirmação e retorno ao resumo. Foram observadas derrota no treino e vitória na Champions.

## Correspondência no O REI

- `app/page.tsx`: entrada, criação, perfil, decisões, temporada e navegação de treino; é o principal ponto para reestruturar a experiência.
- `app/globals.css`, `app/career-polish.css`, `app/final-tweaks.css` e `app/minigames.css`: estilos da aplicação e das telas de carreira.
- `components/minigame-arena.tsx` e `components/minigame-arena.css`: tutorial, controles, fase ativa e resultado das decisões. O motor está em `game/minigame-engine.ts`.
- `components/career-shop.tsx` e `components/career-retrospective.tsx`: loja e retrospectiva.
- `preview/main.tsx` e `vite.local.config.ts`: entrada da prévia local usada em `http://127.0.0.1:4183/`.

## UI aplicada na branch rea-maggio

- `app/rea-maggio.css`: folha própria do O REI para paleta escura, faixas, números condensados, painéis retos, botões diagonais, perfil, escolhas, treino e arena. Os seletores são específicos para prevalecer sobre o acabamento anterior na prévia e na aplicação.
- `app/page.tsx`: entrada em painel compacto, ações do perfil em faixa própria, catálogo de treino com descrições e contexto de competição/clubes na decisão. Os callbacks existentes continuam conectados ao motor.
- `components/minigame-arena.tsx`: classe de resultado distingue visualmente vitória e derrota; regras e validação da jogada ficam no motor existente.
- `preview/main.tsx`: carrega a folha da branch na prévia local.
- `public/fonts/Anton-Regular.ttf` e `Anton-OFL.txt`: fonte aberta obtida do [repositório oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/anton), distribuída com a licença. A fonte é local, sem depender do servidor do site de referência.

A implementação traduz a hierarquia visual observada para os componentes próprios do O REI. O REI continua tendo seu conjunto atual de dez minijogos, regras de carreira e ferramentas de save; não foram adicionados os modos, contas, anúncios ou o catálogo inteiro do outro produto. Não se trata de uma cópia integral do site.

### Verificação da implementação

Typecheck e build local executados. A navegação foi testada em Chromium em desktop (1440 × 1000) e celular (390 × 844): criação, seleção da carta, perfil, catálogo de dez treinos, jogada de timing, resultado e confirmação. O teste não registrou erros JavaScript nem rolagem horizontal nas oito telas verificadas. Houve revisão visual das capturas e correção da cascata dos estilos, grade de atributos e alinhamento financeiro no celular.

O teste de navegador existente da carreira também passou com a UI nova: 209 ações de fluxo, 26 temporadas, 33 decisões concluídas, duas transferências, compra na loja, restauração após recarregar, aposentadoria aos 42 anos e exportação PNG. Esse teste local acelera o relógio para exercitar decisões; é distinto da partida real no site de referência, jogada sem alterar o relógio. O nome acessível do botão da loja foi preservado após a verificação. Resultado: [career-flow.json](../docs/qa/rea-maggio/career-flow.json).

Capturas da implementação: [perfil desktop](../docs/qa/rea-maggio/career-desktop.png), [perfil celular](../docs/qa/rea-maggio/career-mobile.png) e [resultado de decisão](../docs/qa/rea-maggio/match-result-desktop.png). O resultado do smoke test está em [ui-smoke.json](../docs/qa/rea-maggio/ui-smoke.json).

## Cobertura restante

Perfil, cartões, resumo, catálogo de treino e estado da arena foram trabalhados na branch. Para um levantamento exaustivo, ainda é necessário percorrer a aposentadoria, histórico completo, loja, outros modos, todos os minijogos e seus estados de erro, além dos breakpoints do site original. Mercado foi observado em uma proposta, não em todas as variantes. A tipografia e a composição foram aproximadas; não foi feita comparação automatizada pixel a pixel.
