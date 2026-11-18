import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const htmlFiles=[];
async function walk(directory){for(const entry of await readdir(directory,{withFileTypes:true})){if(entry.name.startsWith('.')||['node_modules','src','scripts','tests'].includes(entry.name))continue;const target=path.join(directory,entry.name);if(entry.isDirectory())await walk(target);else if(entry.name.endsWith('.html'))htmlFiles.push(target);}}
await walk(root);
const pages=new Map(await Promise.all(htmlFiles.map(async file=>[file,await readFile(file,'utf8')])));
const errors=[];
for(const [file,html] of pages){
  if(!html.includes('lang="zh-CN"'))errors.push(`${file}: missing Chinese language`);
  if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${file}: expected one H1`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate IDs`);
  for(const reference of html.matchAll(/(?:aria-controls|aria-labelledby)="([^"]+)"/g)){
    for(const id of reference[1].split(/\s+/))if(!ids.includes(id))errors.push(`${file}: missing ARIA target ${id}`);
  }
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1];if(/^(?:https?:|data:|mailto:|tel:)/.test(value))continue;
    const [relative,hash]=value.split('#');
    const target=path.resolve(path.dirname(file),relative.split('?')[0]||path.basename(file));
    let resolved=target;
    try{if((await stat(target)).isDirectory())resolved=path.join(target,'index.html');await stat(resolved);}catch{errors.push(`${path.relative(root,file)}: broken link ${value}`);continue;}
    if(hash&&resolved.endsWith('.html')){const body=pages.get(resolved)||await readFile(resolved,'utf8');if(!body.includes(`id="${hash}"`))errors.push(`${path.relative(root,file)}: missing anchor ${value}`);}
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Checked ${pages.size} pages: local links, anchors, H1s, IDs, and language are valid.`);
