# O REI game core

Módulos TypeScript sem dependência de interface para conectar ao frontend Lovable.

- `catalog.ts`: competições, clubes, rivalidades, validação e base para importadores licenciados.
- `engine.ts`: atributos, OVR, cartas, RNG com semente, simulação, eventos, legado e aposentadoria.
- `types.ts`: contratos públicos usados pela interface e pela nuvem.

O catálogo inicial é propositalmente validável: a publicação do jogo deve falhar se um clube de uma competição licenciada não tiver nome, liga ou chave de escudo.
