const wallTexture = document.getElementById("wallTexture");
const textureSize = 360; // Assuming 64x64 texture

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let statBarWidth = window.innerWidth;
let statBarHeight = 0;

virtualScreenWidth = canvas.width;
virtualScreenHeight = canvas.height - statBarHeight;

const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,1,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const mapWidth = map[0].length;
const mapHeight = map.length;
const tileSize = 64;

let posX = 100;
let posY = tileSize * 18;
let dir = 0;

let targetDir = dir;      // The desired direction player wants to face
const rotationSpeed = 0.02;  // radians per frame for smooth rotation
const moveSpeed = 0.15;    // units per second

const flashlightAngle = -1;//Math.PI/10000000;
const fov = Math.PI / 2;
const numRays = virtualScreenWidth;
const maxDepth = 1000;

function castRays() {
  const minimapScale = Math.floor((statBarHeight)/mapHeight); // minimap tile size in pixels
  const xOffset = virtualScreenWidth - mapWidth * minimapScale;
  const yOffset = canvas.height - mapHeight * minimapScale;
	ctx.fillStyle = "#000";
    ctx.fillRect(xOffset, yOffset, minimapScale * mapWidth, minimapScale * mapHeight);

  // Draw minimap tiles
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      ctx.fillStyle = map[y][x] ? "#999" : "#222";
      ctx.fillRect(xOffset + x * minimapScale, yOffset + y * minimapScale, minimapScale, minimapScale);
    }
  }

  const px = posX / tileSize;
  const py = posY / tileSize;

  for (let i = 0; i < numRays; i++) {
    const rayAngle = dir - fov / 2 + (i / numRays) * fov;
    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);

    let mapX = Math.floor(px);
    let mapY = Math.floor(py);

    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    let sideDistX = rayDirX < 0
      ? (px - mapX) * deltaDistX
      : (mapX + 1 - px) * deltaDistX;

    let sideDistY = rayDirY < 0
      ? (py - mapY) * deltaDistY
      : (mapY + 1 - py) * deltaDistY;

    let hit = false;
    let side = 0;

    while (!hit) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (
        mapX < 0 || mapX >= mapWidth ||
        mapY < 0 || mapY >= mapHeight
      ) break;

      if (map[mapY][mapX] > 0) hit = true;
    }

    // Perpendicular wall distance
    let distance;
    const rayDir = [rayDirX, rayDirY];
const playerDir = [Math.cos(dir), Math.sin(dir)];

if (side === 0) {
  distance = (mapX - px + (1 - stepX) / 2) / rayDirX;
} else {
  distance = (mapY - py + (1 - stepY) / 2) / rayDirY;
}

let wallX; // where exactly the wall was hit
if (side === 0) {
  wallX = py + distance * rayDirY;
} else {
  wallX = px + distance * rayDirX;
}
wallX -= Math.floor(wallX); // only the fractional part remains

// x coordinate on the texture
let texX = Math.floor(wallX * textureSize);
if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
  texX = textureSize - texX - 1; // flip texture horizontally for some directions
}


// Correct for fisheye by projecting distance onto player's direction vector:
const correctedDist = distance * Math.cos(rayAngle - dir);


   // const wallHeight =  Math.min(virtualScreenHeight,virtualScreenHeight / (distance || 0.0001););
    const wallHeight = virtualScreenHeight / (distance || 0.0001)
	const yStart = (virtualScreenHeight - wallHeight) / 2;



    

	if(Math.abs(dir - rayAngle) <= flashlightAngle / 2){
		const shade = 255;
		 ctx.fillStyle = side === 1
      ? `rgb(${shade * 0.7}, ${shade * 0.7}, ${shade * 0.7})`
      : `rgb(${shade}, ${shade}, ${shade})`;
	}else{
		const shade = 255 - Math.min(255, distance * 15);
		 ctx.fillStyle = side === 1
      ? `rgb(${shade * 0.7}, ${shade * 0.7}, ${shade * 0.7})`
      : `rgb(${shade}, ${shade}, ${shade})`;
   
	}	
	
    ctx.drawImage(
		wallTexture,
		texX, 0 /*+ Math.abs(Math.max(0,textureSize * ((wallHeight/virtualScreenHeight) - 1)/2))*/, 1, textureSize,       // source: 1-pixel vertical strip of texture
		i, yStart, 1, wallHeight       // dest: vertical column on canvas
		);
	
    // Draw this ray on minimap (reduced resolution)
    /*if (i % 10 === 0) {
      const hitX = (px + rayDirX * distance) * minimapScale;
      const hitY = (py + rayDirY * distance) * minimapScale;

      ctx.strokeStyle = (Math.abs(dir - rayAngle) <= flashlightAngle / 2) ? "rgba(255,255,255,0.3)" : "rgba(255,255,0,0.3)";
      ctx.beginPath();
      ctx.moveTo(xOffset + px * minimapScale, yOffset + py * minimapScale);
      ctx.lineTo(xOffset + hitX, yOffset + hitY);
      ctx.stroke();
    }*/
  }

  // Draw player on minimap
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(xOffset + px * minimapScale, yOffset + py * minimapScale, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw direction line
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(xOffset + px * minimapScale, yOffset + py * minimapScale);
  ctx.lineTo(
    xOffset + (px + Math.cos(dir) * 0.5) * minimapScale,
    yOffset + (py + Math.sin(dir) * 0.5) * minimapScale
  );
  ctx.stroke();
}

let lastTime = performance.now();
let fps = 0;
let maxFps = 0;
let minFps = Math.pow(2, 16);
let fpsSamples = 0;
let fpsSum = 0;

function drawFPS() {
  ctx.fillStyle = "white";
  ctx.font = "32px monospace";
  maxFps = Math.max(fps, maxFps);
  minFps = Math.min(fps, minFps);
  if(fpsSamples < 10){
	maxFps = 0;
	minFps = Math.pow(2, 16);
  }
  fpsSamples++;
  fpsSum += fps;
  ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);
  ctx.fillText(`Max: ${Math.round(maxFps)}`, 10, 50);
  ctx.fillText(`Min: ${Math.round(minFps)}`, 10, 80);
  ctx.fillText(`Avg: ${Math.round(fpsSum/fpsSamples)}`, 10, 110);
}

function gameLoop() {
  const now = performance.now();
  const delta = now - lastTime;
  lastTime = now;

fps = 1000 / delta;

updatePlayerRotation();
  updatePlayerPosition(delta);

  ctx.clearRect(0, 0, virtualScreenWidth, virtualScreenHeight);
  castRays();
  drawFPS();

  requestAnimationFrame(gameLoop);
}

let movingForward = false;
let movingBackward = false;
let rotatingLeft = false;
let rotatingRight = false;

// Listen for key presses
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case "ArrowUp":
      movingForward = true;
      break;
    case "ArrowDown":
	case "s":
	case "S":
      movingBackward = true;
      break;
    case "ArrowLeft":
      rotatingLeft = true;
      break;
    case "ArrowRight":
      rotatingRight = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case "ArrowUp":
      movingForward = false;
      break;
    case "ArrowDown":
	case "s":
	case "S":
      movingBackward = false;
      break;
    case "ArrowLeft":
      rotatingLeft = false;
      break;
    case "ArrowRight":
      rotatingRight = false;
      break;
  }
});

function updatePlayerRotation() {
  if (rotatingLeft) {
    targetDir -= rotationSpeed;
  }
  if (rotatingRight) {
    targetDir += rotationSpeed;
  }

  // Normalize targetDir
  while (targetDir < 0) targetDir += 2 * Math.PI;
  while (targetDir >= 2 * Math.PI) targetDir -= 2 * Math.PI;

  // Smoothly interpolate dir to targetDir
  let diff = targetDir - dir;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  if (Math.abs(diff) < rotationSpeed) {
    dir = targetDir;
  } else {
    dir += Math.sign(diff) * rotationSpeed;
  }
}

function updatePlayerPosition(deltaTime) {
  let moveX = 0;
  let moveY = 0;

  if (movingForward) {
    moveX += Math.cos(dir);
    moveY += Math.sin(dir);
  }
  if (movingBackward) {
    moveX -= Math.cos(dir);
    moveY -= Math.sin(dir);
  }

  // Normalize
  const length = Math.hypot(moveX, moveY);
  if (length > 0) {
    moveX /= length;
    moveY /= length;
  }

  // Calculate new position with collision detection
  const newX = posX + moveX * moveSpeed * deltaTime;
  const newY = posY + moveY * moveSpeed * deltaTime;

  // Check collision X axis
  const tileX = Math.floor(newX / tileSize);
  const tileY = Math.floor(posY / tileSize);
  if (map[tileY] && map[tileY][tileX] === 0) {
    posX = newX;
  }

  // Check collision Y axis
  const tileX2 = Math.floor(posX / tileSize);
  const tileY2 = Math.floor(newY / tileSize);
  if (map[tileY2] && map[tileY2][tileX2] === 0) {
    posY = newY;
  }
}


//window.addEventListener("keydown", updatePlayerPosition);
//window.addEventListener("keydown", updatePlayerRotation);
wallTexture.onload = () => {
  gameLoop();
};

