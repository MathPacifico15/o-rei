# Evolução de OVR

Carreiras novas usam `evolutionRulesVersion: 2`; saves anteriores sem esse campo mantêm o sistema original. O OVR continua sendo a média ponderada dos atributos da posição.

A carta anual mantém seus bônus. A evolução natural até os 30 considera nota e jogos da temporada, além dos títulos efetivamente registrados na temporada anterior; títulos internacionais e continentais pesam mais. O modo geracional recebe um ponto adicional e OVRs altos têm retornos naturais menores. Os parâmetros e o sorteio determinístico ficam em `applyCareerSeasonEvolution`, em `game/engine.ts`.

Aos 31 anos não há ganhos naturais, mas a carta ainda funciona. A partir dos 32, a carta e o declínio são aplicados juntos uma vez por temporada, com perdas graduais que aumentam com a idade e são suavizadas pelo físico. O OVR resultante não ultrapassa o valor anterior à carta. O resumo registra os ganhos, as perdas e o impacto de títulos anteriores.

Em carreiras novas, `initialClubId` e `renewalCount` registram as duas primeiras renovações do clube inicial. O salário proposto dobra, limitado ao teto do clube. Os demais contratos e os saves antigos seguem as regras usuais. Propostas antigas abertas não são alteradas.

A evolução natural foi acelerada em 45% abaixo de OVR 80 e 20% entre 80 e 84, sujeita aos limites por temporada; o crescimento acima de 85 continua mais difícil. Essa calibragem vale a partir da próxima temporada em carreiras com a regra 2. Saves antigos sem regra 2 mantêm a progressão anterior.
