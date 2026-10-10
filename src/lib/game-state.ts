export const STATE_VERSION = 2 as const;
export const PUZZLE_COUNT = 6 as const;

export type PuzzleIndex = 1 | 2 | 3 | 4 | 5 | 6;
export type Screen = 'intro' | 'puzzle' | 'gift' | 'finale' | 'completed';
export type FinalePhase = 'card' | 'puzzle';

export interface FinalePieceState {
  id: number;
  x: number;
  y: number;
  locked: boolean;
}

export const FINALE_PUZZLE_TARGETS = Array.from({ length: 9 }, (_, id) => ({
  id,
  x: 20 + (id % 3) * 20,
  y: 18 + Math.floor(id / 3) * 21,
}));

const FINALE_PUZZLE_STARTS = [
  [1, 2], [22, 1], [43, 2], [3, 72], [64, 1],
  [59, 78], [79, 30], [32, 79], [79, 57],
] as const;

export const createFinalePieces = (): FinalePieceState[] =>
  FINALE_PUZZLE_STARTS.map(([x, y], id) => ({ id, x, y, locked: false }));

export const solvedFinalePieces = (): FinalePieceState[] =>
  FINALE_PUZZLE_TARGETS.map(({ id, x, y }) => ({ id, x, y, locked: true }));

export interface GameState {
  version: typeof STATE_VERSION;
  screen: Screen;
  puzzleIndex?: PuzzleIndex;
  giftFlipped: boolean;
  giftMessage: string;
  selectedQualities: string[];
  qualitiesLocked: boolean;
  puzzleSolved: boolean;
  thirdImageRevealed: boolean;
  dogRunWon: boolean;
  finalePhase?: FinalePhase;
  finalePieces: FinalePieceState[];
}

export const initialState = (): GameState => ({
  version: STATE_VERSION,
  screen: 'intro',
  giftFlipped: false,
  giftMessage: '',
  selectedQualities: [],
  qualitiesLocked: false,
  puzzleSolved: false,
  thirdImageRevealed: false,
  dogRunWon: false,
  finalePieces: [],
});

const validPuzzleIndex = (value: unknown): value is PuzzleIndex =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= PUZZLE_COUNT;

function restoreFinalePieces(value: unknown): FinalePieceState[] | undefined {
  if (!Array.isArray(value) || value.length !== 9) return undefined;
  const pieces = value.filter((piece): piece is FinalePieceState => {
    if (!piece || typeof piece !== 'object') return false;
    const candidate = piece as Partial<FinalePieceState>;
    return Number.isInteger(candidate.id) && candidate.id! >= 0 && candidate.id! < 9 &&
      Number.isFinite(candidate.x) && Number.isFinite(candidate.y) && typeof candidate.locked === 'boolean';
  });
  if (pieces.length !== 9 || new Set(pieces.map((piece) => piece.id)).size !== 9) return undefined;
  return pieces.sort((a, b) => a.id - b.id).map((piece) => {
    const target = FINALE_PUZZLE_TARGETS[piece.id];
    return piece.locked
      ? { ...target, locked: true }
      : { id: piece.id, x: Math.max(0, Math.min(80, piece.x)), y: Math.max(0, Math.min(79, piece.y)), locked: false };
  });
}

/** Invalid or pre-v2 saved games deliberately restart instead of producing a broken screen. */
export function restoreState(value: unknown): GameState {
  if (!value || typeof value !== 'object') return initialState();
  const candidate = value as Partial<GameState>;
  if (candidate.version !== STATE_VERSION) return initialState();
  if (!['intro', 'puzzle', 'gift', 'finale', 'completed'].includes(candidate.screen ?? '')) return initialState();
  if (['puzzle', 'gift'].includes(candidate.screen!) && !validPuzzleIndex(candidate.puzzleIndex)) return initialState();
  if (candidate.screen === 'finale' && !['card', 'puzzle'].includes(candidate.finalePhase ?? '')) return initialState();

  const savedFinalePieces = restoreFinalePieces(candidate.finalePieces);
  const finalePieces = candidate.screen === 'completed'
    ? solvedFinalePieces()
    : candidate.screen === 'finale' && candidate.finalePhase === 'puzzle'
      ? savedFinalePieces ?? createFinalePieces()
      : savedFinalePieces ?? [];

  const restored: GameState = {
    version: STATE_VERSION,
    screen: candidate.screen as Screen,
    ...(validPuzzleIndex(candidate.puzzleIndex) ? { puzzleIndex: candidate.puzzleIndex } : {}),
    giftFlipped: Boolean(candidate.giftFlipped),
    giftMessage: typeof candidate.giftMessage === 'string' ? candidate.giftMessage : '',
    selectedQualities: Array.isArray(candidate.selectedQualities) ? candidate.selectedQualities.filter((item): item is string => typeof item === 'string').slice(0, 10) : [],
    qualitiesLocked: Boolean(candidate.qualitiesLocked),
    puzzleSolved: Boolean(candidate.puzzleSolved),
    thirdImageRevealed: Boolean(candidate.thirdImageRevealed),
    dogRunWon: Boolean(candidate.dogRunWon),
    ...(candidate.screen === 'finale' ? { finalePhase: candidate.finalePhase } : {}),
    finalePieces,
  };
  // A completed run must not be lost if the page reloads during its short finish animation.
  return restored.screen === 'puzzle' && restored.puzzleIndex === 6 && restored.dogRunWon
    ? { ...restored, screen: 'gift', puzzleSolved: true, giftFlipped: false, giftMessage: 'Ügyes vagy!' }
    : restored;
}

export function start(state: GameState): GameState {
  return state.screen === 'intro' ? { ...state, screen: 'puzzle', puzzleIndex: 1 } : state;
}

export function revealThirdImage(state: GameState): GameState {
  return state.screen === 'puzzle' && state.puzzleIndex === 3 ? { ...state, thirdImageRevealed: true } : state;
}

export function markPuzzleSolved(state: GameState): GameState {
  if (state.screen !== 'puzzle') return state;
  if (state.puzzleIndex === 3 && !state.thirdImageRevealed) return state;
  if (state.puzzleIndex === 4 && !state.qualitiesLocked) return state;
  if (state.puzzleIndex === 6 && !state.dogRunWon) return state;
  return { ...state, puzzleSolved: true };
}

export function completePuzzle(state: GameState, giftMessage = ''): GameState {
  if (state.screen !== 'puzzle' || !validPuzzleIndex(state.puzzleIndex)) return state;
  if (!state.puzzleSolved) return state;
  return { ...state, screen: 'gift', giftFlipped: false, giftMessage };
}

export function flipGift(state: GameState): GameState {
  return state.screen === 'gift' ? { ...state, giftFlipped: true } : state;
}

export function advanceGift(state: GameState): GameState {
  if (state.screen !== 'gift' || !state.giftFlipped || !validPuzzleIndex(state.puzzleIndex)) return state;
  if (state.puzzleIndex === PUZZLE_COUNT) {
    return { ...state, screen: 'finale', puzzleIndex: undefined, giftFlipped: false, giftMessage: '', finalePhase: 'card', finalePieces: [] };
  }
  return {
    ...state,
    screen: 'puzzle',
    puzzleIndex: (state.puzzleIndex + 1) as PuzzleIndex,
    giftFlipped: false,
    giftMessage: '',
    thirdImageRevealed: false,
    qualitiesLocked: false,
    puzzleSolved: false,
    selectedQualities: [],
    dogRunWon: false,
  };
}

export function beginFinalePuzzle(state: GameState): GameState {
  return state.screen === 'finale' && state.finalePhase === 'card'
    ? { ...state, finalePhase: 'puzzle', finalePieces: createFinalePieces() }
    : state;
}

export function updateFinalePiece(state: GameState, id: number, x: number, y: number, locked: boolean): GameState {
  if (state.screen !== 'finale' || state.finalePhase !== 'puzzle' || !Number.isInteger(id) || id < 0 || id >= 9) return state;
  const pieces = restoreFinalePieces(state.finalePieces) ?? createFinalePieces();
  const target = FINALE_PUZZLE_TARGETS[id];
  return {
    ...state,
    finalePieces: pieces.map((piece) => piece.id === id
      ? locked
        ? { ...target, locked: true }
        : { id, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(79, y)), locked: false }
      : piece),
  };
}

export function completeFinalePuzzle(state: GameState): GameState {
  if (state.screen !== 'finale' || state.finalePhase !== 'puzzle') return state;
  const pieces = restoreFinalePieces(state.finalePieces);
  if (!pieces?.every((piece) => piece.locked)) return state;
  return { ...state, screen: 'completed', finalePhase: undefined, finalePieces: solvedFinalePieces() };
}
