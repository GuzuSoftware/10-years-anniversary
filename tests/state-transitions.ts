import {
  FINALE_PUZZLE_TARGETS, advanceGift, beginFinalePuzzle, completeFinalePuzzle, completePuzzle, flipGift,
  initialState, markPuzzleSolved, restoreState, revealThirdImage, start, updateFinalePiece,
} from '../src/lib/game-state.js';
import { isChronological, orderedTimelineAfterDrop } from '../src/lib/timeline.js';
import { isNearFinaleTarget } from '../src/lib/finale-puzzle.js';
import { DOG_RUN_DROP_X, DOG_RUN_DURATION, DOG_RUN_RUNNER_X, DOG_RUN_SPAWN_TIMES, DOG_RUN_SPEED, createDogRun, jumpDogRun, stepDogRun } from '../src/lib/dog-run.js';

const expect = (condition: unknown, label: string): void => { if (!condition) throw new Error(label); };

let state = initialState();
state = start(state);
expect(state.screen === 'puzzle' && state.puzzleIndex === 1, 'intro -> first puzzle');
expect(completePuzzle({ ...state, puzzleIndex: 3 }).screen === 'puzzle', 'third image is required before card');

for (let index = 1; index <= 6; index += 1) {
  state = { ...state, screen: 'puzzle', puzzleIndex: index as 1 | 2 | 3 | 4 | 5 | 6, giftFlipped: false };
  if (index === 3) state = revealThirdImage(state);
  if (index === 4) state = { ...state, qualitiesLocked: true };
  if (index === 6) {
    expect(!markPuzzleSolved(state).puzzleSolved, 'sixth puzzle cannot complete without winning the dog run');
    state = { ...state, dogRunWon: true };
  }
  state = markPuzzleSolved(state);
  state = completePuzzle(state, `gift ${index} success`);
  expect(state.screen === 'gift' && state.puzzleIndex === index, `puzzle ${index} -> matching gift`);
  expect(state.giftMessage === `gift ${index} success`, `puzzle ${index} success text belongs to gift`);
  expect(advanceGift(state).screen === 'gift', `gift ${index} cannot advance before flip`);
  state = flipGift(state);
  state = advanceGift(state);
  expect(index === 6 ? state.screen === 'finale' : state.screen === 'puzzle' && state.puzzleIndex === index + 1, `gift ${index} advances safely`);
}

state = beginFinalePuzzle(state);
expect(state.screen === 'finale' && state.finalePhase === 'puzzle', 'finale card -> puzzle');
expect(state.finalePieces.length === 9 && state.finalePieces.every((piece) => !piece.locked), 'finale puzzle starts with nine movable pieces');
expect(completeFinalePuzzle(state).screen === 'finale', 'incomplete finale puzzle cannot finish');
state = updateFinalePiece(state, 0, 12.5, 33.5, false);
const restoredActiveFinale = restoreState(JSON.parse(JSON.stringify(state)));
expect(restoredActiveFinale.screen === 'finale' && restoredActiveFinale.finalePhase === 'puzzle', 'active finale puzzle restores as active');
expect(restoredActiveFinale.finalePieces[0].x === 12.5 && restoredActiveFinale.finalePieces[0].y === 33.5, 'finale piece position is persisted');
for (const target of FINALE_PUZZLE_TARGETS) state = updateFinalePiece(state, target.id, target.x, target.y, true);
expect(state.finalePieces.every((piece) => piece.locked), 'all finale pieces can lock into place');
state = completeFinalePuzzle(state);
expect(state.screen === 'completed', 'finale puzzle -> stable completion');
expect(completeFinalePuzzle(state) === state, 'completed finale is stable');
const restoredCompletion = restoreState(JSON.parse(JSON.stringify(state)));
expect(restoredCompletion.screen === 'completed' && restoredCompletion.finalePieces.every((piece) => piece.locked), 'completed finale restores as completed');
expect(isNearFinaleTarget(100, 100, 140, 120, 144), 'near finale piece snaps into place');
expect(!isNearFinaleTarget(100, 100, 180, 180, 144), 'distant finale piece stays movable');
expect(restoreState({ version: 1, current: 999 }).screen === 'intro', 'legacy invalid state resets safely');
expect(isChronological([2017,2018,2019,2020,2021,2022,2023,2024,2025,2026]), 'chronological timeline accepted');
expect(!isChronological([2018,2017,2019,2020,2021,2022,2023,2024,2025,2026]), 'unordered timeline rejected');
expect(orderedTimelineAfterDrop([2017,2019,2018,2020,2021,2022,2023,2024,2025,2026], 2018, 2019).slice(0,3).join() === '2017,2018,2019', 'timeline reorder is stable across grid rows');

let dogRun = createDogRun();
expect(dogRun.elapsed === 0 && dogRun.spawned === 0 && dogRun.phase === 'running', 'dog run waits for manual creation');
for (let i = 0; i < 59; i++) dogRun = stepDogRun(dogRun, .05);
expect(dogRun.spawned === 0, 'first obstacle is not visible before Mango passes its point');
dogRun = stepDogRun(dogRun, .05);
expect(dogRun.spawned === 1 && Math.abs(dogRun.obstacles[0].x - DOG_RUN_DROP_X) < .01, 'obstacle appears at Mango’s drop point exactly at its spawn time');
for (const [index, time] of DOG_RUN_SPAWN_TIMES.entries()) {
  const justBefore = { ...createDogRun(), elapsed: time - .01 };
  const atSpawn = stepDogRun(justBefore, .01);
  expect(atSpawn.spawned === index + 1, `obstacle ${index + 1} is emitted only when Mango reaches its point`);
  expect(Math.abs(atSpawn.obstacles.at(-1)!.x - DOG_RUN_DROP_X) < .01, `obstacle ${index + 1} starts directly behind Mango`);
}
while (dogRun.phase === 'running' && dogRun.elapsed < 5) dogRun = stepDogRun(dogRun, 1 / 60);
expect(dogRun.phase === 'failed', 'unjumped obstacle causes a collision');
dogRun = createDogRun();
expect(dogRun.phase === 'running' && dogRun.spawned === 0, 'failed run can restart cleanly');
const jumpTimes = DOG_RUN_SPAWN_TIMES.map((time) => time + (DOG_RUN_DROP_X - DOG_RUN_RUNNER_X) / DOG_RUN_SPEED - .5);
const jumped = new Set<number>();
for (let i = 0; i < 1300 && dogRun.phase === 'running'; i++) {
  jumpTimes.forEach((time, index) => {
    if (!jumped.has(index) && dogRun.elapsed >= time) {
      dogRun = jumpDogRun(dogRun);
      jumped.add(index);
    }
  });
  dogRun = stepDogRun(dogRun, 1 / 60);
}
expect(dogRun.phase === 'finishing' && dogRun.elapsed === DOG_RUN_DURATION, 'four successful jumps reach the house in about 20 seconds');
expect(dogRun.spawned === 4, 'exactly four obstacles are emitted');
const sixthPuzzle = { ...initialState(), screen: 'puzzle' as const, puzzleIndex: 6 as const };
expect(restoreState(JSON.parse(JSON.stringify(sixthPuzzle))).screen === 'puzzle', 'sixth puzzle restores to its instructions');
expect(restoreState({ ...sixthPuzzle, dogRunWon: true }).screen === 'gift', 'a run won just before reload restores the sixth gift');
console.log('state transition tests passed');
