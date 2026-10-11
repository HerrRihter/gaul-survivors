import {unitDefinitions} from '../../data/enemies/units.js';
import {CharacterFrameManifest} from '../../data/animations/character-frames.js';
import {CharacterBounds} from '../../data/animations/character-bounds.js';
import {AnimationArt} from '../rendering/art/animation-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';
import {Village} from '../world/village/village.js';
import {fitCharacterPreview,drawCharacterPreview} from '../ui/character-preview.js';

const descriptions={roman:['С начала боя','Короткий удар мечом. Прерывается попаданием.'],spear:['С 0:25','Дальний выпад по зафиксированной линии. Уйди вбок во время замаха.'],pilum:['С 0:50','Держится на дистанции и метает пилум. Снаряд останавливается о дом.'],veteran:['С 1:25','Тяжёлый удар с долгой подготовкой; меньше отбрасывается.'],turtle:['С 1:40 · затем каждые 65 с','Шесть солдат как один строй. Щиты поглощают 65% урона спереди; обходи сбоку или сзади.'],ram:['С 2:35 · затем каждые 80 с','Отряд с тараном разгоняется по отмеченной полосе. Столкновение с домом останавливает разгон.'],boss:['С 3:50','Центурион завершает наступление. Победи его и продержись до пира.']};

const anchor=CharacterFrameManifest.anchor,previews=[];
for(const [unit,u]of Object.entries(unitDefinitions)){
 const card=document.createElement('article');card.className='card';
 const description=descriptions[unit]||['Новый отряд',''];
 card.innerHTML=`<canvas width="280" height="210" data-unit="${unit}" aria-label="${u.name}"></canvas><h2>${u.name}</h2><div class="stats">${u.hp} HP · ${u.damage} урона · ${u.xp} опыта</div><p style="color:#e5c480">${description[0]}</p><p>${description[1]}</p>`;
 document.getElementById('cards').append(card);
 const canvas=card.querySelector('canvas'),id=unit==='roman'?'roman-0':unit;
 const bounds=CharacterBounds[id]||{left:0,top:0,right:256,bottom:256};
 previews.push({unit,id,g:canvas.getContext('2d'),placement:fitCharacterPreview(bounds,anchor,canvas.width,canvas.height),wide:u.r>30});
}
let motion='walk',frozen=false,reverse=false,phase=0,lastTime=0;
document.getElementById('motion').onchange=e=>{motion=e.target.value;phase=0;};
document.getElementById('freeze').onclick=e=>{frozen=!frozen;e.target.textContent=frozen?'Продолжить анимацию':'Пауза анимации';};
document.getElementById('reverse').onchange=e=>{reverse=e.target.checked;};
function frame(t){
 const dt=Math.min(.05,(t-lastTime)/1000||0);lastTime=t;if(!frozen)phase+=dt;
 const duration=motion==='attack'?1.8:motion==='hurt'?1.2:1.1;
 const progress=(phase%duration)/duration;
 let loaded=0,failed=0;
 for(const {unit,id,g,placement,wide}of previews){
  g.clearRect(0,0,g.canvas.width,g.canvas.height);g.imageSmoothingEnabled=false;
  const art=UnitArt.get(unit,motion,progress)||AnimationArt.get(unit,0,motion,progress);
  if(!art){
   const missing=(UnitArt.status[id]||AnimationArt.status[id])==='fallback';if(missing)failed++;
   g.fillStyle='#b1c4a4';g.font='14px Consolas,monospace';g.textAlign='center';g.fillText(missing?'Кадры недоступны':'Загрузка…',g.canvas.width/2,g.canvas.height/2);continue;
  }
  loaded++;
  g.fillStyle='#172d2266';g.beginPath();g.ellipse(placement.x,placement.y+5,(wide?58:24)*placement.scale,5,0,0,Math.PI*2);g.fill();
  drawCharacterPreview(g,art,anchor,placement,reverse);
 }
 const label=loaded===previews.length?'Легион готов к бою':failed?'Не удалось загрузить '+failed+' отр.':('Загружено '+loaded+' / '+previews.length);
 const status=document.getElementById('artStatus');if(status.textContent!==label)status.textContent=label;
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function drawMap(){const g=document.getElementById('map').getContext('2d');g.setTransform(.25,0,0,.25,0,0);g.fillStyle='#344b34';g.fillRect(0,0,2200,2200);Village.draw(g);g.fillStyle='#f6cb72';g.beginPath();g.arc(1100,1100,22,0,Math.PI*2);g.fill();}setInterval(drawMap,500);drawMap();
