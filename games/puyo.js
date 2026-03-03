// simple Puyo-like implementation
const COL = 6; const ROW = 12; const CELL = 30;
const COLORS = [null,'#ff595e','#1982c4','#8ac926','#ffca3a','#6a4c93'];

const canvas = document.getElementById('puyo-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('puyo-next');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('puyo-score');
const chainEl = document.getElementById('puyo-chain');
const levelEl = document.getElementById('puyo-level');
const overlay = document.getElementById('puyo-overlay');
const overlayTitle = document.getElementById('puyo-overlay-title');
const overlayScore = document.getElementById('puyo-overlay-score');
const restartBtn = document.getElementById('puyo-restart');

let grid, pair, nextPair, score=0, level=1, chain=0, gameOver=false, tickInterval=800, lastTime=0, paused=false;

function createGrid(){return Array.from({length:ROW},()=>Array(COL).fill(0));}
function randColor(){return Math.floor(Math.random()*(COLORS.length-1))+1}

function spawnPair(){pair = {x:Math.floor(COL/2), y:0, o:0, // orientation: 0 up,1 right,2 down,3 left
  a:randColor(), b:randColor()}; if(!canPlace(pair)) endGame();}
function createNext(){nextPair={a:randColor(),b:randColor()};}
function canPlace(p){const coords = pairCoords(p); return coords.every(([x,y])=>x>=0 && x<COL && y<ROW && (y<0 || !grid[y][x]));}
function pairCoords(p){let ax=p.x, ay=p.y; let bx=ax, by=ay; switch(p.o){case 0: by=ay-1; break;case 1: bx=ax+1; break;case 2: by=ay+1; break;case 3: bx=ax-1; break;} return [[ax,ay],[bx,by]]}

function lockPair(){const coords=pairCoords(pair); const vals=[pair.a,pair.b]; coords.forEach(([x,y],i)=>{if(y>=0 && y<ROW) grid[y][x]=vals[i]}); clearMatches(); spawnFromNext();}

function spawnFromNext(){pair = {x:Math.floor(COL/2),y:0,o:0,a:nextPair.a,b:nextPair.b}; createNext(); if(!canPlace(pair)) endGame();}

function rotatePair(){pair.o=(pair.o+1)%4; if(!canPlace(pair)) pair.o=(pair.o+3)%4}
function move(dx){pair.x+=dx; if(!canPlace(pair)) pair.x-=dx}
function softDrop(){pair.y++; if(!canPlace(pair)){pair.y--; lockPair(); lastTime=performance.now()}}
function hardDrop(){while(canPlace(pair)){pair.y++} pair.y--; lockPair();}

function draw(){ctx.clearRect(0,0,canvas.width,canvas.height); // grid
 ctx.strokeStyle='rgba(255,255,255,0.03)'; for(let r=0;r<ROW;r++)for(let c=0;c<COL;c++){ctx.strokeRect(c*CELL,r*CELL,CELL,CELL)}
 // blocks
 for(let r=0;r<ROW;r++)for(let c=0;c<COL;c++){if(grid[r][c]) drawCell(c,r,grid[r][c]);}
 // pair
 const coords=pairCoords(pair); const vals=[pair.a,pair.b]; coords.forEach((p,i)=>{const [x,y]=p; if(y>=0) drawCell(x,y,vals[i])});
 // next
 nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height); nextCtx.scale(1,1); nextCtx.fillStyle='#061028'; nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
 nextCtx.fillStyle='#fff'; nextCtx.font='12px sans-serif'; nextCtx.fillText('NEXT',8,14);
 drawNext(nextPair);
 scoreEl.textContent=score; chainEl.textContent=chain; levelEl.textContent=level;
}
function drawCell(x,y,colorIdx){ctx.fillStyle=COLORS[colorIdx]; ctx.fillRect(x*CELL+2,y*CELL+2,CELL-4,CELL-4); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(x*CELL+2,y*CELL+2,(CELL-4),4)}
function drawNext(n){const ox=10, oy=30; const s=20; nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height); nextCtx.fillStyle='#061028'; nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height); nextCtx.fillStyle=COLORS[n.a]; nextCtx.fillRect(ox,oy,s,s); nextCtx.fillStyle=COLORS[n.b]; nextCtx.fillRect(ox,oy+s+4,s,s)}

function clearMatches(){let visited=Array.from({length:ROW},()=>Array(COL).fill(false)); let toClear=[]; let chains=0;
 for(let r=0;r<ROW;r++)for(let c=0;c<COL;c++){const color=grid[r][c]; if(!color || visited[r][c]) continue; let group=[]; let stack=[[r,c]]; visited[r][c]=true; while(stack.length){const [y,x]=stack.pop(); group.push([y,x]); const d=[[1,0],[-1,0],[0,1],[0,-1]]; d.forEach(([dy,dx])=>{const ny=y+dy,nx=x+dx; if(ny>=0&&ny<ROW&&nx>=0&&nx<COL&&!visited[ny][nx]&&grid[ny][nx]===color){visited[ny][nx]=true; stack.push([ny,nx]);}})} if(group.length>=4){toClear=toClear.concat(group);} }
 if(toClear.length===0) return; // remove and apply gravity, count chain
 chains++; chain++; score+=toClear.length*10*chains; toClear.forEach(([y,x])=>grid[y][x]=0);
 applyGravity(); // after gravity, check again for chain combos recursively
 setTimeout(()=>{clearMatches();},120);
}

function applyGravity(){for(let c=0;c<COL;c++){let write=ROW-1; for(let r=ROW-1;r>=0;r--){if(grid[r][c]){grid[write][c]=grid[r][c]; if(write!==r) grid[r][c]=0; write--; }} for(let r=write;r>=0;r--) grid[r][c]=0; }}

function endGame(){gameOver=true; overlayTitle.textContent='ゲームオーバー'; overlayScore.textContent='スコア: '+score; overlay.classList.remove('hidden');}

function loop(time=0){if(gameOver||paused) return; if(!lastTime) lastTime=time; if(time-lastTime>tickInterval){softDrop(); lastTime=time;} draw(); requestAnimationFrame(loop);}

// touch/keyboard
document.addEventListener('keydown',e=>{switch(e.code){case 'ArrowLeft':move(-1);break;case 'ArrowRight':move(1);break;case 'ArrowUp':rotatePair();break;case 'ArrowDown':softDrop();break;case 'Space':hardDrop();break;}});
['p-left','p-right','p-rotate','p-drop'].forEach(id=>{const el=document.getElementById(id); if(el){el.addEventListener('touchstart',e=>{e.preventDefault(); if(id==='p-left')move(-1); if(id==='p-right')move(1); if(id==='p-rotate')rotatePair(); if(id==='p-drop')softDrop();});}});

restartBtn.addEventListener('click',()=>{overlay.classList.add('hidden'); init();});

function init(){grid=createGrid(); score=0; chain=0; level=1; tickInterval=800; gameOver=false; createNext(); spawnFromNext(); draw(); requestAnimationFrame(loop);} 

init();
