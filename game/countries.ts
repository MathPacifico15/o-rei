export interface CountryOption { code: string; name: string; flag: string; }

// 193 Estados-membros da ONU + Palestina e Vaticano.
const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW PS VA`.split(" ");
const names = new Intl.DisplayNames(["pt-BR"], { type: "region" });

function flagFromCode(code: string) {
  return String.fromCodePoint(...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}

export const countries: CountryOption[] = countryCodes
  .map((code) => ({ code, name: names.of(code) ?? code, flag: flagFromCode(code) }))
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export const defaultNationality = countries.find((country) => country.code === "BR")!;
