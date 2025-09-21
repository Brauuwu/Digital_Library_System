const http = require('http');
// use explicit IPv4 address to avoid IPv6/localhost resolution issues on Windows
const HOST = '127.0.0.1';
function get(path){return new Promise((res,rej)=>{
  http.get({ host: HOST, port: 4000, path, headers: { 'Accept': 'application/json' } }, r=>{
    let s=''; r.on('data',c=>s+=c); r.on('end',()=>res({status:r.statusCode, body: s})); r.on('error',e=>rej(e));
  }).on('error',e=>rej(e));
});}
function put(path, data){return new Promise((res,rej)=>{
  const b = JSON.stringify(data);
  const req = http.request({ host: HOST, port:4000, path, method:'PUT', headers:{ 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(b)} }, r=>{
    let s=''; r.on('data',c=>s+=c); r.on('end',()=>res({status:r.statusCode, body:s})); r.on('error',e=>rej(e));
  }); req.on('error',e=>rej(e)); req.write(b); req.end();
});}
(async ()=>{
  try{
    const list = await get('/api/books');
    console.log('LIST', list.status, list.body.slice(0,200));
    const b = JSON.parse(list.body)[0];
    if(!b) return console.log('No books');
    console.log('Will update book id', b.ID_Sach);
    const upd = await put(`/api/books/${b.ID_Sach}`, { SoLuongCon: 5 });
    console.log('UPDATE', upd.status, upd.body);
  }catch(e){ console.error('ERR', e); }
})();
