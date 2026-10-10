import {
  DOG_RUN_DOG_X,
  DOG_RUN_RUNNER_X,
  DOG_RUN_SPEED,
  type DogRunState,
} from './dog-run';

export const DOG_RUN_WIDTH = 1000;
export const DOG_RUN_HEIGHT = 440;
const GROUND = 344;

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function path(ctx: CanvasRenderingContext2D, points: [number, number][], fill: string, stroke?: string) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function line(ctx: CanvasRenderingContext2D, from: [number, number], to: [number, number], color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(...from);
  ctx.lineTo(...to);
  ctx.stroke();
}

function drawBackground(ctx: CanvasRenderingContext2D, time: number, ending: boolean) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#f5e9d7');
  sky.addColorStop(0.72, '#f4efe6');
  sky.addColorStop(1, '#e5e4d8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, DOG_RUN_WIDTH, GROUND);
  ellipse(ctx, 782, 75, 49, 49, 'rgba(223,183,126,.38)');
  ellipse(ctx, 782, 75, 30, 30, 'rgba(247,222,171,.72)');

  const hillOffset = (time * 14) % 1000;
  for (let repeat = -1; repeat <= 1; repeat++) {
    const x = repeat * 1000 - hillOffset;
    ctx.fillStyle = '#d9dbcf';
    ctx.beginPath();
    ctx.moveTo(x - 10, 300);
    ctx.bezierCurveTo(x + 190, 208, x + 320, 296, x + 500, 262);
    ctx.bezierCurveTo(x + 700, 225, x + 820, 245, x + 1010, 296);
    ctx.lineTo(x + 1010, GROUND);
    ctx.lineTo(x - 10, GROUND);
    ctx.fill();
  }

  const treeOffset = (time * 48) % 360;
  for (let i = -1; i < 5; i++) {
    const x = i * 360 - treeOffset + 125;
    line(ctx, [x, 300], [x, 220], '#8d7d6b', 9);
    ellipse(ctx, x, 209, 36, 47, '#bbc2aa');
    ellipse(ctx, x - 20, 223, 26, 31, '#cad0b7');
    ellipse(ctx, x + 20, 220, 25, 30, '#abb79c');
  }

  const fenceOffset = (time * 96) % 98;
  ctx.strokeStyle = '#c4b7a3';
  ctx.lineWidth = 3;
  for (let x = -fenceOffset; x < 1050; x += 98) {
    line(ctx, [x, 292], [x, 335], '#c6b8a4', 5);
  }
  line(ctx, [0, 304], [1000, 304], '#d2c5b3', 3);
  line(ctx, [0, 328], [1000, 328], '#d2c5b3', 3);

  if (ending || time >= 14) drawHouse(ctx, 1230 - 82 * Math.max(0, time - 14));

  ctx.fillStyle = '#d9d7c8';
  ctx.fillRect(0, GROUND - 8, 1000, 8);
  const road = ctx.createLinearGradient(0, GROUND, 0, DOG_RUN_HEIGHT);
  road.addColorStop(0, '#d2c4af');
  road.addColorStop(1, '#bda98f');
  ctx.fillStyle = road;
  ctx.fillRect(0, GROUND, 1000, 96);
  line(ctx, [0, GROUND + 2], [1000, GROUND + 2], '#f8f1e4', 3);
  const pavingOffset = (time * DOG_RUN_SPEED * .38) % 170;
  for (let x = -pavingOffset; x < 1100; x += 170) {
    line(ctx, [x, 410], [x + 36, 410], 'rgba(255,250,239,.42)', 2);
  }
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number) {
  ctx.save();
  ctx.translate(x, 0);
  ellipse(ctx, 105, GROUND - 3, 148, 11, 'rgba(84,64,48,.14)');
  ctx.fillStyle = '#f8efe0';
  ctx.fillRect(-2, 165, 205, 178);
  ctx.strokeStyle = '#bea78e';
  ctx.lineWidth = 2;
  ctx.strokeRect(-2, 165, 205, 178);
  path(ctx, [[-23, 171], [101, 86], [225, 171]], '#8c6358', '#694a42');
  path(ctx, [[-11, 168], [101, 98], [213, 168]], '#a47668');
  ctx.fillStyle = '#bf9a6d';
  ctx.fillRect(149, 106, 20, 48);
  ctx.fillStyle = '#e4d5bf';
  ctx.fillRect(22, 205, 52, 57);
  ctx.fillRect(133, 205, 52, 57);
  ctx.fillStyle = '#8a9d99';
  ctx.fillRect(26, 209, 44, 49);
  ctx.fillRect(137, 209, 44, 49);
  line(ctx, [48, 210], [48, 258], '#f9f0df', 3);
  line(ctx, [159, 210], [159, 258], '#f9f0df', 3);
  line(ctx, [26, 233], [70, 233], '#f9f0df', 3);
  line(ctx, [137, 233], [181, 233], '#f9f0df', 3);
  ctx.fillStyle = '#71534b';
  ctx.fillRect(85, 239, 44, 104);
  ctx.fillStyle = '#ad8a68';
  ctx.fillRect(91, 246, 32, 97);
  ellipse(ctx, 117, 295, 2.4, 2.4, '#f3dcae');
  ellipse(ctx, 37, 333, 29, 15, '#8fa37e');
  ellipse(ctx, 183, 333, 31, 17, '#8fa37e');
  ctx.restore();
}

function drawRunner(ctx: CanvasRenderingContext2D, x: number, time: number, jumpHeight: number, finished: boolean) {
  const cadence = time * 17;
  const stride = finished ? 0 : Math.sin(cadence) * 18;
  const bob = jumpHeight ? 0 : finished ? 0 : Math.abs(Math.sin(cadence)) * 3;
  const y = GROUND - jumpHeight - bob;
  ellipse(ctx, x, GROUND + 2, Math.max(12, 27 - jumpHeight * .1), 5, 'rgba(65,44,37,.19)');
  ctx.save();
  ctx.translate(x, y);
  // Legs and soft running shoes.
  line(ctx, [-5, -39], [-13 + stride, -10], '#664447', 10);
  line(ctx, [-13 + stride, -10], [-22 + stride * .7, -1], '#664447', 8);
  line(ctx, [8, -39], [15 - stride, -8], '#77504d', 10);
  line(ctx, [15 - stride, -8], [24 - stride * .7, -1], '#77504d', 8);
  ellipse(ctx, -22 + stride * .7, -1, 13, 5, '#f6ead7');
  ellipse(ctx, 24 - stride * .7, -1, 13, 5, '#f6ead7');

  // Hair behind the neck, with individual curls.
  ellipse(ctx, -7, -99, 28, 30, '#51392f');
  for (const [hx, hy, r] of [[-28,-111,11],[-20,-125,12],[-5,-132,11],[11,-128,10],[18,-115,10],[-29,-94,10],[-20,-83,9]] as const) {
    ellipse(ctx, hx, hy, r, r, '#5e4133');
    ellipse(ctx, hx - 3, hy - 3, r * .4, r * .38, 'rgba(152,105,72,.28)');
  }
  // Torso, arms, neck and face.
  path(ctx, [[-15,-86],[11,-88],[19,-50],[-16,-48]], '#e7d8bd', '#9d7b68');
  path(ctx, [[-15,-50],[19,-50],[15,-34],[-13,-34]], '#794c4a');
  line(ctx, [-13, -78], [-25 + stride * .35, -63], '#d2a88b', 8);
  line(ctx, [-25 + stride * .35, -63], [-13 + stride * .4, -49], '#d2a88b', 7);
  line(ctx, [13, -77], [28 - stride * .4, -59], '#d2a88b', 8);
  line(ctx, [28 - stride * .4, -59], [17 - stride * .35, -48], '#d2a88b', 7);
  ellipse(ctx, 1, -105, 18, 23, '#d8ae91');
  ellipse(ctx, 15, -104, 3, 5, '#c39477');
  ellipse(ctx, 8, -108, 1.7, 1.8, '#40322e');
  ctx.strokeStyle = '#9c695d';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(9, -98, 4, .2, 1.9);
  ctx.stroke();
  // The curl framing her face stays visible while running.
  for (const [hx,hy,r] of [[-15,-121,10],[-4,-129,12],[9,-128,10],[-22,-108,8]] as const) ellipse(ctx,hx,hy,r,r,'#604233');
  ctx.restore();
}

function drawDog(ctx: CanvasRenderingContext2D, x: number, time: number, finished: boolean) {
  const bounce = finished ? 0 : Math.abs(Math.sin(time * 20)) * 3;
  const paw = finished ? 0 : Math.sin(time * 20) * 9;
  ctx.save();
  ctx.translate(x, GROUND - bounce);
  ellipse(ctx, 0, bounce + 2, 43, 5, 'rgba(65,44,37,.18)');
  // Short legs behind the barrel-shaped body.
  line(ctx, [-24, -34], [-28 + paw, -2], '#716c61', 11);
  line(ctx, [15, -35], [20 - paw, -2], '#706a60', 11);
  ellipse(ctx, -28 + paw, -2, 10, 5, '#5e5c54');
  ellipse(ctx, 20 - paw, -2, 10, 5, '#5e5c54');
  ellipse(ctx, -8, -50, 42, 30, '#82796e');
  ellipse(ctx, 12, -43, 27, 21, '#9a8b7a');
  ellipse(ctx, -38, -55, 10, 6, '#82796e');
  // French bulldog ears, broad forehead and dark mask.
  path(ctx, [[21,-73],[16,-103],[34,-92],[37,-74]], '#716a60', '#564f49');
  path(ctx, [[47,-75],[54,-105],[66,-94],[59,-68]], '#716a60', '#564f49');
  path(ctx, [[23,-79],[21,-96],[31,-89]], '#b79687');
  path(ctx, [[52,-82],[55,-97],[62,-91]], '#b79687');
  ellipse(ctx, 43, -68, 28, 30, '#898176');
  ellipse(ctx, 52, -55, 20, 18, '#69645d');
  ellipse(ctx, 60, -49, 13, 9, '#aa9b8b');
  ellipse(ctx, 68, -52, 5, 4, '#3e3a37');
  ellipse(ctx, 34, -73, 3, 3, '#302e2a');
  ellipse(ctx, 52, -73, 3, 3, '#302e2a');
  ellipse(ctx, 33, -74, 1, 1, '#f8f4e9');
  ellipse(ctx, 51, -74, 1, 1, '#f8f4e9');
  ctx.strokeStyle = '#544e48';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(60, -45, 6, .1, 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, age: number) {
  const appear = Math.min(1, age * 10);
  ctx.save();
  ctx.translate(x, GROUND);
  ctx.scale(appear, appear);
  ellipse(ctx, 0, 0, 22, 5, 'rgba(59,43,34,.2)');
  ellipse(ctx, 0, -7, 18, 10, '#6b4c3b');
  ellipse(ctx, 1, -17, 13, 10, '#765342');
  ellipse(ctx, 2, -25, 7, 7, '#805a45');
  ellipse(ctx, -5, -20, 2.4, 2.4, 'rgba(181,139,103,.3)');
  if (age < .55) {
    const puff = age / .55;
    ctx.strokeStyle = `rgba(123,94,75,${.28 * (1 - puff)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -13, 25 + puff * 17, 11 + puff * 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawDogRun(ctx: CanvasRenderingContext2D, run: DogRunState | null, finishProgress = 0, reducedMotion = false) {
  const elapsed = run?.elapsed ?? 0;
  const finishing = run?.phase === 'finishing';
  ctx.clearRect(0, 0, DOG_RUN_WIDTH, DOG_RUN_HEIGHT);
  drawBackground(ctx, reducedMotion ? (finishing ? 20 : 0) : elapsed, finishing || elapsed >= 14);
  for (const obstacle of run?.obstacles ?? []) drawObstacle(ctx, obstacle.x, obstacle.age);
  const dogX = DOG_RUN_DOG_X - finishProgress * 12;
  const runnerX = DOG_RUN_RUNNER_X + finishProgress * 345;
  drawDog(ctx, dogX, reducedMotion ? 0 : elapsed, finishing);
  drawRunner(ctx, runnerX, reducedMotion ? 0 : elapsed, run?.jumpHeight ?? 0, finishing && finishProgress > .9);
  if (finishProgress > .55) {
    const opacity = (finishProgress - .55) / .45;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#a26c65';
    ctx.font = '31px Georgia, serif';
    ctx.fillText('♥', 604, 160 - opacity * 12);
    ctx.globalAlpha = 1;
  }
}
