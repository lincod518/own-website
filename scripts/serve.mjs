import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.json':'application/json'};
const allowedRoot=new Set(['assets','lab','writing','index.html','sitemap.xml']);
const server=http.createServer(async(req,res)=>{
  try{
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/own-website'){res.writeHead(302,{Location:'/own-website/'});res.end();return;}
    if(pathname.startsWith('/own-website/'))pathname=pathname.slice('/own-website'.length);
    const segments=pathname.split('/').filter(Boolean);
    if(segments.some(part=>part.startsWith('.')||part.includes('\\'))||(segments.length&&!allowedRoot.has(segments[0]))){res.writeHead(404);res.end('Not found');return;}
    let target=path.resolve(root,...segments);
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(target);
    if(info.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(302,{Location:new URL(req.url,'http://localhost').pathname+'/'});res.end();return;}
      target=path.join(target,'index.html');
    }
    const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/own-website/`));
const stop=()=>server.close(()=>process.exit(0));process.on('SIGINT',stop);process.on('SIGTERM',stop);
