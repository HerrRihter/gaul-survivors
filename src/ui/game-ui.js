export let GameUI;
'use strict';
GameUI={create(sessionContext){
function animateMenu(now){
      const phase=sessionContext.Math.floor(now/190)%8;
      if(phase===sessionContext.menuPortraitPhase)return;
      sessionContext.menuPortraitPhase=phase;
      sessionContext.document.querySelectorAll('[data-portrait]').forEach(c=>sessionContext.fitPortrait(c,c.dataset.portrait,phase));
    }
function show(id,on){
      sessionContext.$(id).classList.toggle('hidden',!on);
    }
function toast(text){
      sessionContext.$('toast').textContent=text;
      sessionContext.$('toast').style.opacity=1;
      sessionContext.toastLeft=3;
    }
function updateRecord(){
      sessionContext.$('wallet').textContent='ШЛЕМЫ: '+sessionContext.Progression.data.helmets;
      sessionContext.$('record').textContent=sessionContext.best.kills?`РЕКОРД: ${sessionContext.best.kills} врагов · ${sessionContext.clock(sessionContext.best.time)}`:'Легион ещё не знает, что его ждёт.';
    }
function updateRunHeroStats(){
      const hero=sessionContext.Villagers.defs[sessionContext.pendingRunHero];
      sessionContext.$('runHeroStats').textContent=hero.desc||`Здоровье: ${hero.hp} · Скорость: ${hero.speed}`;
    }
function renderRunHeroes(){
      const list=sessionContext.$('runHeroes'),heroes=Object.keys(sessionContext.Villagers.defs).filter(id=>sessionContext.Progression.owned(id));
      if(!heroes.length)throw new Error('Нет доступных героев для нового забега');
      list.replaceChildren();
      sessionContext.pendingRunHero=heroes.includes(sessionContext.selected)?sessionContext.selected:heroes[0];
      for(const id of heroes){
        const hero=sessionContext.Villagers.defs[id],button=sessionContext.document.createElement('button'),portrait=sessionContext.document.createElement('canvas'),copy=sessionContext.document.createElement('span'),name=sessionContext.document.createElement('strong'),weapon=sessionContext.document.createElement('small');
        button.type='button';
        button.className=`run-hero${id===sessionContext.pendingRunHero?' selected':''}`;
        button.dataset.hero=id;
        portrait.width=64;
        portrait.height=80;
        portrait.dataset.portrait=id;
        copy.className='run-hero-copy';
        name.textContent=hero.name;
        weapon.textContent=hero.weapon;
        copy.append(name,weapon);
        button.append(portrait,copy);
        button.onclick=()=>{
          sessionContext.pendingRunHero=id;
          list.querySelectorAll('.run-hero').forEach(card=>card.classList.toggle('selected',card.dataset.hero===id));
          updateRunHeroStats();
        };
        list.append(button);
      }
      updateRunHeroStats();
      sessionContext.menuPortraitPhase=-1;
      animateMenu(sessionContext.performance.now());
    }
function openRunHeroSelect(){
      renderRunHeroes();
      show('shop',false);
      show('menu',false);
      show('runHeroSelect',true);
    }
function renderShop(){
      updateRecord();
      const root=sessionContext.$('shopHeroes');
      root.replaceChildren();
      for(const [id,hero] of Object.entries(sessionContext.Villagers.defs)){
        const card=sessionContext.document.createElement('div');
        card.className='shopcard';
        const art=sessionContext.document.createElement('canvas');
        art.width=96;
        art.height=96;
        art.dataset.portrait=id;
        sessionContext.fitPortrait(art,id);
        card.append(art);
        const title=sessionContext.document.createElement('h3');
        title.textContent=hero.name;
        card.append(title);
        const desc=sessionContext.document.createElement('p');
        desc.textContent=hero.desc||(id==='asterix'?'Быстрый кулак: 25 урона, сектор 90°.':'Метает менгиры: 52 урона.');
        card.append(desc);
        const info=sessionContext.document.createElement('small');
        info.textContent=hero.hp+' HP · скорость '+hero.speed;
        card.append(info);
        const button=sessionContext.document.createElement('button'),owned=sessionContext.Progression.owned(id);
        button.className='small';
        button.textContent=owned?'Доступен для забега':'Купить · '+sessionContext.Progression.prices[id]+' шлемов';
        button.disabled=owned||sessionContext.Progression.data.helmets<sessionContext.Progression.prices[id];
        button.onclick=()=>{
          if(!sessionContext.Progression.owned(id)&&sessionContext.Progression.buyHero(id))renderShop();
        };
        card.append(button);
        root.append(card);
      }
      sessionContext.$('shopUpgrades').replaceChildren();
      let shopGroup='';
      for(const [id,u] of Object.entries(sessionContext.Progression.upgrades)){
        const group=u.hero?'Личные усиления':'Общие усиления';
        if(group!==shopGroup){
          const title=sessionContext.document.createElement('h4');
          title.textContent=group;
          sessionContext.$('shopUpgrades').append(title);
          shopGroup=group;
        }
        const level=sessionContext.Progression.data.levels[id],b=sessionContext.document.createElement('button');
        b.className='small';
        b.textContent=(u.hero?sessionContext.Villagers.defs[u.hero].name+' · ':'')+u.name+' '+level+'/'+u.max+' · '+u.desc+' · '+(level>=u.max?'Максимум':sessionContext.Progression.cost(id)+' шлемов');
        b.disabled=(u.hero&&!sessionContext.Progression.owned(u.hero))||level>=u.max||sessionContext.Progression.data.helmets<sessionContext.Progression.cost(id);
        if(u.hero&&!sessionContext.Progression.owned(u.hero))b.textContent+=' · Сначала открой героя';
        b.onclick=()=>{
          if(sessionContext.Progression.buyUpgrade(id))renderShop();
        };
        sessionContext.$('shopUpgrades').append(b);
      }
      sessionContext.$('shopWallet').textContent='У вас '+sessionContext.Progression.data.helmets+' шлемов · до следующей награды: '+(10-sessionContext.Progression.data.kills%10)+' убийств'+(sessionContext.Progression.persistent?'':' · Не удалось сохранить прогресс. Не закрывай игру.');
    }
function closeShop(){
      show('shop',false);
      show('menu',true);
    }
let elHealth=null,elXp=null,elLevel=null,elTime=null,elKills=null,elWeapon=null,elHelmets=null,elBosshealth=null;
let lastHp=-1,lastMax=-1,lastXp=-1,lastNeed=-1,lastLevel=-1,lastTime=-1,lastKills=-1,lastWeaponKey='',lastHelmets=-1,lastEarned=-1,lastBossActive=null,lastBossHpPct=-1;
function hud(){
      if(!sessionContext.state)return;
      const s=sessionContext.state;
      elHealth??=sessionContext.$('health');
      elXp??=sessionContext.$('xp');
      elLevel??=sessionContext.$('levelText');
      elTime??=sessionContext.$('time');
      elKills??=sessionContext.$('kills');
      elWeapon??=sessionContext.$('weapon');
      elHelmets??=sessionContext.$('helmets');
      elBosshealth??=sessionContext.$('bosshealth');

      const hp=s.p.hp,max=s.p.max;
      if(hp!==lastHp||max!==lastMax||s.level!==lastLevel){
        lastHp=hp;lastMax=max;lastLevel=s.level;
        elHealth.style.width=`${hp/max*100}%`;
        elLevel.textContent=`УР. ${s.level}  ·  ${sessionContext.Math.ceil(hp)} / ${max} HP`;
      }
      if(s.xp!==lastXp||s.need!==lastNeed){
        lastXp=s.xp;lastNeed=s.need;
        elXp.style.width=`${sessionContext.Math.min(100,s.xp/s.need*100)}%`;
      }
      const sec=sessionContext.Math.floor(s.t);
      if(sec!==lastTime){
        lastTime=sec;
        elTime.textContent=sessionContext.clock(s.t);
      }
      if(s.kills!==lastKills){
        lastKills=s.kills;
        elKills.textContent=`${s.kills} ПОБЕЖДЕНО`;
      }
      const wKey=`${sessionContext.selected}:${s.map}`;
      if(wKey!==lastWeaponKey){
        lastWeaponKey=wKey;
        elWeapon.textContent=sessionContext.Villagers.defs[sessionContext.selected].weapon+' · '+sessionContext.arenaDefinitions[s.map].name;
      }
      const hCount=sessionContext.Progression.data.helmets;
      if(hCount!==lastHelmets||s.earned!==lastEarned){
        lastHelmets=hCount;lastEarned=s.earned;
        elHelmets.textContent='ШЛЕМЫ: '+hCount+' (+'+s.earned+')';
      }
      const boss=s.enemies.find(e=>e.boss);
      const bossActive=!!boss;
      if(bossActive!==lastBossActive){
        lastBossActive=bossActive;
        show('bossbar',bossActive);
      }
      if(boss){
        const bossPct=sessionContext.Math.round(boss.hp/boss.max*1000)/10;
        if(bossPct!==lastBossHpPct){
          lastBossHpPct=bossPct;
          elBosshealth.style.width=`${bossPct}%`;
        }
      }
    }
return {animateMenu,show,toast,updateRecord,updateRunHeroStats,renderRunHeroes,openRunHeroSelect,renderShop,closeShop,hud};
}};
