import {chromium} from '../../work/o-rei-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});await page.goto('http://127.0.0.1:4183/');
 await page.getByRole('button',{name:'COMEÇAR CARREIRA',exact:false}).tap();await page.getByRole('button',{name:'ASSINAR PRIMEIRO CONTRATO',exact:false}).tap();await page.locator('.training-card').first().tap();
 const names=['Código da prancheta','Copos embaralhados','Marca vermelha','Labirinto','Jogo da Velha','Pareamento rápido','Quebra-cabeça','Mapa de pressão','Zona de ouro','Rastrear a bola'];
 for(const name of names){
  await page.getByRole('button',{name:'TREINAR MINIJOGOS',exact:true}).tap();await page.getByRole('button',{name,exact:true}).tap();await page.locator('.arena select').selectOption('easy');await page.getByRole('button',{name:'COMEÇAR',exact:true}).tap();
  await page.getByRole('button',{name:'PAUSAR',exact:true}).tap();const before=await page.locator('.arena-toolbar b').innerText();await page.clock.fastForward(5000);assert.equal(await page.locator('.arena-toolbar b').innerText(),before,'pause '+name);await page.getByRole('button',{name:'RETOMAR',exact:true}).first().tap();
  if(name==='Código da prancheta'){
   for(let round=0;round<3;round++){const code=await page.locator('.arena-code').innerText();await page.clock.fastForward(4500);for(const digit of code)await page.keyboard.press(digit);await page.waitForTimeout(20);}
   assert.match(await page.locator('.arena-result').innerText(),/DECISÃO VENCIDA/);
  }else{
   if(name==='Marca vermelha'){await page.clock.fastForward(300);await page.screenshot({path:'docs/qa/minigame-mobile.png',fullPage:true});}
   await page.clock.fastForward(200000);await page.waitForTimeout(20);
  }
  await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).tap();
 }
 const log=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei:minigame-log')));assert.equal(log.length,10);assert.ok(log.every(r=>typeof r.won==='boolean'&&!('score' in r)));assert.equal(errors.length,0,errors.join('\n'));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);assert.equal(overflow,false,'mobile horizontal overflow');
 fs.writeFileSync('docs/qa/browser-minigames.json',JSON.stringify({games:10,pause:'passed',keyboardCode:'won',touch:'passed',overflow,errors},null,2));console.log('10 minigames: touch, pause, result, keyboard code and mobile layout passed.');
}catch(e){await page.screenshot({path:'docs/qa/minigame-failure.png',fullPage:true});throw e}finally{await browser.close()}
