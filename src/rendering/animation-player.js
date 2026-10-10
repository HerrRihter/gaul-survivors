import {actionTiming} from '../../data/animations/action-timing.js';

export function clampedFrame(progress){
  return Math.min(actionTiming.frameCount-1,Math.floor(Math.max(0,progress)*actionTiming.frameCount));
}
export function loopFrame(progress){
  return Math.floor(((progress%1)+1)%1*actionTiming.frameCount);
}
export function advanceAction(actor,dt,impact){
  const action=actor.action;
  if(!action)return;
  action.elapsed+=dt;
  if(!action.hit&&action.elapsed>=action.duration*actionTiming.impactProgress){
    action.hit=true;
    impact(action);
  }
  if(action.elapsed>=action.duration)actor.action=null;
}
