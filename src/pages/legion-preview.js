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

// Descriptions and roles come from data/enemies/units.js; times from the wave schedule.

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
 const timing=(schedule.boss?.unit===unit?'БОСС ЛОКАЦИИ · ':'')+waveTiming(schedule,unit),description=u.desc||'';
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
 const activity=['talk','shop','rest'].includes(motion);
 const duration=motion==='attack'||activity?1.8:motion==='hurt'?1.2:1.1;
 const progress=(phase%duration)/duration;
 let loaded=0,failed=0;
 for(const {unit,id,g,placement,wide}of previews){
  g.clearRect(0,0,g.canvas.width,g.canvas.height);g.imageSmoothingEnabled=false;
  const pose=activity&&unit!=='citizen'?'idle':motion;
  const art=UnitArt.get(unit,pose,progress)||AnimationArt.get(unit,0,pose,progress);
  if(!art){
  if(drawExpansion(g,{unit,x:140,y:196,action:motion==='attack'?{elapsed:progress,duration:1}:null,heading:reverse?Math.PI:0,moving:motion==='walk',walk:phase,hit:motion==='hurt'?1:0,crush:unit==='stoneSquad'&&motion==='attack'?Math.max(.01,.65-progress*.65):0})){loaded++;continue;}
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
