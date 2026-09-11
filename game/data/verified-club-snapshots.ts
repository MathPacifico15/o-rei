// Curated from the competition organisers' public participant tables.
// A row is added only when its full edition roster is verified; no placeholders.
export const verifiedClubSnapshots = [
  {
    competitionId: "sui-a", country: "Suíça",
    clubs: ["Basel", "Grasshopper Club Zürich", "Lausanne-Sport", "Lugano", "Luzern", "Servette", "Sion", "St. Gallen", "Thun", "Young Boys", "Zürich", "Vaduz"],
    source: "https://de.wikipedia.org/wiki/Super_League_2026/27_(Schweiz)",
  },
  {
    competitionId: "per-b", country: "Peru",
    clubs: ["Academia Cantolao", "ADA Jaén", "Alianza Universidad", "Ayacucho FC", "Bentín Tacna Heroica", "Carlos A. Mannucci", "Comerciantes FC", "Deportivo Binacional", "Deportivo Llacuabamba", "Estudiantil CNI", "Pirata FC", "San Marcos", "Santos FC", "Sport Huancayo", "UCV", "Unión Comercio", "Unión Minas", "USMP"],
    source: "https://liga2.pe/clubes/",
  },
  {
    competitionId: "pol-a", country: "Polônia",
    clubs: ["Lech Poznań", "Legia Warszawa", "Górnik Zabrze", "Jagiellonia Białystok", "Wisła Kraków", "Piast Gliwice", "GKS Katowice", "Pogoń Szczecin", "Korona Kielce", "Zagłębie Lubin", "Cracovia", "Radomiak Radom", "Widzew Łódź", "Śląsk Wrocław", "Motor Lublin", "Wisła Płock", "Wieczysta Kraków", "Raków Częstochowa"],
    source: "https://ekstraklasa.org/en/standings/2026-2027/",
  },
  {
    competitionId: "irl-a", country: "Irlanda",
    clubs: ["Bohemian FC", "Derry City", "Drogheda United", "Dundalk", "Galway United", "Shamrock Rovers", "Shelbourne", "Sligo Rovers", "St Patrick's Athletic", "Waterford"],
    source: "https://en.wikipedia.org/wiki/2026_League_of_Ireland_Premier_Division",
  },
  {
    competitionId: "cro-a", country: "Croácia",
    clubs: ["Dinamo Zagreb", "Gorica", "Hajduk Split", "Rijeka", "Istra 1961", "Lokomotiva Zagreb", "Osijek", "Rudeš", "Slaven Belupo", "Varaždin"],
    source: "https://semafor.hns.family/en/competitions/114137140/supersport-hrvatska-nogometna-liga-20262027/details/",
  },
] as const;
