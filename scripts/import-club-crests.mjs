import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require(path.join(root, "node_modules", ".pnpm", "typescript@5.9.3", "node_modules", "typescript"));
const sourceRoot = path.join(root, ".tmp-escudos", "ESCUDOS");
const outputRoot = path.join(root, "public", "crests");
// These four clubs are listed in a national division in the game catalogue,
// while the supplied crest pack files them under their real state championship.
// Every fallback is explicit: no crest can ever be assigned by a loose match.
const explicitSourceByClub = {
  "bra-c-floresta": ["Campeonato Cearense", "Floresta.png"],
  "bra-c-ypiranga-rs": ["Campeonato Gaúcho", "Ypiranga-RS.png"],
  "bra-d-tuna-luso": ["Campeonato Paraense", "Tuna Luso.png"],
  "treze": ["Campeonato Paraibano", "Treze.png"],
};

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&/g, " e ").replace(/[^a-z0-9]+/g, " ").trim();
}

function loadTypeScriptModule(filePath, cache = new Map()) {
  const resolved = filePath.endsWith(".ts") ? filePath : `${filePath}.ts`;
  if (cache.has(resolved)) return cache.get(resolved);
  const source = fs.readFileSync(resolved, "utf8");
  const moduleRecord = { exports: {} };
  cache.set(resolved, moduleRecord.exports);
  const localRequire = (request) => request.startsWith(".")
    ? loadTypeScriptModule(path.resolve(path.dirname(resolved), request), cache)
    : require(request);
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { module: moduleRecord, exports: moduleRecord.exports, require: localRequire });
  cache.set(resolved, moduleRecord.exports);
  return moduleRecord.exports;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

if (!fs.existsSync(sourceRoot)) throw new Error("Escudos extraídos não encontrados.");
const { clubs, competitions } = loadTypeScriptModule(path.join(root, "game", "catalog.ts"));
const competitionByFolder = new Map(competitions.map((competition) => [normalize(competition.name), competition.id]));
const assetFiles = walk(sourceRoot).filter((file) => /\.(png|webp|jpg|jpeg)$/i.test(file));
const assetsByCompetition = new Map();
for (const file of assetFiles) {
  const relative = path.relative(sourceRoot, file).split(path.sep);
  if (relative.length < 2) continue;
  const competitionId = competitionByFolder.get(normalize(relative[0]));
  if (!competitionId) continue;
  const key = `${competitionId}:${normalize(path.basename(file, path.extname(file)))}`;
  if (assetsByCompetition.has(key)) throw new Error(`Escudo duplicado e ambíguo: ${key}`);
  assetsByCompetition.set(key, file);
}

fs.mkdirSync(outputRoot, { recursive: true });
const matched = [];
const missing = [];
for (const club of clubs) {
  const key = `${club.leagueId}:${normalize(club.name)}`;
  const explicit = explicitSourceByClub[club.id];
  const asset = explicit ? path.join(sourceRoot, ...explicit) : assetsByCompetition.get(key);
  if (!asset) { missing.push(`${club.leagueId} — ${club.name}`); continue; }
  const extension = path.extname(asset).toLowerCase();
  if (extension !== ".png") throw new Error(`Formato não suportado para ${club.name}: ${extension}`);
  const destination = path.join(outputRoot, `${club.crest}.png`);
  fs.copyFileSync(asset, destination);
  matched.push({ club, asset: path.relative(sourceRoot, asset) });
}

const report = [
  `Escudos importados: ${matched.length}/${clubs.length}`,
  `Sem correspondência exata: ${missing.length}`,
  ...missing,
].join("\n");
fs.writeFileSync(path.join(root, "CREST_IMPORT_REPORT.txt"), report, "utf8");
console.log(report);
if (missing.length) process.exitCode = 2;
