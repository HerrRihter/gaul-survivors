// Descriptions in data/ may reference the numbers of the same definition as {field},
// {nested.field} or {field%} (fraction shown as percent). Texts never repeat numbers by hand.
const number=value=>Number.isInteger(value)?String(value):String(Math.round(value*100)/100).replace('.',',');

export function describe(template,values){
  return String(template||'').replace(/\{([\w.]+)(%?)\}/g,(match,key,percent)=>{
    const value=key.split('.').reduce((node,part)=>node?.[part],values);
    if(typeof value!=='number')return match;
    return percent?number(Math.round(value*100)):number(value);
  });
}

export const unresolved=text=>/\{[\w.]+%?\}/.test(text);

export function clock(seconds){
  const s=Math.max(0,Math.round(seconds));
  return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}
