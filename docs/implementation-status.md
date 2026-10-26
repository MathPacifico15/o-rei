# O REI — entrega local de carreira

Atualizado em 26/10/2026. Base: `MathPacifico15/o-rei`, main `fdd060266ecfa6fac87f5146632033b712e1d7c6`, confirmada com leitura remota. A cópia original em `../o-rei` e os demais worktrees foram preservados. Nenhum commit ou push foi feito.

## Estado inicial e decisão

O repositório já tinha React/TypeScript, interface central, cartas, mercado, competições e dez minijogos. A implementação anterior em outra pasta não foi usada como produto. O plano aceito substitui a antiga proposta de oito telas e calendário semanal: esta entrega segue temporadas, com decisões no painel da carreira.

## Entregue

- Save v8 com validação, migração de v6/v7, backup anterior, preservação de corrupção, importação/exportação e retomada da fila de eventos/finais. O reset destrutivo da versão anterior foi removido.
- Carta inicial e uma escolha entre três por temporada; avanço bloqueado enquanto a preparação está pendente.
- 80 situações cotidianas originais, além de eventos contextuais de imprensa, idade, posição, contrato e torcida; duas a quatro decisões por temporada, sem repetir IDs das três temporadas anteriores.
- Loja em painel sobre a carreira: equipe permanente, consumíveis, patrimônio, efeitos descritos, duração e extrato. Psicólogo melhora forma; não muda derrota em vitória.
- Mercado com propostas, renovação, permanência, pedido de saída e uma contraproposta por oferta (+12% com risco declarado de retirada de 35%). Transferência só inicia na temporada seguinte.
- Ligas por pontos, classificação consultável e título do líder. Desempates usam pontos, saldo, gols, vitórias e sorteio técnico determinístico. Promoções diretas seguem a configuração da divisão; a Inglaterra tem playoffs configuráveis. Ao terminar a primeira divisão na zona de rebaixamento, o clube do atleta só muda depois de uma final de permanência. Vitória salva; derrota transfere uma única divisão. Corrigido o erro que permitia queda automática em cascata. Fontes de classificação aparecem nas campanhas.
- Dez modalidades existentes extraídas para motor determinístico: controles de teclado/toque, pausa inclusive ao ocultar a página, resultados binários, treino, som opcional e telemetria local. Não há pontos na carreira. A dificuldade da carreira é contextual (força do clube adversário, prestígio e fase); o seletor continua apenas no treino.
- Copa do Mundo com 48 seleções, 12 grupos e até oito partidas jogáveis; convocação exige OVR 82. Super Mundial com 32 clubes, oito grupos, vaga por título continental ou ranking do ciclo e até sete partidas jogáveis. Cada edição congela participantes, grupo, adversários, sorteios e um minijogo exclusivo. A pressão cresce por fase. Derrota nos grupos tem 50% de chance salva de virar empate; no mata-mata, 50% de chance salva leva à repetição mais difícil como pênaltis.
- Histórico por passagens consecutivas, distinguindo retornos, títulos agrupados, seleção, marcos de idolatria e exportação PNG com quebra de texto.
- Visual atual preservado, com foco visível, melhorias mobile, redução de movimento e mensagens que não cobrem ações.

## Verificação

- `npm run typecheck`: TypeScript estrito.
- `npm test`: 634 verificações do novo domínio, mais os testes de 33 regulamentos, pirâmides, permanência e seleção dos dez minijogos.
- `npm run build:local`: build de produção local.
- `scripts/browser-career.mjs`: carreira pela UI até aposentadoria, transferências, recarga durante evento, decisões contextuais e celebrações. Confirma também que a carreira não exibe seletor de dificuldade. Resultado detalhado em `docs/qa/browser-career.json`.
- Última execução: 26 temporadas, duas transferências, 28 decisões de finais, quatro vitórias, compra do psicólogo pela UI, recarga do save e exportação PNG. Sem erros de página.
- `scripts/browser-minigames.mjs`: dez jogos em 390×844 com toque, pausa, resultado e vitória do Código pelo teclado. Resultado em `qa/browser-minigames.json`.
- REA: captura mobile de criação, carta, treino e pausa em `research/evidence/qa-mobile-2026-10-26.json`.

## Limites e próximos passos

- Conta, ranking global, duelos e links públicos ficam para a segunda entrega. A prévia local não configura um serviço online.
- Regras esportivas são o modelo do jogo, não uma certificação de todos os regulamentos reais. Países com formatos especiais continuam sujeitos a expansão dos dados. Não foi copiada lógica interna da referência.
- O catálogo atual não contém ligas africanas ou oceânicas de clubes. O Super Mundial redistribui vagas disponíveis sem inventar clubes; a camada de cotas está pronta para receber esses pacotes fictícios/licenciados.
- Estatísticas antigas são reconstruídas somente a partir de temporadas registradas. Idolatria por passagem mostra o vínculo atual do clube, identificado como tal; saves antigos não contêm uma série histórica desse valor.
- Os 80 eventos são majoritariamente pequenos acontecimentos; parte compartilha o padrão de escolha entre convivência, preparação e exposição. Eventos de maior complexidade podem ampliar esse catálogo.
- O relógio dos minijogos usa tempo decorrido. As capturas mobile comprovam fluxo e ausência de rolagem horizontal nos cenários testados; não constituem benchmark de FPS em celulares físicos.
- Tentativas de minijogo ficam em armazenamento local complementar; exportar o save leva a etapa da final, mas não leva todos os checkpoints de execução do minijogo para outro dispositivo. O mesmo desafio é recriado pela semente.
- Exportação de imagem é local. O conjunto de clubes e assets existente no repositório foi mantido; novos pacotes licenciados devem passar pela camada de dados já separada.
- Futuro: desafio diário local, validação online de partidas, conta e duelos, mais eventos ramificados, revisão de balanceamento em sessões longas e pacotes de clubes.

## Fontes REA

O histórico de 20/10 está copiado em `research/evidence` como referência. A guia foi novamente capturada em 26/10 (`public-guide-2026-10-26.json`). A matriz `research/feature-ledger.md` separa descrição pública, execução observada e criação própria. Ghidra não se aplica ao alvo web entregue; nenhuma análise de binário foi alegada.
