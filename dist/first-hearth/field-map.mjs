// A schematic of discovered routes. Coordinates are for the map display, not world travel.
export const mapRegionIds = [
  'camp','crownwood','mine','beach','rootdeep','hearth','king','village',
  'hut','lyss-cabin','village-home','house','rowboat',
  'rootdeep-home-lantern','rootdeep-home-stone','rootdeep-home-common','barry-home'
];

export const mapParent = {
  hut:'camp', 'lyss-cabin':'camp', 'village-home':'village', house:'village',
  'barry-home':'crownwood',
  'rootdeep-home-lantern':'rootdeep', 'rootdeep-home-stone':'rootdeep', 'rootdeep-home-common':'rootdeep'
};

const nodes = [
  { id:'camp', x:95, y:270, lines:['Alder','Camp'] },
  { id:'crownwood', x:250, y:245, lines:['Crownwood','Canopy'] },
  { id:'mine', x:95, y:415, lines:['Embervein','Mine'] },
  { id:'beach', x:95, y:555, lines:['Driftwood','Cove'] },
  { id:'rowboat', x:95, y:635, lines:['Rowboat','Offshore'] },
  { id:'rootdeep', x:250, y:410, lines:['Rootdeep','Mine'] },
  { id:'hearth', x:400, y:85, lines:['First','Hearth'] },
  { id:'king', x:400, y:245, lines:['King’s','Grounds'] },
  { id:'village', x:400, y:410, lines:['Lantern','Village'] }
];

const links = [
  { from:'camp', to:'crownwood', hint:'Canopy trail' },
  { from:'camp', to:'mine', hint:'Mine entrance' },
  { from:'camp', to:'beach', hint:'Shore trail' },
  { from:'beach', to:'rowboat', hint:'Offshore' },
  { from:'crownwood', to:'rootdeep', hint:'Rootbound entrance' },
  { from:'crownwood', to:'hearth', hint:'Waterfall passage' },
  { from:'crownwood', to:'king', hint:'King’s trail' },
  { from:'king', to:'village', hint:'Village gate' },
  { from:'rootdeep', to:'mine', hint:'Minecart tunnel', tunnel:true }
];

const placeNames = {
  hut:'Alvin’s Hut', 'lyss-cabin':'Lyss’s Cabin', 'village-home':'Your Village Home',
  house:'Homecoming House', 'barry-home':'Barry’s Workshop', 'rootdeep-home-lantern':'Lantern Keeper’s Home',
  'rootdeep-home-stone':'Stonecarver’s Home', 'rootdeep-home-common':'Common House'
};
const ns='http://www.w3.org/2000/svg';
function svg(tag,attributes={},value) {
  const element=document.createElementNS(ns,tag);
  for (const [name,content] of Object.entries(attributes)) element.setAttribute(name,String(content));
  if (value !== undefined) element.textContent=value;
  return element;
}

export function renderFieldMap({ discovered, region, player, terrain, location, tunnelOpen, drawing, here, routes }) {
  drawing.replaceChildren();
  const main = mapParent[region] ?? region;
  const xPercent=mapParent[region] ? 50 : Math.max(0,Math.min(100,Math.round(player.x/terrain.width*100)));
  const found = new Set(discovered);
  found.add(main);
  drawing.append(svg('rect',{x:0,y:0,width:480,height:690,rx:20,fill:'#132b27'}));
  for(const edge of links) {
    if (!found.has(edge.from) || !found.has(edge.to) || edge.tunnel && !tunnelOpen) continue;
    const start=nodes.find(node=>node.id===edge.from), end=nodes.find(node=>node.id===edge.to);
    drawing.append(svg('line',{x1:start.x,y1:start.y,x2:end.x,y2:end.y,
      stroke:edge.tunnel?'#e9c58c':'#738b74','stroke-width':edge.tunnel?5:4,
      'stroke-dasharray':edge.tunnel?'8 7':'none','stroke-linecap':'round'}));
  }
  for(const node of nodes) {
    if(!found.has(node.id)) continue;
    const active=node.id===main;
    drawing.append(svg('rect',{x:node.x-61,y:node.y-31,width:122,height:62,rx:11,
      fill:active?'#557253':'#28443a',stroke:active?'#f4d69a':'#78907c','stroke-width':active?3:1.5}));
    const name=svg('text',{x:node.x,y:node.y-6,'text-anchor':'middle',
      fill:active?'#fff2d0':'#e2e5d0','font-family':'system-ui, sans-serif',
      'font-size':16,'font-weight':active?700:500});
    node.lines.forEach((line,index)=>name.append(svg('tspan',{x:node.x,dy:index?19:0},line)));
    drawing.append(name);
    if(active) {
      // The lower pin tracks west/east progress within the current region.
      drawing.append(svg('circle',{cx:node.x-50+xPercent,cy:node.y+24,r:6,fill:'#f8d68a',stroke:'#152a24','stroke-width':2}));
      drawing.append(svg('circle',{cx:node.x-51,cy:node.y-21,r:7,fill:'#f8d68a',stroke:'#152a24','stroke-width':2}));
      drawing.append(svg('text',{x:node.x+49,y:node.y-19,'text-anchor':'end',
        fill:'#f9d894','font-size':9,'font-weight':700},'YOU'));
    }
  }
  const nodeName=nodes.find(node=>node.id===main)?.lines.join(' ') ?? main;
  const areaName=placeNames[region] ?? nodeName;
  const side=xPercent<34?'west side':xPercent>66?'east side':'middle';
  const level=region==='rootdeep'
    ? player.ground==='rootdeep-floor'||player.y>4500?' · Bedrock floor'
      : ' · Landing '+(player.ground?.match(/^rootdeep-level-(\d+)/)?.[1] ??
        Math.max(1,Math.min(8,Math.floor((player.y-250)/560)+1)))
    : '';
  here.textContent='You are in '+areaName+' · '+location+level+(mapParent[region]?' · inside':' · '+side);
  routes.replaceChildren();
  if(mapParent[region]) {
    const item=document.createElement('li');
    item.textContent='Leave this room to reach '+nodeName+'.';
    routes.append(item);
  }
  for(const edge of links) {
    if(!found.has(edge.from)||!found.has(edge.to)||edge.tunnel&&!tunnelOpen) continue;
    if(edge.from!==main&&edge.to!==main) continue;
    const other=nodes.find(node=>node.id===(edge.from===main?edge.to:edge.from));
    const item=document.createElement('li');
    item.textContent=edge.hint+' → '+other.lines.join(' ');
    routes.append(item);
  }
  if(!routes.children.length) {
    const item=document.createElement('li');
    item.textContent='Explore this region to uncover more paths.';
    routes.append(item);
  }
}
