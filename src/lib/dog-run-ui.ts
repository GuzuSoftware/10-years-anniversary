import { createDogRun, jumpDogRun, stepDogRun, type DogRunState } from './dog-run';
import { DOG_RUN_HEIGHT, DOG_RUN_WIDTH, drawDogRun } from './dog-run-art';

const FIXED_STEP = 1 / 60;

export function mountDogRun(root: HTMLElement, onFinishStarted: () => void, onWin: () => void): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('.dog-run-canvas');
  const button = root.querySelector<HTMLButtonElement>('.dog-run-button');
  const status = root.querySelector<HTMLElement>('.dog-run-status');
  if (!canvas || !button || !status) return () => {};

  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = DOG_RUN_WIDTH * scale;
  canvas.height = DOG_RUN_HEIGHT * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let run: DogRunState | null = null;
  let frame = 0;
  let lastTimestamp = 0;
  let accumulator = 0;
  let finishTimestamp = 0;
  let disposed = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code !== 'Space' || !run || run.phase !== 'running') return;
    event.preventDefault();
    if (!event.repeat) run = jumpDogRun(run);
  };

  const stopKeys = () => window.removeEventListener('keydown', onKeyDown);

  const tick = (timestamp: number) => {
    if (disposed || !run) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, .1);
    lastTimestamp = timestamp;

    if (run.phase === 'running') {
      accumulator += delta;
      while (accumulator >= FIXED_STEP && run.phase === 'running') {
        run = stepDogRun(run, FIXED_STEP);
        accumulator -= FIXED_STEP;
      }
      if (run.phase === 'failed') {
        canvas.dataset.elapsed = run.elapsed.toFixed(2);
        canvas.dataset.spawned = String(run.spawned);
        stopKeys();
        status.textContent = 'Hoppá, ez most nem sikerült. Fuss neki újra!';
        button.textContent = 'Újrapróbálom';
        button.hidden = false;
        drawDogRun(ctx, run, 0, reducedMotion);
        return;
      }
      if (run.phase === 'finishing') {
        stopKeys();
        finishTimestamp = timestamp;
        status.textContent = 'Utolérted Mangót!';
        onFinishStarted();
      }
    }

    const finishDuration = reducedMotion ? 450 : 1450;
    const finishProgress = run.phase === 'finishing'
      ? Math.min(1, (timestamp - finishTimestamp) / finishDuration)
      : 0;
    drawDogRun(ctx, run, finishProgress, reducedMotion);
    canvas.dataset.elapsed = run.elapsed.toFixed(2);
    canvas.dataset.spawned = String(run.spawned);
    if (run.phase === 'finishing' && finishProgress >= 1) {
      onWin();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  button.onclick = () => {
    if (disposed) return;
    cancelAnimationFrame(frame);
    run = createDogRun();
    canvas.dataset.elapsed = '0.00';
    canvas.dataset.spawned = '0';
    lastTimestamp = 0;
    accumulator = 0;
    finishTimestamp = 0;
    status.textContent = 'Futás közben a SPACE billentyűvel ugorhatsz.';
    button.hidden = true;
    canvas.focus();
    window.addEventListener('keydown', onKeyDown);
    frame = requestAnimationFrame(tick);
  };

  drawDogRun(ctx, null, 0, reducedMotion);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    stopKeys();
    button.onclick = null;
  };
}
