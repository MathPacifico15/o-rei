# O REI — Tarefas pendentes

Lista de tarefas pequenas para fechar o gap com o [El Ídolo](https://www.potrerofutbol.ar/el-idolo).  
**24 tarefas · 12 para Matheus · 12 para Parceiro**

Cada tarefa deve ser feita na branch correta, com commit e push. Quando terminar, marque `[x]`.

---

## Como usar este arquivo

1. Trabalhem na branch **`feature/tarefas`** (branch principal de desenvolvimento):
   ```powershell
   git checkout feature/tarefas
   git pull origin feature/tarefas
   ```
   Opcional: `feature/ui` (só interface) · `feature/game` (só motor)
2. Pegue **uma tarefa por vez** da sua coluna.
3. Commit sugerido: `feat: descrição curta` ou `fix: ...`
4. Abra PR quando tiver 2–3 tarefas prontas.
5. Antes de começar: `git pull`

---

## Matheus — Interface (`feature/ui`)

Arquivos principais: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`

| # | Tarefa | Arquivo(s) | Commit sugerido |
|---|--------|------------|-----------------|
| M1 | [ ] Mostrar meta de OVR na dashboard (“Meta: 75 até os 20 anos”) | `app/page.tsx` | `feat: add OVR goal hint on career dashboard` |
| M2 | [ ] Exibir bandeira do país do jogador no painel (não só Brasil) | `app/page.tsx` | `feat: show player nationality flag on dashboard` |
| M3 | [ ] Botão “Modo aleatório” na tela de criação (preenche campos random) | `app/page.tsx` | `feat: add random career start button` |
| M4 | [ ] Tela de ranking local (top 10 carreiras no localStorage) | `app/page.tsx` | `feat: add local top-10 ranking screen` |
| M5 | [ ] Botão “Praticar minigame” na home (joga sem carreira) | `app/page.tsx` | `feat: add practice minigame from home` |
| M6 | [ ] Widget de metas na home (3 metas fixas estilo El Ídolo) | `app/page.tsx` | `feat: add daily goals widget on home` |
| M7 | [ ] Tooltip explicando barra de idolatria (o que é cada estágio) | `app/page.tsx`, `app/globals.css` | `feat: add idolatry bar tooltips` |
| M8 | [ ] Melhorar tela de legado: listar títulos e prêmios em lista | `app/page.tsx` | `feat: expand legacy screen with title list` |
| M9 | [ ] Adicionar contador de temporadas restantes até aposentadoria | `app/page.tsx` | `feat: show seasons-until-retirement estimate` |
| M10 | [ ] Botão “Copiar resumo da carreira” (clipboard no fim) | `app/page.tsx` | `feat: copy career summary to clipboard` |
| M11 | [ ] Ajustar responsividade mobile do dashboard (testar 375px) | `app/globals.css` | `style: improve mobile dashboard layout` |
| M12 | [ ] Link “Como jogar” na home (modal ou seção com regras básicas) | `app/page.tsx` | `feat: add how-to-play section on home` |

---

## Parceiro — Jogo / Regras (`feature/game`)

Arquivos principais: `game/engine.ts`, `game/types.ts`, `game/minigames.ts`, `game/persistence.ts`

| # | Tarefa | Arquivo(s) | Commit sugerido |
|---|--------|------------|-----------------|
| P1 | [ ] Adicionar 3 eventos genéricos novos (imprensa, lesão leve, patrocínio) | `game/engine.ts` | `feat: add 3 generic career events` |
| P2 | [ ] Adicionar 3 eventos genéricos novos (técnico, torcida, extra-campo) | `game/engine.ts` | `feat: add 3 more career events` |
| P3 | [ ] Adicionar 2 eventos só para goleiro (defesa decisiva, erro grotesco) | `game/engine.ts` | `feat: add goalkeeper-specific events` |
| P4 | [ ] Adicionar 2 eventos só para atacante (artilharia, seca de gols) | `game/engine.ts` | `feat: add striker-specific events` |
| P5 | [ ] Função `randomCareerStart(seed)` que sorteia país, liga, clube e posição | `game/engine.ts` ou novo `game/random.ts` | `feat: add random career start generator` |
| P6 | [ ] Ajustar curva de declínio: pico de forma por volta dos 26 anos | `game/engine.ts` | `fix: tune age decline curve around 26` |
| P7 | [ ] Melhorar lógica de convocação para seleção (evento dedicado quando fama ≥ 60) | `game/engine.ts` | `feat: improve national team call-up logic` |
| P8 | [ ] Salvar/carregar ranking local (top 10 scores) em `persistence.ts` | `game/persistence.ts`, `game/types.ts` | `feat: add local ranking persistence` |
| P9 | [ ] Flag `wonderkidMode` no `CareerState` (+3 em atributos base se true) | `game/types.ts`, `game/engine.ts` | `feat: add wonderkid mode flag` |
| P10 | [ ] Exportar função que estima temporadas até aposentadoria | `game/engine.ts` | `feat: add retirement estimate helper` |
| P11 | [ ] Exportar função que gera texto-resumo da carreira (para clipboard) | `game/engine.ts` | `feat: add career summary text generator` |
| P12 | [ ] Revisar probabilidade de final de copa (comentar constantes no código) | `game/engine.ts` | `docs: document cup final probability tuning` |

---

## Tarefas que precisam dos dois (depois das 24)

Façam juntos ou em sequência, após merge das branches:

| Tarefa | Quem lidera |
|--------|-------------|
| Conectar ranking local (P8) com tela de ranking (M4) | Matheus integra UI + Parceiro exporta API |
| Modo aleatório (P5) + botão na UI (M3) | Merge das duas branches |
| Resumo da carreira (P11) + botão copiar (M10) | Merge das duas branches |
| Ativar Supabase (conta + sync na nuvem) | Parceiro configura · Matheus conecta UI de login |
| Ranking global online | Depende do Supabase |
| Expandir eventos para 50+ | Parceiro escreve · Matheus revisa textos na UI |
| Tradução ES/EN | Matheus scaffold i18n · Parceiro revisa strings do `game/` |

---

## O que ainda falta (visão geral — fora desta lista inicial)

Estas são metas maiores, não tarefas pequenas. Usem como roadmap depois das 24:

### Conteúdo
- [ ] Expandir eventos de ~9 para 50, depois 100, meta 300+
- [ ] Mais clubes com escudos licenciados
- [ ] Eventos de vida pessoal (família, imprensa, patrocínio avançado)
- [ ] Modo carreira especial (ex.: “carreira de ídolo”)

### Engajamento
- [ ] Ranking global (requer backend)
- [ ] Login de usuário (Supabase Auth)
- [ ] Metas diárias com recompensa
- [ ] Gabinete de troféus persistente entre carreiras
- [ ] Modo misto (habilidade + sorte)

### Produto
- [ ] Economia (moedas, loja) — opcional
- [ ] App na App Store / Google Play (TWA ou Capacitor)
- [ ] Tradução: espanhol, inglês, francês, italiano
- [ ] Modo duelo (PvP assíncrono) — longo prazo

### Técnico
- [ ] Ativar Supabase em produção
- [ ] Testes automatizados do engine
- [ ] CI no GitHub (lint + build)
- [ ] Deploy Cloudflare configurado

---

## Checklist de entrega por tarefa

Antes de marcar como feita:

- [ ] Código roda sem erro (`npm run dev`)
- [ ] Testou manualmente no navegador
- [ ] Commit com mensagem clara
- [ ] Push na branch correta
- [ ] Não commitou `.env` nem `node_modules`

---

## Progresso

| Matheus | Parceiro |
|---------|----------|
| 0 / 12 | 0 / 12 |

Atualizem esta tabela conforme forem concluindo.

---

## Ordem sugerida (primeira semana)

**Matheus:** M1 → M3 → M7 → M12  
**Parceiro:** P1 → P2 → P5 → P6  

Depois: M4 + P8 juntos (ranking), M10 + P11 juntos (resumo).
