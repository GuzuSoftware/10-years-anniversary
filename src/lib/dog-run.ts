export const DOG_RUN_DURATION = 20;
export const DOG_RUN_SPAWN_TIMES = [3, 7, 11, 15] as const;
export const DOG_RUN_SPEED = 220;
export const DOG_RUN_RUNNER_X = 235;
export const DOG_RUN_DOG_X = 665;
export const DOG_RUN_DROP_X = 622;

const JUMP_SPEED = 355;
const GRAVITY = 690;
const COLLISION_DISTANCE = 27;
const SAFE_JUMP_HEIGHT = 19;

export interface DogRunObstacle {
  id: number;
  x: number;
  age: number;
}

export interface DogRunState {
  elapsed: number;
  jumpHeight: number;
  jumpVelocity: number;
  spawned: number;
  obstacles: DogRunObstacle[];
  phase: 'running' | 'failed' | 'finishing';
}

export const createDogRun = (): DogRunState => ({
  elapsed: 0,
  jumpHeight: 0,
  jumpVelocity: 0,
  spawned: 0,
  obstacles: [],
  phase: 'running',
});

export function jumpDogRun(run: DogRunState): DogRunState {
  return run.phase === 'running' && run.jumpHeight === 0
    ? { ...run, jumpVelocity: JUMP_SPEED }
    : run;
}

export function stepDogRun(run: DogRunState, deltaSeconds: number): DogRunState {
  if (run.phase !== 'running') return run;
  const dt = Math.max(0, Math.min(deltaSeconds, 0.05));
  const elapsed = Math.min(DOG_RUN_DURATION, run.elapsed + dt);
  let jumpHeight = run.jumpHeight;
  let jumpVelocity = run.jumpVelocity;
  if (jumpVelocity !== 0 || jumpHeight > 0) {
    jumpHeight += jumpVelocity * dt - GRAVITY * dt * dt / 2;
    jumpVelocity -= GRAVITY * dt;
    if (jumpHeight <= 0) {
      jumpHeight = 0;
      jumpVelocity = 0;
    }
  }

  const spawned = DOG_RUN_SPAWN_TIMES.filter((time) => time <= elapsed + 1e-9).length;
  const obstacles = DOG_RUN_SPAWN_TIMES.slice(0, spawned)
    .map((time, id) => ({
      id,
      x: DOG_RUN_DROP_X - DOG_RUN_SPEED * (elapsed - time),
      age: Math.max(0, elapsed - time),
    }))
    .filter((obstacle) => obstacle.x > -45);
  const crashed = obstacles.some((obstacle) =>
    Math.abs(obstacle.x - DOG_RUN_RUNNER_X) < COLLISION_DISTANCE && jumpHeight < SAFE_JUMP_HEIGHT,
  );

  return {
    elapsed,
    jumpHeight,
    jumpVelocity,
    spawned,
    obstacles,
    phase: crashed ? 'failed' : elapsed >= DOG_RUN_DURATION ? 'finishing' : 'running',
  };
}
