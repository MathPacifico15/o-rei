# Alterar o visual

O visual existente continua em `app/globals.css`, `app/final-tweaks.css` e `app/minigames.css`. Ajustes desta entrega ficam em `app/career-polish.css`; as variáveis `--rei-radius`, `--rei-focus` e `--rei-overlay` controlam acabamento, foco e sobreposição.

Na branch `rea-maggio`, a camada visual aplicada após essas folhas é `app/rea-maggio.css`. Ela define painéis escuros, estatísticas, perfil, resumo editorial, treino e arena; os seletores têm escopo `html:root body` para prevalecer sobre o CSS legado. A prévia importa a mesma folha em `preview/main.tsx`. A tipografia Anton é local em `public/fonts/`, acompanhada da licença OFL. O estudo de referência e seus limites estão em `research/rea-ui-potrero.md`.

Os minijogos têm CSS isolado em `components/minigame-arena.css`. Loja e retrospectiva foram extraídas para componentes próprios; editar seus textos e composição não exige alterar o motor da carreira.

Dados de produtos/preços/efeitos ficam em `game/economy.ts`. Situações e escolhas ficam em `game/career-events.ts`. Não coloque regras de simulação no CSS ou em textos de botões. Depois de alterar valores, execute `npm test` e revise os textos dos benefícios.

A prévia Vite renderiza o mesmo `app/page.tsx` do produto. Não há um segundo jogo ou domínio alternativo. O invólucro em `preview/` permite testar localmente sem configurar hospedagem ou autenticação.
