import * as T from 'three';
import {OrbitControls} from './vendor/three/OrbitControls.js';
import {createTapGesture} from './museum-gestures.js';

export function createMuseum({host,labels,exhibits,open,light,status,onView=()=>{}}) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.enabled=!light;
  host.append(renderer.domElement);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Không gian 3D: kéo để xoay; chạm khung ảnh để xem gần. Phím mũi tên xoay, + hoặc − zoom, [ hoặc ] đổi khung, Enter đọc, Home đặt lại góc. Có nút thao tác tương ứng bên dưới.');
  const scene=new T.Scene();scene.background=new T.Color('#243c33');scene.fog=new T.Fog('#243c33',25,45);
  const camera=new T.PerspectiveCamera(52,1,.1,60);
  camera.position.set(0,7.2,13.5);
  const controls=new OrbitControls(camera,canvas);
  controls.target.set(0,1.8,-1.5);controls.enablePan=false;controls.enableDamping=!reduced.matches;
  controls.dampingFactor=.12;controls.rotateSpeed=.45;controls.zoomSpeed=.65;
  controls.minPolarAngle=.5;controls.maxPolarAngle=1.52;
  controls.minAzimuthAngle=-.72;controls.maxAzimuthAngle=.72;
  controls.minDistance=9;controls.maxDistance=22;
  controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;
  scene.add(new T.HemisphereLight('#fff2dd','#46544a',2.1));
  const sun=new T.DirectionalLight('#fff0d3',2.8);sun.position.set(-3,9,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});sun.shadow.bias=-.001;scene.add(sun);
  const materials=new Map();const mat=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.72}));return materials.get(color)};
  const stone=mat('#e4dccb'),gold=mat('#b79861'),palette=['#496779','#a08048','#708166'];
  const box=(w,h,d,x,y,z,m,parent=scene)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
  box(14,.18,15,0,-.09,.5,mat('#b4ac94'));box(14,5.5,.23,0,2.75,-6,stone);
  box(.23,5.5,12,-7,2.75,0,stone);box(.23,5.5,12,7,2.75,0,stone);
  box(14,.15,.15,0,.16,-5.83,mat('#8e876f'));box(.15,.15,12,-6.83,.16,0,mat('#8e876f'));box(.15,.15,12,6.83,.16,0,mat('#8e876f'));
  for(let x=-6;x<=6;x+=2)box(.012,.006,15,x,.006,.5,mat('#96917d'));
  for(let z=-5.5;z<=7;z+=2)box(14,.006,.012,0,.007,z,mat('#96917d'));
  for(const x of [-6.6,6.6])for(const z of [-5.7,5.5])box(.32,5.3,.32,x,2.65,z,mat('#375649'));
  function texture(title,sub,color='#284b3e') {
    const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
    g.fillStyle=color;g.fillRect(0,0,1024,256);g.fillStyle='#fff3d9';g.textAlign='center';g.font='600 36px "Be Vietnam Pro"';
    if(g.measureText(title).width>930)g.font='600 29px "Be Vietnam Pro"';g.fillText(title,512,110);g.font='400 22px "Be Vietnam Pro"';g.fillText(sub,512,174);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
  }
  const plane=(w,h,t,parent=scene)=>{const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));parent.add(mesh);return mesh};
  const sign=plane(4.6,1.05,texture('DẤU ẤN','BA CÁNH TƯ TƯỞNG'));sign.position.set(0,4.6,-5.86);
  let dirty=true,frame=0,last=0,active=-1,transition=null,interacting=false,width=0,height=0,paused=false;
  const hotspots=[],textureCache=new Map();let loaded=0,focused=null,hovered=null,suspended=false;
  const loader=new T.TextureLoader();
  function load(src) {
    if(!textureCache.has(src))textureCache.set(src,new Promise((resolve,reject)=>loader.load(src,t=>{
      // Keep the full local photograph for reading; limit only its GPU preview.
      const image=t.image,scale=Math.min(1,512/Math.max(image.width,image.height));
      if(scale<1){const preview=document.createElement('canvas');preview.width=Math.round(image.width*scale);preview.height=Math.round(image.height*scale);const ctx=preview.getContext('2d');ctx.drawImage(image,0,0,preview.width,preview.height);t.image=preview;t.needsUpdate=true;}
      t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);resolve(t);
    },undefined,reject)));
    return textureCache.get(src);
  }
  // Nine distinct images in the room; all 18 files remain accessible in the adjacent list.
  const frameIndices=[[0,2,3],[0,2,5],[0,2,4]];
  for(let z=0;z<3;z++)for(let i=0;i<3;i++) {
    const e=exhibits.find(e=>e.zone===z&&e.index===frameIndices[z][i]);
    const g=new T.Group();g.position.set(z===1?(i-1)*3.8:z===0?-6.8:6.8,2.7,z===1?-5.83:-4.2+i*3.3);g.rotation.y=z===1?0:z===0?Math.PI/2:-Math.PI/2;scene.add(g);
    const frameMesh=box(2.72,2.13,.12,0,0,0,gold.clone(),g);frameMesh.userData.e=e;
    box(2.56,1.96,.015,0,0,.07,mat('#eee6d5'),g).userData.e=e;
    const pic=plane(2.36,1.76,texture(e.title,'ĐANG TẢI ẢNH',palette[z]),g);pic.position.z=.085;
    pic.userData.e=e;
    load(e.image).then(t=>{const ratio=t.image.width/t.image.height,fit=2.36/1.76;pic.scale.set(Math.min(1,ratio/fit),Math.min(1,fit/ratio),1);pic.material.map.dispose();pic.material.map=t;pic.material.needsUpdate=true;loaded++;dirty=true;schedule();if(!focused)status(loaded===9?'Kéo để xoay · chạm khung ảnh để xem gần.':`Đang tải ảnh tư liệu… ${loaded}/9`)}).catch(()=>status('Một ảnh chưa tải được. Mở Danh mục hoặc tải lại trang.'));
    const plaque=plane(2.7,.53,texture(e.title,`CHƯƠNG ${e.chapter} / MỤC ${e.section}`,palette[z]),g);plaque.position.set(0,-1.36,.09);
    const b=document.createElement('button');b.type='button';b.textContent='+';b.className='hotspot';b.hidden=true;b.setAttribute('aria-label','Đọc '+e.title);b.title='Đọc '+e.title;b.onclick=()=>open(e);labels.append(b);hotspots.push({b,g,z,e,i,frameMesh});
  }
  const sculpture=new T.Group();sculpture.position.set(0,0,0);scene.add(sculpture);
  box(1.9,.55,1.9,0,.275,0,stone,sculpture);box(2.05,.04,2.05,0,.56,0,gold,sculpture);
  const figures=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2,g=new T.Group();g.position.set(Math.cos(a)*.64,.6,Math.sin(a)*.64);const body=new T.Mesh(new T.CylinderGeometry(.10,.15,.5,12),mat(palette[i%3]));body.position.y=.27;const head=new T.Mesh(new T.SphereGeometry(.12,16,12),gold);head.position.y=.65;g.add(body,head);sculpture.add(g);figures.push(g)}
  const ring=new T.Mesh(new T.TorusGeometry(.94,.03,12,64),gold);ring.rotation.x=Math.PI/2;ring.position.y=1.52;sculpture.add(ring);
  for(const x of [-3,3]){box(1.9,.14,.65,x,.58,3.8,mat('#806245'));for(const dx of [-.72,.72])box(.1,.58,.5,x+dx,.29,3.8,mat('#365649'))}
  // Freeze shadows: lights/architecture are static; refresh only on explicit sculpture changes.
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const positions=[[-1,2.8,.3],[0,2.8,3],[1,2.8,.3]],looks=[[-6.6,2.7,-1],[0,2.7,-5.7],[6.6,2.7,-1]];
  function limits(pos,target,overview=false,close=false) {
    const delta=pos.clone().sub(target),angle=Math.atan2(delta.x,delta.z);
    controls.minAzimuthAngle=overview?-.72:angle-.23;controls.maxAzimuthAngle=overview?.72:angle+.23;
    controls.minPolarAngle=overview?.5:1.15;controls.maxPolarAngle=overview?1.52:1.65;
    controls.minDistance=overview?9:close?Math.max(2.6,delta.length()*.8):3.7;controls.maxDistance=overview?22:close?Math.min(6.2,delta.length()*1.5):9;
  }
  function highlight() {
    hotspots.forEach(h=>{h.frameMesh.material.emissive.set(h===focused?'#604621':h===hovered?'#34270e':'#000000');h.b.classList.toggle('selected',h===focused)});
    dirty=true;schedule();
  }
  function move(pos,target,z,close=false) {
    active=z;controls.enabled=!suspended;controls.enableDamping=false;controls.update();
    transition={from:camera.position.clone(),to:pos,lookFrom:controls.target.clone(),lookTo:target,start:performance.now(),duration:reduced.matches?0:650};
    limits(pos,target,z===-1,close);dirty=true;schedule();
  }
  function select(z){focused=null;hovered=null;highlight();onView(null,z);move(new T.Vector3(...positions[z]),new T.Vector3(...looks[z]),z)}
  function overview(){focused=null;hovered=null;highlight();onView(null,-1);move(new T.Vector3(0,7.2,13.5),new T.Vector3(0,1.8,-1.5),-1)}
  function focusFrame(index=0,z=active<0?0:active) {
    const h=hotspots.find(h=>h.z===z&&h.i===((index%3)+3)%3);if(!h)return;
    focused=h;hovered=null;highlight();
    const target=h.g.position.clone().add(new T.Vector3(0,-.23,0)),normal=new T.Vector3(0,0,1).applyQuaternion(h.g.quaternion);
    const distance=Math.min(5.8,Math.max(3.7,1.48/(Math.tan(T.MathUtils.degToRad(26))*Math.max(camera.aspect,.5))+.5));
    move(target.clone().addScaledVector(normal,distance),target,z,true);onView(h.e,z,h.i);
    status(`Khung ${h.i+1}/3 · ${h.e.title}. Chọn Đọc hồ sơ hoặc dấu + để đọc.`);
  }
  function nextFrame(delta){focusFrame(focused?focused.i+delta:delta<0?2:0)}
  function interrupt(){if(transition){if(!transition.keepLimits)limits(camera.position,controls.target,active===-1,!!focused);transition=null}controls.enableDamping=false;controls.update();controls.enableDamping=!reduced.matches;}
  function adjust(pos){controls.enableDamping=false;transition={from:camera.position.clone(),to:pos,lookFrom:controls.target.clone(),lookTo:controls.target.clone(),start:performance.now(),duration:reduced.matches?0:220,keepLimits:true};dirty=true;schedule()}
  function zoom(scale) {
    interrupt();const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(scale).clampLength(controls.minDistance,controls.maxDistance);adjust(controls.target.clone().add(offset));
  }
  function turn(angle) {
    interrupt();const sphere=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));sphere.theta=T.MathUtils.clamp(sphere.theta+angle,controls.minAzimuthAngle,controls.maxAzimuthAngle);adjust(controls.target.clone().add(new T.Vector3().setFromSpherical(sphere)));
  }
  controls.addEventListener('start',()=>{interrupt();interacting=true;hovered=null;highlight()});
  controls.addEventListener('end',()=>{interacting=false;dirty=true;schedule()});
  controls.addEventListener('change',()=>{dirty=true;schedule()});
  const tap=createTapGesture(),ray=new T.Raycaster();
  function pick(e){const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(scene.children,true)[0];return hit?.object.userData.e}
  canvas.addEventListener('pointerdown',e=>{tap.down(e);canvas.classList.add('dragging')});
  canvas.addEventListener('pointermove',e=>{if(tap.active){tap.move(e);return}if(e.pointerType==='mouse'&&!transition&&!suspended){const exhibit=pick(e),h=hotspots.find(h=>h.e===exhibit)||null;if(hovered!==h){hovered=h;canvas.classList.toggle('over-frame',!!h);highlight()}}});
  canvas.addEventListener('pointerup',e=>{if(tap.up(e)&&!transition&&!suspended){const exhibit=pick(e),h=hotspots.find(h=>h.e===exhibit);if(h){if(focused===h)open(h.e);else focusFrame(h.i,h.z)}}if(!tap.active)canvas.classList.remove('dragging')});
  canvas.addEventListener('pointercancel',e=>{tap.cancel(e);if(!tap.active)canvas.classList.remove('dragging')});
  canvas.addEventListener('pointerleave',()=>{hovered=null;canvas.classList.remove('over-frame');highlight()});
  canvas.addEventListener('keydown',e=>{if(suspended||document.querySelector('dialog[open]'))return;if(['ArrowLeft','ArrowRight','+','=','-','[',']','Home','Enter'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')turn(-.12);else if(e.key==='ArrowRight')turn(.12);else if(e.key==='['||e.key===']')nextFrame(e.key==='['?-1:1);else if(e.key==='Home')active<0?overview():select(active);else if(e.key==='Enter'){if(focused)open(focused.e);else focusFrame()}else zoom(e.key==='-'?1.15:.85)}});
  function quality(value){light=value;renderer.setPixelRatio(Math.min(devicePixelRatio,light?1:1.5));renderer.shadowMap.enabled=!light;renderer.shadowMap.needsUpdate=true;renderer.setSize(width,height);dirty=true;schedule()}
  const ro=new ResizeObserver(entries=>{const r=entries[0].contentRect;width=r.width;height=r.height;if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,light?1:1.5));renderer.setSize(width,height);if(focused)focusFrame(focused.i,focused.z);dirty=true;schedule()});ro.observe(host);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;hotspots.forEach(h=>h.b.hidden=true);status('3D tạm dừng. Mở Danh mục để tiếp tục hoặc tải lại trang.')});
  canvas.addEventListener('webglcontextrestored',()=>{paused=false;renderer.shadowMap.needsUpdate=true;dirty=true;schedule();status('Đã khôi phục phòng 3D.')});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();dirty=true;schedule()}});
  reduced.addEventListener('change',()=>{controls.enableDamping=!reduced.matches;dirty=true;schedule()});
  const projected=new T.Vector3();
  function schedule(){if(!frame&&!document.hidden&&!paused)frame=requestAnimationFrame(animate)}
  function animate(now) {
    frame=0;if(document.hidden||paused||!width||!height)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    let changed=false;
    if(transition){const t=transition.duration?Math.min(1,(now-transition.start)/transition.duration):1;const a=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,a);controls.target.lerpVectors(transition.lookFrom,transition.lookTo,a);camera.lookAt(controls.target);dirty=true;if(t===1){transition=null;controls.enabled=!suspended;controls.enableDamping=!reduced.matches;controls.update()}}
    else changed=controls.update(dt);
    if(dirty){renderer.render(scene,camera);hotspots.forEach(h=>{h.g.localToWorld(projected.set(.9,-.63,.15));projected.project(camera);const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;h.b.hidden=!!transition||interacting||suspended||active!==h.z||projected.z< -1||projected.z>1||x<24||x>width-24||y<24||y>height-24;h.b.style.transform=`translate3d(${x-22}px,${y-22}px,0)`});dirty=false}
    if(transition||interacting||controls.enableDamping&&changed)schedule();
  }
  controls.update();schedule();
  return {select,overview,focusFrame,nextFrame,zoom,turn,quality,suspend(value){suspended=value;controls.enabled=!value;hovered=null;highlight()},stage(i){figures.forEach((g,k)=>g.scale.setScalar(k<=i?1:.65));renderer.shadowMap.needsUpdate=true;dirty=true;schedule()}};
}
