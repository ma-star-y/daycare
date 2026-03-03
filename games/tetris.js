// ==================== 定数 ====================
const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#00cfcf', // I - シアン
  '#0040ff', // J - 青
  '#ff8800', // L - オレンジ
  '#ffdd00', // O - 黄
  '#00cc00', // S - 緑
  '#9900cc', // T - 紫
  '#cc0000', // Z - 赤
];

const TETROMINOES = [
  null,
  // I
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  // J
  [[2,0,0],[2,2,2],[0,0,0]],
  // L
  [[0,0,3],[3,3,3],[0,0,0]],
  // O
  [[4,4],[4,4]],
  // S
  [[0,5,5],[5,5,0],[0,0,0]],
  // T
  [[0,6,0],[6,6,6],[0,0,0]],
  // Z
  [[7,7,0],[0,7,7],[0,0,0]],
];

// ==================== キャンバス設定 ====================
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const difficultySelect = document.getElementById('difficulty-select');
const cpuToggle = document.getElementById('cpu-toggle');

// ==================== ゲーム状態 ====================
let board, piece, nextPiece, score, level, lines, dropInterval, lastTime, paused, gameOver;

// 設定
let difficulty = 3;          // 1〜5
let cpuEnabled = false;

// ==================== CPU状態 ====================
let cpuBoard, cpuPiece, cpuNextPiece, cpuScore, cpuLevel, cpuLines, cpuDropInterval, cpuLastTime;
let cpuCanvas = document.getElementById('cpu-board');
let cpuCtx = cpuCanvas ? cpuCanvas.getContext('2d') : null;
let cpuScoreEl = document.getElementById('cpu-score');

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/* CPU用関数はプレイヤー用とほぼ同じだが、stateがcpuになるだけ */
function cpuCreateBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function cpuCollides(p) {
  return p.matrix.some((row, dy) =>
    row.some((val, dx) => {
      if (!val) return false;
      const nx = p.x + dx;
      const ny = p.y + dy;
      return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && cpuBoard[ny][nx]);
    })
  );
}

function cpuMerge() {
  cpuPiece.matrix.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) cpuBoard[cpuPiece.y + dy][cpuPiece.x + dx] = val;
    });
  });
}

function cpuClearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (cpuBoard[y].every(v => v !== 0)) {
      cpuBoard.splice(y, 1);
      cpuBoard.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }
  if (cleared === 0) return;

  const points = [0, 100, 300, 500, 800];
  cpuScore += (points[cleared] || 800) * cpuLevel;
  cpuLines += cleared;
  cpuLevel = Math.floor(cpuLines / 10) + 1;
  cpuDropInterval = Math.max(50, 1000 - (difficulty) * 200);

  if (cpuScoreEl) cpuScoreEl.textContent = cpuScore;
}

function createPiece(type) {
  return {
    type,
    matrix: TETROMINOES[type].map(row => [...row]),
    x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type][0].length / 2),
    y: 0,
  };
}

function randomType() {
  return Math.floor(Math.random() * 7) + 1;
}

// ==================== 描画 ====================
function drawBlock(ctx, x, y, colorIndex, alpha = 1) {
  const color = COLORS[colorIndex];
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);

  // ハイライト (上・左)
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, 4);
  ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, 4, BLOCK - 2);

  // シャドウ (下・右)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x * BLOCK + 1, y * BLOCK + BLOCK - 5, BLOCK - 2, 4);
  ctx.fillRect(x * BLOCK + BLOCK - 5, y * BLOCK + 1, 4, BLOCK - 2);

  ctx.globalAlpha = 1;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // グリッド線
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
  }

  // ボード上のブロック
  board.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) drawBlock(ctx, x, y, val);
    });
  });
}

function drawPiece(p, context = ctx, offsetX = 0, offsetY = 0) {
  p.matrix.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) drawBlock(context, p.x + dx + offsetX, p.y + dy + offsetY, val);
    });
  });
}

function drawGhost() {
  const ghost = { ...piece, matrix: piece.matrix.map(r => [...r]) };
  while (!collides(ghost)) ghost.y++;
  ghost.y--;

  ghost.matrix.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) {
        const gx = (ghost.x + dx) * BLOCK;
        const gy = (ghost.y + dy) * BLOCK;
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = COLORS[val];
        ctx.fillRect(gx + 1, gy + 1, BLOCK - 2, BLOCK - 2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = COLORS[val];
        ctx.lineWidth = 1;
        ctx.strokeRect(gx + 1, gy + 1, BLOCK - 2, BLOCK - 2);
      }
    });
  });
}

// CPU描画
function cpuDrawBoard() {
  if (!cpuCtx) return;
  cpuCtx.clearRect(0, 0, cpuCanvas.width, cpuCanvas.height);
  cpuCtx.strokeStyle = 'rgba(255,255,255,0.04)';
  cpuCtx.lineWidth = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cpuCtx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
  }
  cpuBoard.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) drawBlock(cpuCtx, x, y, val);
    });
  });
}

function cpuDrawPiece(p) {
  if (!cpuCtx) return;
  p.matrix.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) drawBlock(cpuCtx, p.x + dx, p.y + dy, val);
    });
  });
}

function cpuDrawNextPiece() {
  if (!cpuCtx) return;
  // reuse original nextCtx? For simplicity we skip.
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const m = nextPiece.matrix;
  const offX = Math.floor((4 - m[0].length) / 2);
  const offY = Math.floor((4 - m.length) / 2);
  m.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) drawBlock(nextCtx, dx + offX, dy + offY, val);
    });
  });
}

// ==================== ゲームロジック ====================
function collides(p) {
  return p.matrix.some((row, dy) =>
    row.some((val, dx) => {
      if (!val) return false;
      const nx = p.x + dx;
      const ny = p.y + dy;
      return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx]);
    })
  );
}

function merge() {
  piece.matrix.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) board[piece.y + dy][piece.x + dx] = val;
    });
  });
}

function rotate(matrix) {
  const N = matrix.length;
  return matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]).reverse());
}

function rotatePiece() {
  const original = piece.matrix;
  piece.matrix = rotate(piece.matrix);
  // Wall kick
  if (collides(piece)) {
    piece.x--;
    if (collides(piece)) {
      piece.x += 2;
      if (collides(piece)) {
        piece.x--;
        piece.matrix = original;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(v => v !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++; // 同じ行を再チェック
    }
  }
  if (cleared === 0) return;

  const points = [0, 100, 300, 500, 800];
  score += (points[cleared] || 800) * level;
  lines += cleared;
  level = Math.floor(lines / 10) + 1;
  dropInterval = Math.max(100, 1000 - (level - 1) * 100);

  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
}

function spawnPiece() {
  piece = { ...nextPiece, matrix: nextPiece.matrix.map(r => [...r]) };
  piece.x = Math.floor(COLS / 2) - Math.floor(piece.matrix[0].length / 2);
  piece.y = 0;
  nextPiece = createPiece(randomType());
  drawNextPiece();

  if (collides(piece)) {
    endGame();
  }
}

function cpuCreatePiece(type) {
  return {
    type,
    matrix: TETROMINOES[type].map(row => [...row]),
    x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type][0].length / 2),
    y: 0,
  };
}

function cpuSpawnPiece() {
  cpuPiece = { ...cpuNextPiece, matrix: cpuNextPiece.matrix.map(r => [...r]) };
  cpuPiece.x = Math.floor(COLS / 2) - Math.floor(cpuPiece.matrix[0].length / 2);
  cpuPiece.y = 0;
  cpuNextPiece = cpuCreatePiece(randomType());
  if (cpuCollides(cpuPiece)) {
    // CPU負け、ほっとく
    cpuBoard = cpuCreateBoard();
  }
}

function drop() {
  piece.y++;
  if (collides(piece)) {
    piece.y--;
    merge();
    clearLines();
    spawnPiece();
  }
}

function hardDrop() {
  while (!collides(piece)) piece.y++;
  piece.y--;
  merge();
  clearLines();
  spawnPiece();
}

// CPU用ドロップ
function cpuDrop() {
  cpuPiece.y++;
  if (cpuCollides(cpuPiece)) {
    cpuPiece.y--;
    cpuMerge();
    cpuClearLines();
    cpuSpawnPiece();
  }
}

function cpuHardDrop() {
  while (!cpuCollides(cpuPiece)) cpuPiece.y++;
  cpuPiece.y--;
  cpuMerge();
  cpuClearLines();
  cpuSpawnPiece();
}

// 簡易AI: 各位置・回転をシミュレーションして最適を求める
function cpuEvaluateBoard(grid) {
  let totalHeight = 0;
  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let colHeight = 0;
    let blockFound = false;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c]) {
        if (!blockFound) {
          blockFound = true;
          colHeight = ROWS - r;
        }
      } else {
        if (blockFound) holes++;
      }
    }
    totalHeight += colHeight;
  }
  return totalHeight * 5 + holes * 15;
}

function cpuComputeBestMove() {
  let best = null;
  const originalY = cpuPiece.y;
  let rotations = [];
  let m = cpuPiece.matrix;
  for (let i = 0; i < 4; i++) {
    rotations.push(m);
    m = rotate(m);
  }
  rotations = rotations.filter((v, i, a) => a.indexOf(v) === i);

  rotations.forEach(rotMatrix => {
    const width = rotMatrix[0].length;
    for (let x = -3; x < COLS; x++) {
      let test = { matrix: rotMatrix, x: x, y: cpuPiece.y };
      while (!cpuCollides(test)) test.y++;
      test.y--;
      if (cpuCollides(test) && test.y === cpuPiece.y) continue;
      let gridCopy = cpuBoard.map(row => row.slice());
      rotMatrix.forEach((row, dy) => {
        row.forEach((val, dx) => {
          if (val) {
            let tx = x + dx;
            let ty = test.y + dy;
            if (ty >= 0 && tx >= 0 && tx < COLS && ty < ROWS) {
              gridCopy[ty][tx] = val;
            }
          }
        });
      });
      let score = cpuEvaluateBoard(gridCopy);
      if (!best || score < best.score) {
        best = { score, x, matrix: rotMatrix };
      }
    }
  });
  if (best) {
    cpuPiece.matrix = best.matrix;
    cpuPiece.x = best.x;
  }
}

function cpuMoveAI() {
  if (cpuEnabled) {
    // 難易度に応じて選択法を変える
    if (difficulty <= 2 && Math.random() < 0.3) {
      // 低難易度はランダム
      cpuPiece.x = Math.floor(Math.random() * COLS);
    } else {
      cpuComputeBestMove();
    }
    cpuHardDrop();
  }
}

function drop() {
  piece.y++;
  if (collides(piece)) {
    piece.y--;
    merge();
    clearLines();
    spawnPiece();
  }
}

function hardDrop() {
  while (!collides(piece)) piece.y++;
  piece.y--;
  merge();
  clearLines();
  spawnPiece();
}

function moveLeft() {
  piece.x--;
  if (collides(piece)) piece.x++;
}

function moveRight() {
  piece.x++;
  if (collides(piece)) piece.x--;
}

// ==================== ゲームループ ====================
function update(time = 0) {
  if (gameOver || paused) return;

  const delta = time - lastTime;
  if (delta > dropInterval) {
    drop();
    lastTime = time;
  }

  drawBoard();
  drawGhost();
  drawPiece(piece);

  if (cpuEnabled) {
    const cpuDelta = time - cpuLastTime;
    if (cpuDelta > cpuDropInterval) {
      cpuMoveAI();
      cpuLastTime = time;
    }
    cpuDrawBoard();
    if (cpuPiece) cpuDrawPiece(cpuPiece);
  }

  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  overlayTitle.textContent = 'ゲームオーバー';
  overlayScore.textContent = `スコア: ${score}`;
  document.getElementById('menu').style.display = 'none';
  overlay.classList.remove('hidden');
}

function startGame() {
  board = createBoard();
  score = 0;
  level = 1;
  lines = 0;
  dropInterval = Math.max(100, 1000 - (difficulty - 1) * 150);
  lastTime = 0;
  paused = false;
  gameOver = false;

  scoreEl.textContent = '0';
  levelEl.textContent = '1';
  linesEl.textContent = '0';

  overlay.classList.add('hidden');

  nextPiece = createPiece(randomType());
  spawnPiece();

  if (cpuEnabled && cpuCtx) {
    document.getElementById('cpu-container').classList.remove('hidden');
    cpuBoard = cpuCreateBoard();
    cpuScore = 0;
    cpuLevel = 1;
    cpuLines = 0;
    cpuDropInterval = Math.max(50, 1000 - difficulty * 200);
    cpuLastTime = 0;
    cpuNextPiece = cpuCreatePiece(randomType());
    cpuSpawnPiece();
    if (cpuScoreEl) cpuScoreEl.textContent = '0';
  } else {
    document.getElementById('cpu-container').classList.add('hidden');
  }

  requestAnimationFrame(update);
}

// ==================== タッチ操作 ====================
if (document.getElementById('btn-left')) {
  document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); moveLeft(); });
  document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); moveRight(); });
  document.getElementById('btn-rotate').addEventListener('touchstart', (e) => { e.preventDefault(); rotatePiece(); });
  document.getElementById('btn-drop').addEventListener('touchstart', (e) => { e.preventDefault(); drop(); lastTime = performance.now(); });
  document.getElementById('btn-harddrop').addEventListener('touchstart', (e) => { e.preventDefault(); hardDrop(); });
}

// ==================== キーボード操作 ====================
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  switch (e.code) {
    case 'ArrowLeft':
      e.preventDefault();
      moveLeft();
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveRight();
      break;
    case 'ArrowDown':
      e.preventDefault();
      drop();
      lastTime = performance.now();
      break;
    case 'ArrowUp':
      e.preventDefault();
      rotatePiece();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
    case 'KeyP':
      paused = !paused;
      if (!paused) {
        lastTime = performance.now();
        requestAnimationFrame(update);
      }
      break;
  }
});

restartBtn.addEventListener('click', () => {
  // ゲームオーバー時は設定画面を再表示
  overlayTitle.textContent = 'テトリス';
  overlayScore.textContent = '';
  document.getElementById('menu').style.display = 'block';
  overlay.classList.remove('hidden');
});

startBtn.addEventListener('click', () => {
  difficulty = parseInt(difficultySelect.value, 10);
  cpuEnabled = cpuToggle.checked;
  document.getElementById('menu').style.display = 'none';
  startGame();
});

// ==================== 起動 ====================
// 最初に設定メニューを表示
overlayTitle.textContent = 'テトリス';
overlayScore.textContent = '';
document.getElementById('menu').style.display = 'block';
overlay.classList.remove('hidden');
