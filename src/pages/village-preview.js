import {Village} from '../world/village/village.js';
import {VillageArt} from '../rendering/art/village-art.js';

const canvas=document.getElementById('map'),g=canvas.getContext('2d');let close=false;
document.getElementById('overview').onclick=()=>close=false;document.getElementById('square').onclick=()=>close=true;
function render(){g.setTransform(1,0,0,1,0,0);g.fillStyle='#89954e';g.fillRect(0,0,1320,1000);const scale=close?.95:.57;g.translate(660,500);g.scale(scale,scale);g.translate(-1100,close?-1070:-1090);Village.draw(g);if(document.getElementById("collision").checked)Village.collision.draw(g);
if(document.getElementById('labels').checked)for(const h of Village.houses){g.font='bold 19px Georgia';g.textAlign='center';g.lineWidth=5;g.strokeStyle='#24301ee0';g.strokeText(h.name,h.x+h.w/2,h.y+h.h+37);g.fillStyle='#fff0ba';g.fillText(h.name,h.x+h.w/2,h.y+h.h+37);}
const ready=Object.values(VillageArt.status).filter(s=>s==='ready').length;document.getElementById('status').textContent=ready===10?'Карта готова':Object.values(VillageArt.status).includes('error')?'Не удалось загрузить рисунок':ready+' / 10';requestAnimationFrame(render);}render();
