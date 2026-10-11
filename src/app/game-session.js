import {createArenas,arenaDefinitions} from '../world/arenas.js';
import {createMath} from '../core/math.js';
import {CanvasSystem} from '../rendering/canvas.js';
import {SpriteRenderer} from '../rendering/sprite-renderer.js';
import {GameUI} from '../ui/game-ui.js';
import {AudioSystem} from '../core/audio.js';
import {InputSystem} from '../core/input.js';
import {GameFlow} from './game-flow.js';
import {EnemySpawning} from '../systems/enemy-spawning.js';
import {CombatSystem} from '../systems/combat.js';
import {Simulation} from '../systems/simulation.js';
import {SceneRenderer} from '../rendering/scene-renderer.js';
import {GameLoop} from '../core/game-loop.js';
export let GameSession;
'use strict';
GameSession = {
  create({
    document, window, localStorage, performance, requestAnimationFrame, cancelAnimationFrame,
    Math, Villagers, Progression, UpgradeSystem, RomanArt, Village, Legion, Corpses,
    VillagerArt, AnimationArt, HeroArt, MenhirArt, MenuPortraits,
  }) {
const arenas=createArenas(Village);
let selectedMap='village';
let audioController=null;
const sessionContext={
get selectedMap(){return selectedMap},
get arenaDefinitions(){return arenaDefinitions},
get document(){return document},
get window(){return window},
get localStorage(){return localStorage},
get performance(){return performance},
get requestAnimationFrame(){return requestAnimationFrame},
get cancelAnimationFrame(){return cancelAnimationFrame},
get Math(){return Math},
get Villagers(){return Villagers},
get Progression(){return Progression},
get UpgradeSystem(){return UpgradeSystem},
get RomanArt(){return RomanArt},
get Village(){return arenas.get(selectedMap)},
get Legion(){return Legion},
get Corpses(){return Corpses},
get VillagerArt(){return VillagerArt},
get AnimationArt(){return AnimationArt},
get HeroArt(){return HeroArt},
get MenhirArt(){return MenhirArt},
get MenuPortraits(){return MenuPortraits},
get $(){return $},
get canvas(){return canvas},
get ctx(){return ctx},
get W(){return W},set W(value){W=value},
get H(){return H},set H(value){H=value},
get WORLD(){return WORLD},
get DURATION(){return DURATION},
get resizeCanvas(){return resizeCanvas},
get selected(){return selected},set selected(value){selected=value},
get mode(){return mode},set mode(value){mode=value;audioController?.sync()},
get state(){return state},set state(value){state=value},
get keys(){return keys},set keys(value){keys=value},
get toastLeft(){return toastLeft},set toastLeft(value){toastLeft=value},
get choice(){return choice},set choice(value){choice=value},
get pointer(){return pointer},set pointer(value){pointer=value},
get stick(){return stick},set stick(value){stick=value},
get best(){return best},set best(value){best=value},
get rand(){return rand},
get clamp(){return clamp},
get dist(){return dist},
get clock(){return clock},
get sprite(){return sprite},
get portraits(){return portraits},
get fitPortrait(){return fitPortrait},
get menuPortraitPhase(){return menuPortraitPhase},set menuPortraitPhase(value){menuPortraitPhase=value},
get animateMenu(){return animateMenu},
get soundEffect(){return audioController.effect},
get finishAudio(){return audioController.finish},
get stopAudio(){return audioController.stop},
get resumeAudio(){return audioController.resume},
get show(){return show},
get toast(){return toast},
get resetInput(){return resetInput},
get start(){return start},
get menu(){return menu},
get updateRecord(){return updateRecord},
get pendingRunHero(){return pendingRunHero},set pendingRunHero(value){pendingRunHero=value},
get updateRunHeroStats(){return updateRunHeroStats},
get renderRunHeroes(){return renderRunHeroes},
get openRunHeroSelect(){return openRunHeroSelect},
get renderShop(){return renderShop},
get closeShop(){return closeShop},
get pause(){return pause},
get levelUp(){return levelUp},
get pickUpgrade(){return pickUpgrade},
get spawn(){return spawn}, get updateSpawning(){return updateSpawning},
get damage(){return damage},
get throwStones(){return throwStones},
get beginAction(){return beginAction},
get advanceAction(){return advanceAction},
get hurtPlayer(){return hurtPlayer},
get heroImpact(){return heroImpact},
get finish(){return finish},
get update(){return update},
get hud(){return hud},
get background(){return background},
get draw(){return draw},
get run(){return run},
get stop(){return stop}
};

    const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d');
    let W=960,H=540;
    const WORLD=Village.size,DURATION=300;
    const {resizeCanvas}=CanvasSystem.create(sessionContext);
    resizeCanvas();
    window.addEventListener('resize',resizeCanvas);
    let selected='asterix',mode='menu',state=null,keys=new Set(),toastLeft=0,choice=[];
    let pointer=null,stick={x:0,y:0},best={kills:0,time:0};
    try{
      best=JSON.parse(localStorage.getItem('gaul-best'))||best;
    }catch{
    }
    const {rand,clamp,dist,clock}=createMath(Math);
    const {sprite}=SpriteRenderer.create(sessionContext);

    const portraits = MenuPortraits.create({
      document,
      sprite,
      artStatus(name) {
        return (VillagerArt?.status[name] || '') + ':' +
      (AnimationArt?.status[name] || '') + ':' + (HeroArt?.statuses?.[name] || HeroArt?.status || '');
      },
    });
    const fitPortrait = portraits.fit;
    let menuPortraitPhase=-1;
    const {animateMenu,show,toast,updateRecord,updateRunHeroStats,renderRunHeroes,openRunHeroSelect,renderShop,closeShop,hud}=GameUI.create(sessionContext);
    document.addEventListener('villager-art-ready',()=>{
      portraits.clear();
      menuPortraitPhase=-1;
      if(mode==='menu')renderShop();
    });
    document.addEventListener('hero-art-ready',()=>{
      menuPortraitPhase=-1;
      if(mode==='menu')renderShop();
    });
    document.addEventListener('animation-art-ready',()=>{
      menuPortraitPhase=-1;
      if(mode==='menu')renderShop();
    });

    audioController=AudioSystem.create(sessionContext);

    const {resetInput,bind:bindInput}=InputSystem.create(sessionContext);
    const {start,menu,pause,levelUp,pickUpgrade,finish}=GameFlow.create(sessionContext);

    updateRecord();
    let pendingRunHero=selected;

    const mapSelect=$('runMap');
    if(mapSelect)mapSelect.onchange=()=>{selectedMap=arenaDefinitions[mapSelect.value]?mapSelect.value:'village';$('mapDescription').textContent=arenaDefinitions[selectedMap].description;};
    $('start').onclick=openRunHeroSelect;
    $('runHeroBack').onclick=()=>{
      show('runHeroSelect',false);
      show('menu',true);
    };
    $('runHeroStart').onclick=()=>{
      selected=pendingRunHero;
      start();
    };
    $('again').onclick=start;
    $('back').onclick=menu;
    $('quit').onclick=menu;
    
    $('shopOpen').onclick=()=>{
      if(mode!=='menu')return;
      renderShop();
      show('menu',false);
      show('shop',true);
    };
    
    $('shopClose').onclick=closeShop;
    
    $('pause').onclick=pause;
    $('resume').onclick=pause;
    bindInput();

    const {spawn,updateSpawning}=EnemySpawning.create(sessionContext);
    const {damage,throwStones,beginAction,advanceAction,hurtPlayer,heroImpact}=CombatSystem.create(sessionContext);

    const {update}=Simulation.create(sessionContext);
    
    const {background,draw}=SceneRenderer.create(sessionContext);
    
// Scheduling is explicit; tests can advance simulation without a browser loop.
    const loop=GameLoop.create(sessionContext);const {run,stop}=loop;

    return {
      start,
      update,
      draw,
      pause,
      pickUpgrade,
      spawn,
      damage,
      finish,
      menu,
      run,
      stop,
      keys,
      get state() {
        return state;
      },
      get mode() {
        return mode;
      },
      get running() {
        return loop.running;
      },
      selectMap(id) {if(!arenaDefinitions[id])throw new Error('Unknown map: '+id);selectedMap=id;if(mapSelect)mapSelect.value=id;},
      select(hero) {
        selected = hero;
      },
    };
  },
};
