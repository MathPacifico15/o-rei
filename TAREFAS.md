# O REI — Tarefas pendentes

Lista de tarefas pequenas para fechar o gap com o [El Ídolo](https://www.potrerofutbol.ar/el-idolo).  
**24 tarefas · 12 para Maggio · 12 para Pacifico**

> **Como marcar como feito:** clique no quadrado ☐ na visualização do Markdown (GitHub ou `Ctrl+Shift+V` no Cursor).  
> O checkbox muda de `[ ]` para `[x]` e salva no arquivo. Depois: `git add TAREFAS.md` → `git commit` → `git push`.

---

## Como usar este arquivo

1. Trabalhem na branch **`feature/tarefas`**:
   ```powershell
   git checkout feature/tarefas
   git pull origin feature/tarefas
   ```
2. Pegue **uma tarefa por vez** da sua seção.
3. Commit sugerido: `feat: descrição curta` ou `fix: ...`
4. Marque o checkbox aqui quando terminar.
5. Abra PR quando tiver 2–3 tarefas prontas.

---

## Maggio — Interface

Arquivos: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`

- [ ] **M1** — Mostrar meta de OVR na dashboard (“Meta: 75 até os 20 anos”) · `app/page.tsx` · `feat: add OVR goal hint on career dashboard`
- [ ] **M2** — Exibir bandeira do país do jogador no painel (não só Brasil) · `app/page.tsx` · `feat: show player nationality flag on dashboard`
- [ ] **M3** — Botão “Modo aleatório” na tela de criação · `app/page.tsx` · `feat: add random career start button`
- [ ] **M4** — Tela de ranking local (top 10 no localStorage) · `app/page.tsx` · `feat: add local top-10 ranking screen`
- [ ] **M5** — Botão “Praticar minigame” na home · `app/page.tsx` · `feat: add practice minigame from home`
- [ ] **M6** — Widget de metas na home (3 metas estilo El Ídolo) · `app/page.tsx` · `feat: add daily goals widget on home`
- [ ] **M7** — Tooltip explicando barra de idolatria · `app/page.tsx`, `app/globals.css` · `feat: add idolatry bar tooltips`
- [ ] **M8** — Tela de legado: listar títulos e prêmios · `app/page.tsx` · `feat: expand legacy screen with title list`
- [ ] **M9** — Contador de temporadas até aposentadoria · `app/page.tsx` · `feat: show seasons-until-retirement estimate`
- [ ] **M10** — Botão “Copiar resumo da carreira” · `app/page.tsx` · `feat: copy career summary to clipboard`
- [ ] **M11** — Responsividade mobile do dashboard (375px) · `app/globals.css` · `style: improve mobile dashboard layout`
- [ ] **M12** — Seção “Como jogar” na home · `app/page.tsx` · `feat: add how-to-play section on home`

---

## Pacifico — Jogo / Regras

Arquivos: `game/engine.ts`, `game/types.ts`, `game/minigames.ts`, `game/persistence.ts`

- [ ] **P1** — 3 eventos genéricos (imprensa, lesão leve, patrocínio) · `game/engine.ts` · `feat: add 3 generic career events`
- [ ] **P2** — 3 eventos genéricos (técnico, torcida, extra-campo) · `game/engine.ts` · `feat: add 3 more career events`
- [ ] **P3** — 2 eventos para goleiro (defesa decisiva, erro grotesco) · `game/engine.ts` · `feat: add goalkeeper-specific events`
- [ ] **P4** — 2 eventos para atacante (artilharia, seca de gols) · `game/engine.ts` · `feat: add striker-specific events`
- [ ] **P5** — Função `randomCareerStart(seed)` · `game/engine.ts` ou `game/random.ts` · `feat: add random career start generator`
- [ ] **P6** — Curva de declínio com pico aos 26 anos · `game/engine.ts` · `fix: tune age decline curve around 26`
- [ ] **P7** — Convocação para seleção (fama ≥ 60) · `game/engine.ts` · `feat: improve national team call-up logic`
- [ ] **P8** — Ranking local top 10 em `persistence.ts` · `game/persistence.ts`, `game/types.ts` · `feat: add local ranking persistence`
- [ ] **P9** — Flag `wonderkidMode` (+3 atributos base) · `game/types.ts`, `game/engine.ts` · `feat: add wonderkid mode flag`
- [ ] **P10** — Função de estimativa até aposentadoria · `game/engine.ts` · `feat: add retirement estimate helper`
- [ ] **P11** — Função que gera texto-resumo da carreira · `game/engine.ts` · `feat: add career summary text generator`
- [ ] **P12** — Documentar probabilidade de final de copa · `game/engine.ts` · `docs: document cup final probability tuning`

---

## Tarefas dos dois (depois das 24)

- [ ] Conectar ranking local (P8) com tela (M4) — Pacifico exporta · Maggio integra UI
- [ ] Modo aleatório (P5) + botão (M3) — merge das partes
- [ ] Resumo da carreira (P11) + botão copiar (M10) — merge das partes
- [ ] Ativar Supabase — Pacifico configura · Maggio conecta UI de login
- [ ] Ranking global online — depende do Supabase
- [ ] Expandir eventos para 50+ — Pacifico escreve · Maggio revisa textos
- [ ] Tradução ES/EN — Maggio scaffold i18n · Pacifico revisa strings do `game/`

---

## Roadmap (metas maiores)

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

## Checklist antes de marcar uma tarefa

- [ ] Código roda sem erro (`npm run dev`)
- [ ] Testou manualmente no navegador
- [ ] Commit com mensagem clara
- [ ] Push na branch `feature/tarefas`
- [ ] Não commitou `.env` nem `node_modules`

---

## Progresso

| Maggio | Pacifico |
|--------|----------|
| 0 / 12 | 0 / 12 |

Contagem: quantos `- [x]` existem em cada seção acima.

---

## Ordem sugerida (primeira semana)

**Maggio:** M1 → M3 → M7 → M12  
**Pacifico:** P1 → P2 → P5 → P6  

Depois: M4 + P8 (ranking), M10 + P11 (resumo).
