'use strict';
// Shrinks published PNGs to the resolution the game actually draws them at (2× for HiDPI)
// and re-encodes every runtime PNG losslessly with adaptive filters and zlib level 9.
//   node tools/optimize-images.cjs            — report only
//   node tools/optimize-images.cjs --apply    — rewrite files (keeps a file only if smaller)
// Budgets live in tools/image-budget.json: {file, crop?:[x,y,w,h], max:[w,h]}. When an atlas
// is cropped or scaled, the data that addresses pixels in it must be updated as well
// (the report prints the scale factor). No dependencies beyond node:zlib.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),apply=process.argv.includes('--apply');
const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);

function decode(file){
  const png=fs.readFileSync(file);
  if(!png.subarray(0,8).equals(SIGNATURE))throw Error('Not a PNG: '+file);
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20),depth=png[24],type=png[25];
  if(depth!==8||png[28]!==0||![2,6].includes(type))throw Error(`Unsupported PNG (depth ${depth}, type ${type}, interlace ${png[28]}): ${file}`);
  const idat=[];
  for(let offset=8;offset<png.length;){const length=png.readUInt32BE(offset),kind=png.toString('ascii',offset+4,offset+8);if(kind==='IDAT')idat.push(png.subarray(offset+8,offset+8+length));offset+=length+12;}
  const raw=zlib.inflateSync(Buffer.concat(idat)),bpp=type===6?4:3,stride=width*bpp,rgba=Buffer.alloc(width*height*4);
  let prev=Buffer.alloc(stride);
  for(let y=0;y<height;y++){
    const start=y*(stride+1),filter=raw[start],row=Buffer.alloc(stride);
    for(let i=0;i<stride;i++){
      const a=i>=bpp?row[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0,x=raw[start+1+i];
      row[i]=(x+(filter===0?0:filter===1?a:filter===2?b:filter===3?(a+b)>>1:paeth(a,b,c)))&255;
    }
    for(let x=0;x<width;x++){const o=(y*width+x)*4;row.copy(rgba,o,x*bpp,x*bpp+bpp);if(bpp===3)rgba[o+3]=255;}
    prev=row;
  }
  return {width,height,rgba,opaque:type===2,bytes:png.length};
}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}

function crop(img,[x0,y0,w,h]){
  const out=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)img.rgba.copy(out,y*w*4,((y0+y)*img.width+x0)*4,((y0+y)*img.width+x0+w)*4);
  return {...img,width:w,height:h,rgba:out};
}
// Area-average downscale in premultiplied alpha, so transparent edges do not darken.
function resize(img,w,h){
  const out=Buffer.alloc(w*h*4),sx=img.width/w,sy=img.height/h;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const x0=x*sx,x1=x0+sx,y0=y*sy,y1=y0+sy;let r=0,g=0,b=0,a=0,area=0;
    for(let yy=Math.floor(y0);yy<Math.ceil(y1);yy++){const wy=Math.min(y1,yy+1)-Math.max(y0,yy);
      for(let xx=Math.floor(x0);xx<Math.ceil(x1);xx++){const wx=Math.min(x1,xx+1)-Math.max(x0,xx),k=wx*wy,o=(yy*img.width+xx)*4,al=img.rgba[o+3]/255*k;
        r+=img.rgba[o]*al;g+=img.rgba[o+1]*al;b+=img.rgba[o+2]*al;a+=al;area+=k;}}
    const o=(y*w+x)*4;
    if(a>0){out[o]=Math.round(r/a);out[o+1]=Math.round(g/a);out[o+2]=Math.round(b/a);}
    out[o+3]=Math.round(a/area*255);
  }
  return {...img,width:w,height:h,rgba:out};
}

const crcTable=new Int32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c;});
function crc(buf){let c=-1;for(const byte of buf)c=crcTable[(c^byte)&255]^(c>>>8);return (c^-1)>>>0;}
function chunk(kind,data){const head=Buffer.alloc(8);head.writeUInt32BE(data.length,0);head.write(kind,4,'ascii');const tail=Buffer.alloc(4);tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4),data])));return Buffer.concat([head,data,tail]);}
function encode(img){
  // Drop the alpha channel when every pixel is opaque.
  const opaque=img.opaque||!img.rgba.some((v,i)=>i%4===3&&v!==255),bpp=opaque?3:4,stride=img.width*bpp;
  const raw=Buffer.alloc((stride+1)*img.height);let prev=Buffer.alloc(stride);
  for(let y=0;y<img.height;y++){
    const row=Buffer.alloc(stride);for(let x=0;x<img.width;x++)img.rgba.copy(row,x*bpp,(y*img.width+x)*4,(y*img.width+x)*4+bpp);
    let best=null,bestScore=Infinity;
    for(let f=0;f<5;f++){
      const line=Buffer.alloc(stride);let score=0;
      for(let i=0;i<stride;i++){const a=i>=bpp?row[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0;
        const v=(row[i]-(f===0?0:f===1?a:f===2?b:f===3?(a+b)>>1:paeth(a,b,c)))&255;line[i]=v;score+=v<128?v:256-v;}
      if(score<bestScore){bestScore=score;best=[f,line];}
    }
    raw[y*(stride+1)]=best[0];best[1].copy(raw,y*(stride+1)+1);prev=row;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(img.width,0);header.writeUInt32BE(img.height,4);header[8]=8;header[9]=opaque?2:6;
  return Buffer.concat([SIGNATURE,chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw,{level:9,memLevel:9})),chunk('IEND',Buffer.alloc(0))]);
}

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.png')?[path.join(dir,e.name)]:[]);}

const budgets=new Map(require('./image-budget.json').map(b=>[path.join(root,b.file),b]));
let before=0,after=0;
for(const file of walk(path.join(root,'assets/runtime'))){
  let img=decode(file);const budget=budgets.get(file),original=img.bytes;let note='';
  // A crop that no longer fits means it was applied already; the tool stays idempotent.
  if(budget?.crop&&budget.crop[0]+budget.crop[2]<=img.width&&budget.crop[1]+budget.crop[3]<=img.height&&(budget.crop[2]<img.width||budget.crop[3]<img.height)){img=crop(img,budget.crop);note+=` crop ${budget.crop.join(',')}`;}
  if(budget?.max){const k=Math.min(1,budget.max[0]/img.width,budget.max[1]/img.height);
    if(k<1){const w=Math.max(1,Math.round(img.width*k)),h=Math.max(1,Math.round(img.height*k));note+=` ${img.width}x${img.height}→${w}x${h} (×${k.toFixed(4)})`;img=resize(img,w,h);}}
  const data=encode(img),changed=!!note||data.length<original;
  const size=changed?Math.min(data.length,note?data.length:original):original;
  before+=original;after+=size;
  if(changed&&(note||original-data.length>512)){
    console.log(`${path.relative(root,file)}: ${(original/1024).toFixed(0)}K → ${(size/1024).toFixed(0)}K${note}`);
    if(apply)fs.writeFileSync(file,data);
  }
}
console.log(`Total: ${(before/1048576).toFixed(2)} MB → ${(after/1048576).toFixed(2)} MB${apply?'':' (dry run; pass --apply)'}`);
