import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas" width = "256 height = "256"></canvas>
`;

// Title
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.prepend(title);

// Canvas
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = 256;
canvas.height = 256;

// Button container (So buttons can all be under canvas)
const buttonContainer = document.createElement("div");
document.body.append(buttonContainer);

// Mouse Drawing State
let isDrawing = false;
let currentLine: MarkerLine | null = null;
let curThickness = 1;

// Array of points and redo stacks
const drawing: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

// Mouse Events
canvas.addEventListener("mousedown", (e) => {
  currentLine = makeMarkerLine(e.offsetX, e.offsetY, curThickness);
  redoStack.length = 0;
  drawing.push(currentLine);
  isDrawing = true;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  currentLine = null;
});

// Clear Button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  drawing.length = 0; // clear array
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Undo Button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  undoRedoListener(drawing, redoStack);
});

// Redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  undoRedoListener(redoStack, drawing);
});

// Thin Button
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
document.body.append(thinButton);

thinButton.addEventListener("click", () => {
  curThickness = 1;
});

// Thick Button
const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  curThickness = 3;
});

// Observer: Redraw on changes
canvas.addEventListener("drawing-changed", () => {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw strokes
  for (const cmd of drawing) {
    cmd.display(ctx);
  }
});

// Function for undo and redo event Listeners
function undoRedoListener(
  source: MarkerLine[],
  target: MarkerLine[],
) {
  if (source.length > 0) {
    const stroke = source.pop()!;
    target.push(stroke);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

interface MarkerLine {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function makeMarkerLine(
  startX: number,
  startY: number,
  thickness: number,
): MarkerLine {
  const points: { x: number; y: number }[] = [{ x: startX, y: startY }];

  return {
    drag(x: number, y: number) {
      points.push({ x, y });
    },
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = thickness;
      ctx.moveTo(points[0]!.x, points[0]!.y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i]!.x, points[i]!.y);
      }
      ctx.stroke();
    },
  };
}
