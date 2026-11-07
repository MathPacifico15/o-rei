# Salários do O REI

Os valores em `game/salary.ts` são mensais em dólares e configuráveis. `LEAGUE_SALARY_CAPS` define o teto de cada liga. Uma liga nova usa provisoriamente US$ 250 mil até receber configuração própria.

O piso varia por país e divisão. Clubes sem classificação financeira revisada usam um teto provisório de 55% do limite da liga; isso evita usar como medida financeira o orçamento inicial gerado pela posição em uma lista. Exceções explícitas incluem os tetos do Brasileirão A, os quatro clubes sauditas mais ricos, gigantes europeus e alguns grandes da Argentina, Grécia e Turquia. Identifique um clube por país/liga e nome, nunca pelo nome isolado globalmente.

O orçamento evolutivo da carreira pode ajustar o teto provisório entre 80% e 120% de sua base, respeitando o teto absoluto da liga e os limites individuais. OVR, idade, nota recente e papel definem a proposta dentro dos limites; empresário e academia podem valorizá-la sem ultrapassar o teto. Os valores são arredondados para milhares.

Contratos antigos e ofertas já apresentadas permanecem válidos. Aumento por negociação é bloqueado quando uma oferta existente já atinge ou excede o teto. Novas renovações, ofertas e contratos iniciais seguem as regras atuais. A loja aplica duas vezes os preços anteriormente praticados, sem alterar compras passadas.

## Teto pelo OVR atual

Novas ofertas, empréstimos, renovações e contrapropostas usam o menor teto entre o clube e o atleta. Salários existentes não são reduzidos. Ofertas antigas continuam aceitas no valor original; propostas acima do limite atual não recebem aumento em negociação. O OVR usado é o atual, inclusive após envelhecimento.

| OVR | Outros países (US$/mês) | Arábia Saudita (US$/mês) |
| --- | ---: | ---: |
| Até 69 | 100.000 | 200.000 |
| 70–79 | 250.000 | 500.000 |
| 80–85 | 600.000 | 1.200.000 |
| 86–89 | 1.000.000 | 2.000.000 |
| 90–94 | 2.000.000 | 4.000.000 |
| 95–99 | 5.000.000 | 5.000.000 |

Propostas sauditas recebem multiplicador 1,5 antes dos limites, sem garantia de superar clubes de outros países. Bônus também são aplicados antes dos tetos. Nas carreiras novas, as duas primeiras renovações aceitas no clube inicial tentam dobrar o salário, respeitando ambos os limites; saves antigos mantêm a regra anterior de evolução e renovação, mas novas ofertas respeitam os tetos atuais.

A variação aleatória das novas propostas é aplicada depois de considerar o teto disponível, produzindo valores variados em milhares mesmo quando vários clubes chegam perto do limite. Propostas existentes e as regras de renovação não são alteradas retroativamente.
