import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.O_REI_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href):'playwright');
const out=process.env.O_REI_QA_OUTPUT??'outputs/games-features';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.O_REI_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
try{
 await page.clock.install({time:new Date('2026-10-28T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-28T12:00:01Z'));
 await page.goto(process.env.O_REI_QA_URL??'http://127.0.0.1:4183/');
 await page.getByRole('button',{name:'COMEÇAR CARREIRA',exact:false}).tap();await page.getByRole('button',{name:'Habilidade',exact:false}).tap();
 await page.getByRole('button',{name:'ASSINAR PRIMEIRO CONTRATO',exact:false}).tap();
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei-career')).career)).playStyle,'skill');
 const firstHand=await page.locator('.training-card').allTextContents();await page.getByRole('button',{name:'TROCAR AS 3 CARTAS',exact:true}).tap();
 assert.notDeepEqual(await page.locator('.training-card').allTextContents(),firstHand);assert.equal(await page.getByRole('button',{name:'TROCAR AS 3 CARTAS',exact:true}).isDisabled(),true);
 await page.locator('.training-card').first().tap();
 const names=['Código da prancheta','Copos embaralhados','Marca vermelha','Labirinto','Jogo da Velha','Pareamento rápido','Quebra-cabeça','Mapa de pressão','Zona de ouro','Rastrear a bola','Duelo com o goleiro','A escolha da chuteira','Passe entre linhas'];
 for(const name of names){
  await page.getByRole('button',{name:'TREINAR MINIJOGOS',exact:true}).tap();await page.locator('.training-game').filter({hasText:name}).tap();await page.locator('.arena select').selectOption('easy');await page.getByRole('button',{name:'COMEÇAR',exact:true}).tap();
  await page.getByRole('button',{name:'PAUSAR',exact:true}).tap();const before=await page.locator('.arena-toolbar b').innerText();await page.clock.fastForward(5000);assert.equal(await page.locator('.arena-toolbar b').innerText(),before,'pause '+name);await page.getByRole('button',{name:'RETOMAR',exact:true}).first().tap();
  if(name==='Código da prancheta'){
   for(let stage=0;stage<3;stage++){assert.equal(await page.locator('.arena-code').count(),0);await page.getByRole('button',{name:'REVELAR CÓDIGO',exact:true}).tap();const digits=await page.locator('.arena-code').innerText();assert.equal(new Set(digits).size,5);await page.clock.fastForward([2050,1350,850][stage]);await page.keyboard.press('9');await page.keyboard.press('Backspace');for(const digit of digits)await page.keyboard.press(digit);}
   assert.match(await page.locator('.arena-result').innerText(),/DECISÃO VENCIDA/);
  }else if(name==='Copos embaralhados'){
   const ball=page.locator('.arena-cups button').filter({hasText:'⚽'});const label=await ball.getAttribute('aria-label');await page.clock.fastForward(10000);await page.getByRole('button',{name:label,exact:true}).tap();assert.match(await page.locator('.arena-result').innerText(),/DECISÃO VENCIDA/);
  }else if(name==='Pareamento rápido'){
   const faces=await page.locator('.arena-grid button').allTextContents();await page.clock.fastForward(1100);const grouped=new Map();faces.forEach((face,i)=>{if(!grouped.has(face))grouped.set(face,[]);grouped.get(face).push(i);});for(const indices of grouped.values())for(const i of indices)await page.locator('.arena-grid button').nth(i).tap();assert.match(await page.locator('.arena-result').innerText(),/DECISÃO VENCIDA/);
  }else if(name==='Duelo com o goleiro'){
   await page.screenshot({path:`${out}/shot-mobile.png`,fullPage:true});await page.getByRole('button',{name:'Chutar esquerda',exact:true}).tap();await page.locator('.arena-result').waitFor();
  }else if(name==='A escolha da chuteira'){
   await page.getByRole('button',{name:'Chuteira 1',exact:true}).tap();await page.locator('.arena-monty-choices .revealed').waitFor();await page.screenshot({path:`${out}/monty-mobile.png`,fullPage:true});await page.getByRole('button',{name:'TROCAR DE CHUTEIRA',exact:true}).tap();await page.locator('.arena-result').waitFor();
  }else if(name==='Passe entre linhas'){
   for(let attempt=0;attempt<2;attempt++){await page.clock.fastForward(800);let found=false;for(let tick=0;tick<700;tick++){const hit=await page.locator('.arena-pass-pitch').evaluate(n=>{const w=n.querySelector('.arena-pass-window').getBoundingClientRect(),r=n.querySelector('.arena-pass-runner').getBoundingClientRect(),x=r.x+r.width/2;return x>w.x+2&&x<w.right-2;});if(hit){found=true;break;}await page.clock.fastForward(20);}assert.ok(found,'pass window reachable');if(attempt===0)await page.screenshot({path:`${out}/pass-mobile.png`,fullPage:true});await page.getByRole('button',{name:'SOLTAR PASSE · ESPAÇO',exact:true}).tap();}
   assert.match(await page.locator('.arena-result').innerText(),/DECISÃO VENCIDA/);
  }else await page.clock.fastForward(200000);
  await page.locator('.arena-result').waitFor();const result=await page.locator('.arena-result').innerText();await page.screenshot({path:`${out}/result-${results.length+1}.png`,fullPage:true});
  await page.getByRole('button',{name:'CONFIRMAR RESULTADO',exact:true}).tap();results.push({name,won:result.includes('DECISÃO VENCIDA')});
 }
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const log=await page.evaluate(()=>JSON.parse(localStorage.getItem('o-rei:minigame-log')));assert.equal(log.length,13);assert.ok(log.every(r=>typeof r.won==='boolean'&&Number.isFinite(r.elapsedMs)));
 const report={passed:true,mode:'mobile touch and keyboard',games:results,paused:true,cardRedraw:true,errors};fs.writeFileSync(`${out}/browser-games.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(e){await page.screenshot({path:`out/failure.png`.replace('out/',out+'/'),fullPage:true});throw e;}finally{await browser.close();}
