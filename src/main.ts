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

// Clear Button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Mouse Drawing
let isDrawing = false;
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(ctx, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
