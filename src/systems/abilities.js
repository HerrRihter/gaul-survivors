import {abilityDefinitions,abilityRank,abilityUpgradeMax} from '../../data/characters/abilities.js';
export const AbilitySystem={create(c){
 const active=id=>c.state?.abilities?.some(a=>a.id===id&&a.left>0&&c.state.t<a.endsAt);
 const slot=id=>c.state.abilities.find(a=>a.id===id);
 const ranked=(a,base)=>base*(1+(a.rankDamage||0)*a.castRank);
 const protectedMove=()=>active('dash')||active('jump');
 const blocksAttack=()=>protectedMove()||active('spin');
 function effectiveStats(){const s=c.state;if(!active('potion')&&!active('spin')&&!active('concert'))return s.stats;const st={...s.stats};if(active('potion')){const a=slot('potion'),push=c.Villagers.defs[c.selected].attack.push;st.haste*=a.haste;st.speed*=a.speed;st.punchForce=((st.punchForce||0)+push)*a.pushBoost-push;}if(active('spin'))st.speed*=slot('spin').speed;if(active('concert')){const a=s.abilities.find(a=>a.id==='concert');st.musicRange=(1+(st.musicRange||0))*(a.radiusMultiplier+a.radiusPerRank*a.castRank)-1;}return st;}
 function init(){c.state.abilities=abilityDefinitions[c.selected].map(d=>({...d,cd:0,left:0}));c.state.abilityZones=[];}
 function control(e,slow=0,stun=0){const heavy=e.boss||!!c.Legion.units[e.unit]?.heavy;e.abilitySlow=Math.max(e.abilitySlow||0,heavy?Math.min(.15,slow):slow);e.slowUntil=c.state.t+.8;if(stun&&!heavy){e.abilityStun=Math.max(e.abilityStun||0,stun);e.action=null;e.charge=null;}}
 function area(origin,r,damage,push=0,slow=0,stun=0,seen=null){for(const e of c.state.enemies){const dx=e.x-origin.x,dy=e.y-origin.y,d=Math.hypot(dx,dy);if(e.hp<=0||d>=r+e.r||seen?.has(e)||!c.Village.clear(origin,e,2))continue;seen?.add(e);c.damage(e,damage,dx/Math.max(1,d)*push,dy/Math.max(1,d)*push,origin);if(e.hp>0&&(slow||stun))control(e,slow,stun);}}
 function ring(p,r){c.state.fx.push({kind:'ring',x:p.x,y:p.y,r,life:.4,max:.4});}
 function activate(slot){if(c.mode!=='play'||!c.state||c.state.p.hp<=0||c.state.p.stun>0)return false;const s=c.state,a=s.abilities[slot],p=s.p,st=effectiveStats();if(!a||a.cd>0||a.left>0)return false;
  if(a.grantsArmorRank){if(!c.Progression.grantArmorRank())return false;s.stats.armor++;}
  if(a.id==='dash'){const probe={x:p.x,y:p.y};c.Village.move(probe,p.facing.x*6,p.facing.y*6,14);if(Math.hypot(probe.x-p.x,probe.y-p.y)<.01)return false;}
  a.castRank=abilityRank(s,a.id);a.cd=Math.max(0,a.cooldown-(a.cooldownPerRank||0)*a.castRank);a.left=a.duration+(a.rankDuration||0)*a.castRank;a.endsAt=s.t+a.left;a.elapsed=0;a.tick=0;a.direction={...p.facing};a.hit=new Set();
  if(a.id==='dash'||a.id==='jump'){p.action=null;a.start={x:p.x,y:p.y};}
  if(a.id==='spin')p.action=null;
  if(a.id==='note'){area(p,a.radius*st.range,ranked(a,a.damage*st.damage),a.push,0,a.stun+a.rankStun*a.castRank);ring(p,a.radius*st.range);}
  if(a.id==='volley')c.Villagers.fish(s,p.facing,{count:a.count+a.rankCount*a.castRank+(st.fishCount||0),spread:Math.PI*a.spread/180,damage:a.damage});
  if(a.id==='cloud'||a.id==='brew'){const q={x:p.x,y:p.y};if(a.id==='brew')for(let i=0;i<a.distance/6;i++)c.Village.move(q,p.facing.x*6,p.facing.y*6,14);const brew=a.id==='brew';a.left=a.duration+(brew?(st.poisonDuration||0):0);a.endsAt=s.t+a.left;s.abilityZones.push({...q,kind:a.id,r:(brew?a.radius*(1+(st.poisonRange||0)):a.radius)*st.range*(1+a.rankRadius*a.castRank),left:a.left,tick:0,period:a.period,slow:a.slow||0,damage:ranked(a,(brew?a.damage*(1+(st.poisonDamage||0)):a.damage)*st.damage)});}
  if(a.id==='elixir')p.poisoned=0;
  c.Progression?.recordAbility?.();
  c.soundEffect('magic');hud();return true;
 }
 function update(dt){const s=c.state,p=s.p;for(const e of s.enemies){e.abilityStun=Math.max(0,(e.abilityStun||0)-dt);if(s.t>=(e.slowUntil||0))e.abilitySlow=0;}
  for(const a of s.abilities){a.cd=Math.max(0,a.cd-dt);if(a.left<=0)continue;const step=Math.min(dt,a.left),st=effectiveStats();a.elapsed+=step;a.left=Math.max(0,a.left-step);if(a.left<1e-9)a.left=0;
   if(a.id==='dash'||a.id==='jump'){const distance=a.distance,n=Math.max(1,Math.ceil(distance*step/a.duration/6));if(p.stun>0)a.left=0;else for(let i=0;i<n;i++){c.Village.move(p,a.direction.x*distance*step/a.duration/n,a.direction.y*distance*step/a.duration/n,14);if(a.id==='dash')area(p,a.radius*st.range,ranked(a,a.damage*st.damage),a.push,0,0,a.hit);}p.jumpHeight=a.id==='jump'&&a.left>0?Math.sin(a.elapsed/a.duration*Math.PI)*a.height:0;if(a.id==='jump'&&a.left===0){area(p,a.radius*st.range,ranked(a,a.damage*st.damage),a.push);ring(p,a.radius*st.range);}}
   if(a.id==='spin'){if(p.stun>0){a.left=0;continue;}a.tick+=step;while(a.tick>=a.period-1e-9){a.tick-=a.period;area(p,(a.radius+(st.hammerReach||0))*st.range,ranked(a,a.damage*st.damage*(1+(st.hammerDamage||0))),a.push+(st.hammerForce||0)*.25);ring(p,(a.radius+(st.hammerReach||0))*st.range);}}
   if(a.id==='elixir'&&p.hp>0){p.hp=Math.min(p.max,p.hp+(a.healPerSecond+a.rankHeal*a.castRank)*step);p.poisoned=0;}
  }
  for(const q of s.abilityZones){const step=Math.min(dt,q.left);q.left-=step;if(q.left<1e-9)q.left=0;q.tick+=step;while(q.tick>=q.period-1e-9){q.tick-=q.period;area(q,q.r,q.damage,0,q.slow);}}s.abilityZones=s.abilityZones.filter(q=>q.left>0);
 }
 function onKill(){if(active('appetite')&&c.state.p.hp>0){const a=slot('appetite');c.state.p.hp=Math.min(c.state.p.max,c.state.p.hp+a.heal+a.rankHeal*(a.castRank||0));}}

 // Avoid recreating text nodes and invalidating layout on every animation frame.
 let controls=null,buttons=null;
 function hud(){
  const s=c.state,visible=!!s&&c.mode==='play';
  controls??=c.$('abilities');
  if(controls.classList.contains('hidden')===visible)controls.classList.toggle('hidden',!visible);
  if(!s?.abilities)return;
  buttons??=[c.$('ability0'),c.$('ability1')];
  for(let i=0;i<2;i++){
   const a=s.abilities[i],b=buttons[i];
   const max=a.grantsArmorRank&&c.Progression.armorRank>=c.Progression.upgrades.armor.max;
   const text=`${i?'E':'Q'} · ${a.name} · ${abilityRank(s,a.id)}/${abilityUpgradeMax}\n${max?'Максимум':a.left>0?'Активно '+a.left.toFixed(1)+' с':a.cd>0?Math.ceil(a.cd)+' с':'Готово'}`;
   const disabled=c.mode!=='play'||a.cd>0||a.left>0||max||s.p.stun>0;
   if(b.textContent!==text)b.textContent=text;
   // Keep the touch face compact while preserving the full keyboard label.
   const status=max?'Максимум':a.left>0?'Активно':a.cd>0?Math.ceil(a.cd)+' с':'Готово';
   if(b.dataset.name!==a.name)b.dataset.name=a.name;
   if(b.dataset.status!==status)b.dataset.status=status;
   b.setAttribute?.('aria-label',`${a.name}: ${status}`);
   const title=a.description+' Улучшение: '+a.upgrade;
   if(b.title!==title)b.title=title;
   if(b.disabled!==disabled)b.disabled=disabled;
  }
 }

 function draw(g){const s=c.state;if(!s)return;for(const q of s.abilityZones){g.fillStyle=q.kind==='cloud'?'#a3a65855':'#71da6555';g.beginPath();g.arc(q.x,q.y,q.r,0,Math.PI*2);g.fill();}for(const a of s.abilities)if(a.left>0&&!['cloud','brew','dash','jump'].includes(a.id)){g.strokeStyle=a.id==='appetite'?'#ed856d':'#ebdc81';g.lineWidth=3;g.beginPath();g.arc(s.p.x,s.p.y,32,0,Math.PI*2);g.stroke();if(a.id==='spin'){const angle=a.elapsed*15;g.save();g.translate(s.p.x,s.p.y);g.rotate(angle);g.fillStyle='#b19b74';g.fillRect(0,-3,70,6);g.fillStyle='#c8d2d8';g.fillRect(60,-13,22,26);g.restore();}}}
 return {init,activate,update,active,protectedMove,blocksAttack,effectiveStats,onKill,control,hud,draw};
}};
