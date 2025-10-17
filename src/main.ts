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

// Array of points and redo stacks
const drawing: { x: number; y: number }[][] = [];
let redoStack: { x: number; y: number }[][] = [];

// Mouse Events
canvas.addEventListener("mousedown", (e) => {
  const newStroke = [{ x: e.offsetX, y: e.offsetY }];
  console.log("New Stroke Started");
  redoStack = []; // Clear redo History
  drawing.push(newStroke);
  isDrawing = true;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const currentStroke = drawing[drawing.length - 1]!;
    currentStroke.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
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
  if (drawing.length > 0) {
    const undoStroke = drawing.pop()!;
    redoStack.push(undoStroke);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoStroke = redoStack.pop()!;
    drawing.push(redoStroke);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Observer: Redraw on changes
canvas.addEventListener("drawing-changed", () => {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw strokes
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  for (const stroke of drawing) {
    ctx.beginPath();
    ctx.moveTo(stroke[0]!.x, stroke[0]!.y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i]!.x, stroke[i]!.y);
    }
    ctx.stroke();
  }
});
