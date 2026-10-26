# O REI — versão jogável local

Esta é a evolução do repositório original, com a interface central e os dez minijogos existentes. A prévia está em **http://127.0.0.1:4183/**.

## Executar

Na pasta `o-rei-github`, com Node 22.13 ou superior:

```sh
npm install
npm run dev:local
```

Nesta máquina as dependências existentes são reutilizadas por uma junction `node_modules`; não é necessário reinstalar para abrir a prévia atual.

```sh
npm run typecheck
npm test
npm run build:local
```

O build está em `dist-local/`. Os comandos originais de hospedagem foram mantidos. Os testes complementares de navegador em `scripts/browser-*.mjs` usam Playwright instalado isoladamente em `../work/o-rei-qa` e Chrome local; ajuste esses caminhos em outra máquina.

## Jogar

Crie o atleta, assine o primeiro contrato e escolha uma das três cartas. Continue a temporada, responda aos acontecimentos e dispute as decisões. Ligas são simuladas de uma vez; playoffs e permanência interrompem apenas quando o regulamento exige. Na Copa do Mundo e no Super Mundial, todas as partidas dos grupos à final são minijogos exclusivos, com dificuldade crescente. Confira o resumo, prepare a próxima temporada e resolva propostas quando a janela abrir. A carreira termina com a aposentadoria e pode ser exportada como imagem.

O topo oferece histórico, treino dos dez minijogos, exportação/importação do save e recuperação do backup anterior. A loja está no cabeçalho do atleta. Não é necessário criar conta.

## Documentação

- [Entrega, testes e limites](docs/implementation-status.md)
- [Matriz de evidências REA](research/feature-ledger.md)
- [Regras e controles dos minijogos](docs/minigames.md)
- [Edição visual](docs/ui-editing.md)

Conta, ranking global, duelos, publicação de carreira e validação online pertencem à próxima entrega. Nenhum commit ou push foi realizado.
