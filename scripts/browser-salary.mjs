import {chromium} from '../../work/o-rei-qa/node_modules/playwright/index.mjs';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
const vite=await createServer({configFile:false,cacheDir:'node_modules/.vite-salary-test',server:{middlewareMode:true}});const {clubs}=await vite.ssrLoadModule('/game/catalog.ts');const salary=await vite.ssrLoadModule('/game/salary.ts');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto('http://127.0.0.1:4186/');await page.getByRole('button',{name:'COMEÇAR CARREIRA',exact:false}).click();await page.getByRole('button',{name:'ASSINAR PRIMEIRO CONTRATO',exact:false}).click();await page.locator('.training-card').first().click();await page.waitForTimeout(300);const base=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')));
 for(const ovr of [69,70,79,80,85,86,89,90,94,95,99]){
  const save=structuredClone(base);save.career.player.attributes=Object.fromEntries(Object.keys(save.career.player.attributes).map(k=>[k,ovr]));save.career.player.age=26;save.career.highestOvr=99;save.career.exitRequests=0;delete save.career.marketWindow;save.flow.upgradeReady=false;
  await page.evaluate(s=>localStorage.setItem('o-rei-career',JSON.stringify(s)),save);await page.reload();await page.getByRole('button',{name:'CONTINUAR CARREIRA',exact:true}).click();await page.getByRole('button',{name:/PEDIR SAÍDA/}).click();await page.getByRole('button',{name:'BUSCAR PROPOSTAS'}).click();await page.waitForTimeout(300);
  const current=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')));const offers=current.career.marketWindow.offers;assert.ok(offers.length>=5);for(const offer of offers){const club=clubs.find(c=>c.id===offer.clubId);assert.ok(offer.monthlySalary<=salary.effectiveSalaryBounds(current.career,club,ovr).maximum,`${ovr} ${club.name}`);assert.equal(offer.monthlySalary%1000,0);}assert.ok(await page.locator('.inline-offers article').count()>=5);
  await page.reload();await page.getByRole('button',{name:'CONTINUAR CARREIRA',exact:true}).click();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')).career.marketWindow.offers);assert.deepEqual(after,offers);console.log(`OVR ${ovr}: ${offers.length} ofertas respeitam tetos e persistem`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();await vite.close()}


