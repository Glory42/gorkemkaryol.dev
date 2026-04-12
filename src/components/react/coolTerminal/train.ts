export function renderTrainFrame(frame: number): string {
  const width = 74;
  const engine = [
    "      ____        ",
    " ____|_[]\\__     ",
    "|_  _  _  _|==---",
    "  O-O-O-O-O      ",
  ];

  const trainWidth = engine[0].length;
  const offset = (frame % (width + trainWidth + 12)) - trainWidth;

  const place = (line: string) => {
    const slots = Array.from({ length: width }, () => " ");
    for (let i = 0; i < line.length; i += 1) {
      const at = offset + i;
      if (at >= 0 && at < width) {
        slots[at] = line[i] ?? " ";
      }
    }
    return slots.join("");
  };

  const trainRows = engine.map((line) => place(line));
  const track = "=".repeat(width);

  return ["signal: [train stream active]", "", ...trainRows, track].join("\n");
}
