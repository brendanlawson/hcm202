import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {chapters, exhibits, media, flow, flowNotes} from '../museum-content.js';
const root = new URL('../', import.meta.url);
assert.equal(chapters.length, 3);
assert.equal(exhibits.length, 18);
assert.equal(new Set(exhibits.map(e=>e.id)).size,18);
assert.equal(Object.keys(media).length,10);
for(const c of chapters)assert.equal(exhibits.filter(e=>e.chapter===c.id).length,6);
for(const e of exhibits){
  assert.ok(e.title && e.lead && e.body && e.pages && e.section && e.question,e.id);
  assert.ok(media[e.image],e.image);
  assert.ok(existsSync(new URL(e.image,root)),e.image);
}
for(const [path,m] of Object.entries(media)){
  assert.ok(m.caption && m.credit && m.license && m.url,path);
  assert.ok(m.url.startsWith('https://commons.wikimedia.org/wiki/File:'));
}
const displayed=[[0,2,3],[0,2,5],[0,2,4]].flatMap((indices,z)=>indices.map(i=>exhibits.find(e=>e.zone===z&&e.index===i).image));
assert.equal(new Set(displayed).size,9,'room photographs must not repeat');
assert.equal(flow.length,6);assert.equal(flowNotes.length,6);
for(const path of ['vendor/three/three.module.min.js','vendor/three/OrbitControls.js','vendor/three/LICENSE','assets/fonts/BeVietnamPro-OFL.txt','assets/fonts/NotoSerif-OFL.txt'])assert.ok(existsSync(new URL(path,root)));
const html=readFileSync(new URL('museum-3d.html',root),'utf8');
assert.ok(!html.includes('cdn.jsdelivr.net'),'primary page must not depend on a CDN');
const css=readFileSync(new URL('fonts.css',root),'utf8');
for(const match of css.matchAll(/url\('([^']+)'\)/g))assert.ok(existsSync(new URL(match[1],root)),match[1]);
console.log(`PASS: 3 chapters, 18 sourced records, 10 local images, 9 distinct room frames, local library/font licenses. (${fileURLToPath(root)})`);
