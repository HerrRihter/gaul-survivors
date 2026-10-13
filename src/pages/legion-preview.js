import {drawExpansion} from '../rendering/art/expansion-art.js';
import {unitDefinitions} from '../../data/enemies/units.js';
import {getWaveSchedule,waveRoster} from '../systems/wave-schedule.js';
import {waveTiming} from '../ui/wave-preview.js';
import {arenaDefinitions,createArenas} from '../world/arenas.js';
import {CharacterFrameManifest} from '../../data/animations/character-frames.js';
import {CharacterBounds} from '../../data/animations/character-bounds.js';
import {AnimationArt} from '../rendering/art/animation-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';
import {Village} from '../world/village/village.js';
import {fitCharacterPreview,drawCharacterPreview} from '../ui/character-preview.js';

const descriptions={
citizen:'Три облика: пекарь, носильщик и писец. Хаотично бегает, не атакует. При столкновении — 1 урон; не даёт опыта или добычи.',
auxiliary:'Пузатая городская стража с круглыми щитами. Длинный выпад копьём: уходи с линии замаха.',
merchant:'Не покидает прилавок. 650 HP; бросает яблоки, хлеб и кувшины. Прячься за домами.',
courtesan:'Подбирает опыт и еду, затем убегает. Избегает героя и не преследует его.',
boar:'Кабан предупреждает о рывке и несётся по прямой.',
stoneSquad:'Мощный разбег, затем камень падает на отряд. Отойди от зоны падения.',
netter:'Ждёт в засаде и бросает сеть. Стан на 1,25 с, затем защита от повторного стана.',
tower:'Медленная осадная башня со стрелками. Залп из трёх стрел.',
cavalry:'Пересекает карту и уходит. С 2:00 атаки учащаются и охватывают проезды по всему лагерю.',
caius:'Не атакует. Каждые 100 потерянных HP дают 1 опыт и 1 шлем.',
wine:'Оставляет винный след на 6 с. Отравление держится 2,5 с после выхода.',roman:'Короткий удар мечом. Прерывается попаданием.',spear:'Дальний выпад по зафиксированной линии. Уйди вбок во время замаха.',pilum:'Держится на дистанции и метает пилум. Снаряд останавливается о дом.',veteran:'Тяжёлый удар с долгой подготовкой; меньше отбрасывается.',turtle:'Шесть солдат как один строй. Щиты поглощают 65% урона спереди; обходи сбоку или сзади.',ram:'Отряд с тараном разгоняется по отмеченной полосе. Столкновение с домом останавливает разгон.',boss:'Центурион завершает наступление. Победи его и продержись до пира.'};

const anchor=CharacterFrameManifest.anchor,previews=[];
const arenas=createArenas(Village);
document.getElementById('locations').innerHTML=Object.entries(arenaDefinitions).map(([id,map])=>'<a href="#'+id+'">'+map.name+'</a>').join('');
let selectedMap='village';
function showLocation(){
 const requested=location.hash.slice(1);
 selectedMap=Object.hasOwn(arenaDefinitions,requested)?requested:'village';
 const arena=arenaDefinitions[selectedMap];
 document.title=arena.name+' · Разведданные легиона';
 document.getElementById('locationTitle').textContent=arena.name+' · Разведданные';
 document.getElementById('locationIntro').textContent=arena.description;
 document.getElementById('mapTitle').textContent='Карта: '+arena.name;
 document.getElementById('mapNotes').textContent=arena.notes;
 document.getElementById('map').setAttribute('aria-label','План локации: '+arena.name);
 for(const link of document.querySelectorAll('.locations a')){
  if(link.hash==='#'+selectedMap)link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
 }
 previews.length=0;
 document.getElementById('cards').replaceChildren();
 const schedule=getWaveSchedule(selectedMap),roster=waveRoster(schedule),units=roster.map(entry=>entry.unit);
 document.getElementById('rosterCount').textContent='Отряды в локации: '+units.length;
 for(const unit of units){
 const u=unitDefinitions[unit];
 const card=document.createElement('article');card.className='card';
 const timing=waveTiming(schedule,unit),description=descriptions[unit]||'';
 card.innerHTML=`<canvas width="280" height="210" data-unit="${unit}" aria-label="${u.name}"></canvas><h2>${u.name}</h2><div class="stats">${u.hp} HP · ${u.damage} урона · ${u.xp} опыта</div><p style="color:#e5c480">${timing}</p><p>${description}</p>`;
 document.getElementById('cards').append(card);
 const canvas=card.querySelector('canvas'),id=unit==='roman'?'roman-0':unit==='citizen'?'citizen-0':unit;
 const bounds=CharacterBounds[id]||{left:0,top:0,right:256,bottom:256};
 previews.push({unit,id,g:canvas.getContext('2d'),placement:fitCharacterPreview(bounds,anchor,canvas.width,canvas.height),wide:u.r>30});
 }
 drawMap();
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
  if(unit==='citizen'){
   const frames=[0,1,2].map(v=>UnitArt.get('citizen',motion,progress,v));
   if(frames.every(Boolean)){
    loaded++;
    frames.forEach((art,v)=>{
     const fit=fitCharacterPreview(CharacterBounds['citizen-'+v],anchor,g.canvas.width/3,g.canvas.height);
     fit.x+=v*g.canvas.width/3;
     drawCharacterPreview(g,art,anchor,fit,reverse);
    });
   }else if([0,1,2].some(v=>UnitArt.status['citizen-'+v]==='fallback'))failed++;
   continue;
  }
  const art=UnitArt.get(unit,motion,progress)||AnimationArt.get(unit,0,motion,progress);
  if(!art){
  if(drawExpansion(g,{unit,x:140,y:196,heading:reverse?Math.PI:0,moving:motion==='walk',walk:phase,hit:motion==='hurt'?1:0,crush:unit==='stoneSquad'&&motion==='attack'?Math.max(.01,.65-progress*.65):0})){continue;}
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
function drawMap(){const g=document.getElementById('map').getContext('2d');g.setTransform(.25,0,0,.25,0,0);g.fillStyle='#344b34';g.fillRect(0,0,2200,2200);arenas.get(selectedMap).draw(g);g.fillStyle='#f6cb72';g.beginPath();g.arc(1100,1100,22,0,Math.PI*2);g.fill();}
window.addEventListener('hashchange',showLocation);
showLocation();
setInterval(drawMap,500);
