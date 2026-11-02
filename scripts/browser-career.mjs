import {chromium} from '../../work/o-rei-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const outputDir=process.env.O_REI_QA_OUTPUT??'outputs/browser-career';
fs.mkdirSync(outputDir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1365,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.clock.install({time:new Date('2026-10-26T12:00:00Z')});
 await page.goto('http://127.0.0.1:4183/');
 await page.getByRole('button',{name:'COMEÇAR CARREIRA',exact:false}).click();
 await page.getByRole('button',{name:'ASSINAR PRIMEIRO CONTRATO',exact:false}).click();
 await page.locator('.training-card').first().click();
 let reloaded=false,minigameInteractions=0,steps=0,finished=false,transfers=0,boughtPsychologist=false;
 for(;steps<450;steps++){
  if(steps%10===0)console.log('Etapa',steps,'temporadas',await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')??'{}')?.career?.history?.length??0));
  if(await page.getByRole('heading',{name:'Seu nome fica na história'}).count()){finished=true;break;}
  if(await page.locator('.arena').count()){
   console.log('Desafio:',await page.locator('.arena h2').innerText());
   if(await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).count()){await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).click();continue;}
   if(await page.getByRole('button',{name:'COMEÇAR',exact:true}).count()){
    assert.equal(await page.locator('.arena select').count(),0,'career decisions do not expose a difficulty selector');
    await page.getByRole('button',{name:'COMEÇAR',exact:true}).click();
   }
   else if(await page.getByRole('button',{name:'RETOMAR',exact:true}).count())await page.getByRole('button',{name:'RETOMAR',exact:true}).first().click();
   if(await page.getByRole('button',{name:'REVELAR CÓDIGO',exact:true}).count())await page.getByRole('button',{name:'REVELAR CÓDIGO',exact:true}).click();
   if(await page.locator('.arena-track').count()) await page.getByRole('button',{name:/PARAR/}).click();
   else if(await page.locator('.arena-shot-options').count()) await page.getByRole('button',{name:'Chutar esquerda'}).click();
   else if(await page.locator('.arena-monty-choices').count()) {
    if(await page.getByRole('button',{name:'FICAR COM A MINHA'}).count())await page.getByRole('button',{name:'FICAR COM A MINHA'}).click();
    else await page.getByRole('button',{name:'Chuteira 1',exact:true}).click();
   } else if(await page.locator('.arena-pass').count()) { await page.clock.runFor(1000);await page.getByRole('button',{name:/SOLTAR PASSE/}).click(); }
   else if(await page.locator('.arena-code').count()){await page.clock.runFor(2500);for(const digit of '11111')await page.keyboard.press(digit);}
   else if(await page.locator('.arena-cups').count()){await page.clock.runFor(6000);await page.locator('.arena-cups button').first().click();}
   else if(await page.locator('.arena-maze, .arena-pressure, .arena-track-players').count()){
    await page.clock.runFor(18000);await page.locator('.arena-grid button:not(:disabled)').first().click();
   } else if(await page.locator('.arena-ttt').count()) {const cell=page.locator('.arena-ttt button:not(:disabled)').first();if(await cell.count())await cell.click();}
   else if(await page.locator('.arena-pairs').count()) {await page.clock.runFor(2000);const cells=page.locator('.arena-pairs button:not(:disabled)');if(await cells.count()>1){await cells.nth(0).click();await cells.nth(1).click();await page.clock.runFor(1100);}}
   else if(await page.locator('.arena-puzzle').count()) {
    const cells=await page.locator('.arena-puzzle button').allTextContents();
    const start=cells.map(value=>value==='◇'?'0':value.trim()).join(''), target='123456780';
    const queue=[start], previous=new Map([[start,null]]);let head=0;
    while(head<queue.length&&!previous.has(target)) {
     const current=queue[head++],empty=current.indexOf('0');
     for(const next of [empty-3,empty+3,empty-1,empty+1]) {
      if(next<0||next>8||!(Math.abs(empty-next)===3||Math.floor(empty/3)===Math.floor(next/3)))continue;
      const copy=[...current];[copy[empty],copy[next]]=[copy[next],copy[empty]];const key=copy.join('');
      if(!previous.has(key)){previous.set(key,{from:current,move:next});queue.push(key);}
     }
    }
    assert.ok(previous.has(target),'quebra-cabeça solucionável');const moves=[];
    for(let key=target;key!==start;){const step=previous.get(key);moves.push(step.move);key=step.from;}
    for(const move of moves.reverse())await page.locator('.arena-puzzle button').nth(move).click();
   } else await page.clock.runFor(160000);
   await page.clock.runFor(1000);minigameInteractions++;continue;
  }
  if(await page.locator('.celebration-close').count()){await page.locator('.celebration-close').click();continue;}
  if(!boughtPsychologist){
   const balance=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career'))?.career?.balance??0);
   if(balance>=3840000){await page.getByRole('button',{name:'Abrir loja',exact:true}).click();await page.locator('.shop-item').filter({hasText:'Psicólogo esportivo'}).getByRole('button').click();await page.getByRole('button',{name:'Fechar ×',exact:true}).click();boughtPsychologist=true;continue;}
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
 await page.screenshot({path:`${outputDir}/retirement-desktop.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${outputDir}/retirement-mobile.png`,fullPage:true});
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'SALVAR IMAGEM DA CARREIRA'}).click();const download=await downloadPromise;await download.saveAs(`${outputDir}/exported-career.png`);assert.ok(fs.statSync(`${outputDir}/exported-career.png`).size>1000,'PNG exported');
 assert.ok(minigameInteractions>0,'Exercise at least one career decision');
 const report={finished,steps,minigameInteractions,transfers,seasons:save.career.history.length,age:save.career.player.age,reloaded,boughtPsychologist,exportedPng:true,errors};
 fs.writeFileSync(`${outputDir}/browser-career.json`,JSON.stringify(report,null,2));console.log(report);
}catch(e){await page.screenshot({path:`${outputDir}/flow-failure.png`,fullPage:true});throw e}finally{await browser.close()}
