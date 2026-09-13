# O REI

Jogo web/PWA mobile-first de carreira rápida no futebol. O jogador cria um atleta aos 16 anos, escolhe clube e posição, disputa temporadas aceleradas e constrói um legado até a aposentadoria natural.

## Documentação do projeto

- [Contexto e resumo do chat](docs/CONTEXTO-E-CHAT.md) — setup Git, comparação com El Ídolo, o que já existe
- [Tarefas pendentes (24 tarefas, 12 por pessoa)](TAREFAS.md) — o que falta, dividido entre Matheus e Parceiro

## O que já funciona

- Criação de atleta, com nacionalidade, posição, pé dominante, altura, número, liga e clube.
- OVR por posição, 20 atributos e cartas rara/épica/lendária focadas em atributos reais.
- Simulação reprodutível por semente, forma, lesão, títulos, acessos, prêmios e legado.
- Eventos de zero a cinco por temporada, mercado bienal, rivalidades, idolatria e status de Judas.
- Os dez minigames previstos: memória tática, sequência de sinais, rastrear a bola, zonas do goleiro, timing de chute, finta do defensor, corrida de faixas, quatro em linha, grade segura e código/senha.
- Salvamento local automático, instalável como PWA e contrato de sincronização pronto para Supabase.

## Rodar localmente

Requer Node.js 22 ou superior.

```bash
pnpm dev
```

Para validar uma versão de produção:

```bash
pnpm build
```

## Dados de clubes e escudos

`game/catalog.ts` contém a base inicial e a lista explícita de competições que a edição completa deve cobrir. `game/importer.ts` valida e mescla um pacote público ou licenciado sem modificar o motor de simulação.

Cada pacote deve fornecer nome, liga e chave de escudo para todo clube. A interface mantém a chave de escudo isolada no componente `ClubCrest`, permitindo trocar os símbolos de desenvolvimento pelos arquivos licenciados sem alterar as telas.

## Nuvem

`game/supabase-schema.sql` e `game/persistence.ts` deixam pronta a camada de conta e sincronização. Para ativá-la em produção, adicione as variáveis públicas do projeto Supabase e conecte o adaptador `CloudCareerGateway` a um cliente autenticado.

## Estrutura

- `app/`: interface e experiência PWA.
- `game/`: regras, dados, minigames, importação e persistência.
- `public/`: marca, manifesto e service worker.
