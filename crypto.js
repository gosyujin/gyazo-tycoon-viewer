// protected(暗号化)画像の復号。gyazo-tycoon の seal.py と対(PBKDF2-SHA256 → AES-256-GCM、ファイル = nonce(12) || 暗号文+タグ、AAD = ファイル名)。
// ブラウザでは window.GT_CRYPTO、Node では module.exports として使う(テスト用)。
(function(root){
const subtle=(root.crypto||require('crypto').webcrypto).subtle;
const enc=s=>new TextEncoder().encode(s);
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
// パスフレーズ → 復号専用の鍵(取り出し不可。IndexedDB にそのまま保存できる)
async function deriveKey(pass,params){
  const base=await subtle.importKey('raw',enc(pass),'PBKDF2',false,['deriveKey']);
  return subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:b64d(params.salt),iterations:params.iter},base,{name:'AES-GCM',length:256},false,['decrypt']);
}
async function decrypt(key,buf,aad){
  const u=new Uint8Array(buf);
  return subtle.decrypt({name:'AES-GCM',iv:u.slice(0,12),additionalData:enc(aad)},key,u.slice(12));
}
// パスフレーズ(の鍵)が正しいか。crypto.json の check を復号できて中身が一致すれば正解
async function verify(key,params){
  try{return new TextDecoder().decode(await decrypt(key,b64d(params.check),'check'))==='gyazo-tycoon'}catch(e){return false}
}
const api={deriveKey,decrypt,verify};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GT_CRYPTO=api;
})(typeof window!=='undefined'?window:globalThis);
