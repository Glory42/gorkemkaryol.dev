// ~1 s pause after train exits right side (9 frames × 120 ms ≈ 1 080 ms)
const PAUSE_FRAMES = 5;

const MIRROR_MAP: Record<string, string> = {
  ">": "<",
  "<": ">",
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "/": "\\",
  "\\": "/",
};

function mirrorLine(s: string): string {
  return [...s]
    .reverse()
    .map((c) => MIRROR_MAP[c] ?? c)
    .join("");
}

const TRAIN_LINES = [
  "         o x o x o x o . . .",
  "       o      _____            _______________ ___=====__T___",
  "     .][__n_n_|DD[  ====_____  |    |.\\/.|   | |   |_|     |_",
  "    >(________|__|_[_________]_|____|_/\\_|___|_|___________|_|",
  "    _/oo OOOOO oo`  ooo   ooo   o^o       o^o   o^o     o^o",
].map(mirrorLine);

const CANVAS = 79;
const TRAIN_WIDTH = Math.max(...TRAIN_LINES.map((l) => l.length));
const PERIOD = TRAIN_WIDTH + CANVAS + PAUSE_FRAMES;
const TRACK = "-+-".repeat(27).slice(0, CANVAS);

export function renderTrainFrame(frame: number): string {
  const tick = frame % PERIOD;

  // Pause phase — train has fully exited the right edge
  if (tick >= TRAIN_WIDTH + CANVAS) {
    return ["", " ", " ", " ", " ", " ", TRACK].join("\n");
  }

  // offset < 0 → train entering from left; offset > 0 → train visible/exiting right
  const offset = tick - TRAIN_WIDTH;

  const place = (line: string): string => {
    const row = Array<string>(CANVAS).fill(" ");
    for (let i = 0; i < line.length; i++) {
      const col = offset + i;
      if (col >= 0 && col < CANVAS) row[col] = line[i]!;
    }
    return row.join("");
  };

  return ["", ...TRAIN_LINES.map(place), TRACK].join("\n");
}
