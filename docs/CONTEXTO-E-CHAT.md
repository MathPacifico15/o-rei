# O REI — Contexto do Projeto (resumo do chat)

Documento gerado a partir da conversa de setup, análise e comparação com o El Ídolo (Potrero).

---

## Repositório

| Item | Valor |
|------|-------|
| **GitHub** | https://github.com/MathPacifico15/o-rei |
| **Pasta local** | `E:\O REI` |
| **Branch principal** | `main` — versão oficial e estável do jogo |
| **Branches de trabalho** | `feature/ui` (interface) · `feature/game` (motor/regras) |

---

## Setup realizado

- Git instalado (v2.55.0) via winget
- Repositório clonado em `E:\O REI`
- Dependências instaladas (`npm install`)
- Servidor de dev testado: `npm run dev` → http://localhost:5173/
- Git configurado:
  - **Nome:** matheus maggiorini
  - **E-mail:** mt.maggiorini@gmail.com
- Branches `feature/ui` e `feature/game` criadas e enviadas ao GitHub

---

## Fluxo Git para colaboração

### Regra de ouro
Nunca trabalhar direto na `main`. Cada um usa sua branch.

### Comandos do dia a dia

```powershell
# Antes de começar
git pull

# Trabalhar na sua branch
git checkout feature/ui      # Matheus (interface)
git checkout feature/game    # Parceiro (jogo/regras)

# Salvar e enviar
git add .
git commit -m "feat: descreva o que fez"
git push

# Juntar na main (via Pull Request no GitHub)
# https://github.com/MathPacifico15/o-rei/compare
```

### Onde configurar Git no VS Code / Cursor

| O quê | Onde |
|-------|------|
| Nome e e-mail | Terminal: `git config --global user.name` / `user.email` |
| Commits, push, pull | Source Control (`Ctrl + Shift + G`) |
| Trocar branch | Canto inferior esquerdo |
| Login GitHub | `Ctrl + Shift + P` → "GitHub: Sign In" |

---

## O que é a `main`

A `main` guarda a **versão oficial atual** do O REI — não é um rascunho, é o jogo completo como está hoje. Quando vocês terminam algo nas branches e fazem merge, a `main` vira a versão mais nova.

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Estilo | Tailwind CSS 4, shadcn/ui |
| Build | Vite (vinext), Cloudflare Workers |
| Dados | Drizzle ORM, Supabase (schema pronto, não ativado) |
| Persistência local | localStorage + PWA (service worker) |

---

## Estrutura do projeto

```
o-rei/
├── app/              → Páginas, layout, fluxo de telas (UI)
├── components/ui/    → Componentes visuais reutilizáveis
├── game/             → Motor do jogo (regras, dados, minigames)
│   ├── engine.ts         → Simulação, eventos, cartas, legado
│   ├── catalog.ts        → Ligas, clubes, competições
│   ├── minigames.ts      → Definição dos 10 minigames
│   ├── persistence.ts    → Salvamento local + contrato Supabase
│   └── data/             → Snapshots de clubes e escudos
├── public/           → Logo, PWA, service worker
└── scripts/          → Build, sync de dados, deploy
```

---

## O que já funciona (versão atual na `main`)

### Criação de carreira
- Nome, nacionalidade (195 países com bandeira), posição, pé dominante, altura, número
- Escolha de liga e clube inicial
- Início aos **16 anos**

### Sistema de atributos
- **20 atributos** reais (velocidade, finalização, reflexos, etc.)
- **12 posições** (GOL, ZAG, LD, LE, ALA, VOL, MC, MEI, PD, PE, SA, CA)
- **OVR** calculado por peso de posição
- **Cartas de evolução** rara / épica / lendária (1 por temporada)

### Simulação
- Temporadas aceleradas com gols, assistências, jogos, lesões
- Títulos de liga, promoção (Série B/C/D), prêmios (Bola de Ouro, Chuteira de Ouro)
- Finais de copa geradas com oponente plausível
- Semente reprodutível (RNG determinístico)

### Narrativa e consequências
- **0–5 eventos** por temporada (~9 tipos no total)
- **Mercado bienal** com propostas de transferência
- **Idolatria** por clube (0–100)
- **Status Judas** ao ir para clube rival
- Convocação para seleção (por fama)

### Minigames (10)
Memória tática, sequência de sinais, rastrear bola, zonas do goleiro, timing de chute, finta, corrida de faixas, quatro em linha, grade segura, código/senha.

### Fim de carreira
- Aposentadoria natural por idade/desempenho
- **Legado 0–1000** com títulos (Lenda Eterna, Craque Geracional, etc.)

### Infraestrutura
- PWA instalável
- Salvamento local automático
- Schema Supabase pronto (`game/supabase-schema.sql`)
- Catálogo extenso de competições (Brasil, Argentina, Europa, etc.)
- Escudos licenciados via componente `ClubCrest`

---

## Referência: El Ídolo (Potrero)

**URL:** https://www.potrerofutbol.ar/el-idolo  
**Versão:** 2.6  
**Conceito:** Modo carreira de futebol por decisões — não joga partida a partida.

### O que o El Ídolo faz bem (benchmark)
- **300+ eventos** de decisão (campo + vida pessoal)
- **Ranking global** competitivo
- **Login + moedas** + metas diárias + loja
- Modo aleatório e modo misto (habilidade + sorte)
- **3 posições** (atacante, armador, goleiro)
- App na App Store / Google Play
- Comunidade ativa (602+ clubes enviados por usuários)
- Carreira completa em ~5 minutos
- Meta conhecida: OVR 75 aos 20, pico aos 26, buscar OVR 99

### O que o O REI já faz melhor ou diferente
- **12 posições** vs 3
- **20 atributos** detalhados vs sistema mais simples
- **Idolatria + Judas** (narrativa de clube/rival)
- **Catálogo de competições** muito amplo no código
- Código open source, arquitetura separada (`game/` vs `app/`)
- PWA sem login obrigatório

### Gaps principais (o que falta para competir)
| Área | El Ídolo | O REI |
|------|----------|-------|
| Eventos | 300+ | ~9 |
| Ranking | Global | Nenhum |
| Login/conta | Sim | Schema pronto, não ativado |
| Economia (moedas/loja) | Sim | Não |
| Metas diárias | Sim | Não |
| Modo aleatório | Sim | Não |
| Idiomas | 5 | PT-BR |
| App nativa | Sim | Só PWA |

### Mapa de progresso estimado

```
Motor de jogo        ████████████████░░░░  ~80%
Interface / UX       ██████████████░░░░░░  ~70%
Dados (clubes/ligas) ██████████░░░░░░░░░░  ~50%
Eventos / narrativa  ████░░░░░░░░░░░░░░░░  ~20%
Ranking / social     ░░░░░░░░░░░░░░░░░░░░   ~0%
Economia / login     ░░░░░░░░░░░░░░░░░░░░   ~0%
```

---

## Divisão de branches sugerida

| Branch | Responsável sugerido | Foco |
|--------|---------------------|------|
| `feature/ui` | Matheus | Telas, dashboard, UX, ranking visual |
| `feature/game` | Parceiro | Eventos, engine, balanceamento, minigames |

---

## Comandos úteis

```powershell
# Rodar o jogo
cd "E:\O REI"
npm run dev

# Build de produção
npm run build

# Ver branch atual
git branch

# Atualizar da main na sua branch
git checkout feature/ui   # ou feature/game
git merge main
```

---

## Links úteis

- Repositório: https://github.com/MathPacifico15/o-rei
- PR feature/ui: https://github.com/MathPacifico15/o-rei/pull/new/feature/ui
- PR feature/game: https://github.com/MathPacifico15/o-rei/pull/new/feature/game
- Referência El Ídolo: https://www.potrerofutbol.ar/el-idolo
