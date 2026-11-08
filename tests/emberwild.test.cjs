const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),storage=new Map();
function node(){return {hidden:false,style:{},dataset:{},textContent:'',classList:{add(){},remove(){}},append(){},replaceChildren(){},addEventListener(){},setAttribute(){},getBoundingClientRect(){return {width:1180,height:520}},getContext(){return ctx},showModal(){this.open=true},close(){this.open=false}}}
const ctx=new Proxy({}, {get:(_,k)=> k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
const sandbox={console,Math,JSON,Number,Array,Object,HTMLInputElement:class{},devicePixelRatio:1,localStorage:{setItem(k,v){storage.set(k,v)},getItem(k){return storage.get(k)||null},removeItem(k){storage.delete(k)}},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},querySelectorAll(){return []},createElement:node,addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){}};
let code=fs.readFileSync(require('node:path').join(__dirname,'../dist/emberwild.js'),'utf8');
code=code.replace(/\}\)\(\);\s*$/,`globalThis.game={fresh,init,update,jump,doAction,craft,openBuild,closeBuild,eat,bridge,save,readSave,draw,resources,get state(){return state},get keys(){return keys},get ended(){return ended},get enemies(){return enemies},set paused(v){paused=v}};})();`);
vm.runInNewContext(code,sandbox);const g=sandbox.game;
function reset(){g.init();sandbox.document.getElementById('buildOverlay').hidden=true;g.paused=false;}
function step(n){for(let i=0;i<n;i++)g.update(1/60);}
const checks=[];function test(name,fn){reset();fn();checks.push(name)}
test('Gravity lands on terrain',()=>{step(90);assert.equal(g.state.player.y,496);});
test('Double jump works and third jump is denied',()=>{step(30);g.jump();step(1);assert.equal(g.state.player.jumps,1);step(10);g.jump();step(1);assert.equal(g.state.player.jumps,2);step(10);const vy=g.state.player.vy;g.jump();step(1);assert.equal(g.state.player.jumps,2);assert.ok(g.state.player.vy>vy);});
test('Gathering depletes resources and awards wood',()=>{g.state.player.x=180;g.state.player.y=496;g.state.player.cool=0;g.doAction();assert.equal(g.state.bag.wood,3);assert.equal(g.resources[0].left,2);});
test('Unaffordable recipes do not spend or build',()=>{g.craft('shelter');assert.equal(g.state.shelter,false);assert.equal(g.state.bag.wood,0);});
test('Shelter spends correct resources exactly once',()=>{g.state.bag.wood=8;g.state.bag.stone=4;g.craft('shelter');assert.equal(g.state.shelter,true);assert.equal(g.state.bag.wood,0);g.craft('shelter');assert.equal(g.state.bag.wood,0);});
test('Refuelling consumes wood and caps at 100',()=>{g.state.bag.wood=2;g.state.fuel=90;g.craft('fuel');assert.equal(g.state.fuel,100);assert.equal(g.state.bag.wood,0);});
test('Berries restore health and are consumed',()=>{g.state.player.hp=50;g.eat();assert.equal(g.state.player.hp,75);assert.equal(g.state.bag.berry,2);});
test('Bridges cost wood, persist and prevent falling',()=>{g.state.player.x=1250;g.state.player.y=480;g.state.bag.wood=3;g.bridge();assert.equal(g.state.bag.wood,0);assert.equal(g.state.bridges[0],1250);step(60);assert.equal(g.state.player.y,496);});
test('Night spawns enemies and dawn regrows resources',()=>{g.state.time=89.99;step(1);assert.equal(g.state.night,true);step(120);assert.ok(g.enemies.length>0);g.resources[0].left=0;g.state.time=44.99;step(1);assert.equal(g.state.night,false);assert.equal(g.state.nights,1);assert.equal(g.resources[0].left,3);});
test('Three nights completes the game',()=>{g.state.night=true;g.state.nights=2;g.state.day=3;g.state.time=44.99;step(1);assert.equal(g.ended,true);assert.equal(nodes.get('endOverlay').hidden,false);});
test('Falling returns to camp and removes 20 health',()=>{g.state.player.y=900;g.state.player.inv=0;step(1);assert.equal(g.state.player.hp,80);assert.equal(g.state.player.x,505);});
test('Save and continue preserve inventory and world',()=>{g.state.bag.wood=17;g.resources[0].left=0;g.save();const s=g.readSave();assert.equal(s.bag.wood,17);g.init(s);assert.equal(g.resources[0].left,0);});
test('Combat damages and defeats nearby enemies',()=>{g.state.night=true;step(400);const e=g.enemies[0];assert.ok(e);g.state.player.x=e.x;g.state.player.y=e.y;g.state.axe=true;g.state.player.cool=0;g.doAction();assert.ok(e.hp<55);g.state.player.cool=0;g.doAction();assert.equal(g.state.kills,1);});
test('Canvas draws day and night without errors',()=>{g.draw(.016);g.state.night=true;g.draw(.016);});
console.log(`${checks.length} gameplay checks passed:\n- ${checks.join('\n- ')}`);
