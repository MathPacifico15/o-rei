import {chromium} from '../../work/o-rei-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
fs.mkdirSync('docs/qa',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1365,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
 await page.goto('http://127.0.0.1:4183/');
 await page.getByRole('button',{name:'COMEÇAR CARREIRA',exact:false}).click();
 await page.getByRole('button',{name:'ASSINAR PRIMEIRO CONTRATO',exact:false}).click();
 await page.locator('.training-card').first().click();
 let reloaded=false,finals=0,steps=0,finished=false,transfers=0,wonFinals=0,boughtPsychologist=false;
 for(;steps<450;steps++){
  if(await page.getByRole('heading',{name:'Seu nome fica na história'}).count()){finished=true;break;}
  if(await page.locator('.arena').count()){
   if(await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).count()){await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).click();finals++;continue;}
   if(await page.getByRole('button',{name:'COMEÇAR',exact:true}).count()){
    assert.equal(await page.locator('.arena select').count(),0,'career decisions do not expose a difficulty selector');
    await page.getByRole('button',{name:'COMEÇAR',exact:true}).click();
    if(await page.locator('.arena-track').count()){
      // Actual user input at the target, using the controlled test clock.
      await page.clock.fastForward(1400);await page.keyboard.press('Space');
      if((await page.locator('.arena-result').innerText()).includes('DECISÃO VENCIDA'))wonFinals++;
      continue;
    }
   }
   else if(await page.getByRole('button',{name:'RETOMAR',exact:true}).count())await page.getByRole('button',{name:'RETOMAR',exact:true}).first().click();
   await page.clock.fastForward(200000);await page.waitForTimeout(30);continue;
  }
  if(await page.locator('.celebration-close').count()){await page.locator('.celebration-close').click();continue;}
  if(!boughtPsychologist){
   const balance=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career'))?.career?.balance??0);
   if(balance>=480000){await page.getByRole('button',{name:'Abrir loja',exact:true}).click();await page.locator('.shop-item').filter({hasText:'Psicólogo esportivo'}).getByRole('button').click();await page.getByRole('button',{name:'Fechar ×',exact:true}).click();boughtPsychologist=true;continue;}
  }
  const event=page.locator('.inline-event:not(.season-summary):not(.market-inline) button');
  if(await event.count()){
    if(!reloaded){const before=await page.locator('.inline-event h3').first().innerText();await page.reload();await page.getByRole('button',{name:'CONTINUAR CARREIRA',exact:true}).click();assert.equal(await page.locator('.inline-event h3').first().innerText(),before);reloaded=true;}
    await event.first().click();continue;
  }
  if(await page.locator('.training-card').count()){await page.locator('.training-card').first().click();continue;}
  if(await page.locator('.market-inline').count()){
    if(transfers<2&&await page.locator('.inline-offers button').count()){await page.locator('.inline-offers button').first().click();transfers++;}
    else await page.locator('.market-renewal').click();continue;
  }
  if(await page.locator('.play-button').isEnabled()){await page.locator('.play-button').click();continue;}
  throw Error('Flow blocked at step '+steps+': '+(await page.locator('body').innerText()).slice(-1600));
 }
 assert.ok(finished,'Career must reach retirement');assert.equal(errors.length,0,errors.join('\n'));
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')));
 assert.equal(save.career.player.games,save.career.history.reduce((n,s)=>n+s.games,0));
 assert.equal(save.career.balance,save.career.financialLedger.reduce((n,e)=>n+e.amount,0),'balance matches audit ledger including finals');
 await page.screenshot({path:'docs/qa/retirement-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/qa/retirement-mobile.png',fullPage:true});
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'SALVAR IMAGEM DA CARREIRA'}).click();const download=await downloadPromise;await download.saveAs('docs/qa/exported-career.png');assert.ok(fs.statSync('docs/qa/exported-career.png').size>1000,'PNG exported');
 assert.ok(finals>0,'Exercise at least one career decision');
 const report={finished,steps,finals,wonFinals,transfers,seasons:save.career.history.length,age:save.career.player.age,reloaded,boughtPsychologist,exportedPng:true,errors};
 fs.writeFileSync('docs/qa/browser-career.json',JSON.stringify(report,null,2));console.log(report);
}catch(e){await page.screenshot({path:'docs/qa/flow-failure.png',fullPage:true});throw e}finally{await browser.close()}
