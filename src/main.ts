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
canvas.style.cursor = "none";

// Button container (So buttons can all be under canvas)
const buttonContainer = document.createElement("div");
document.body.append(buttonContainer);

// Mouse Drawing State
let isDrawing = false;
let currentLine: MarkerLine | null = null;
let curThickness = 2.5;
let curTool: string = "thin";
let curColor = "black";
let toolPreview: ToolPreview | null = null;

// Array of points and redo stacks
const drawing: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

// Mouse Events
canvas.addEventListener("mousedown", (e) => {
  if (curTool === "thin" || curTool === "thick") {
    currentLine = makeMarkerLine(e.offsetX, e.offsetY, curThickness);
    drawing.push(currentLine);
  } else {
    const sticker = makeSticker(curTool, e.offsetX, e.offsetY);
    drawing.push(sticker);
  }
  redoStack.length = 0;
  isDrawing = true;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
  }

  if (curTool === "thin" || curTool === "thick") {
    toolPreview = makeCursorPreview(e.offsetX, e.offsetY, curThickness);
  } else {
    toolPreview = makeStickerPreview(curTool, e.offsetX, e.offsetY);
  }

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  currentLine = null;
});

canvas.addEventListener("mouseleave", () => {
  toolPreview = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Clear Button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.classList.add("markerbtn");
buttonContainer.append(clearButton);

clearButton.addEventListener("click", () => {
  drawing.length = 0; // clear array
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Undo Button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.classList.add("markerbtn");
buttonContainer.append(undoButton);

undoButton.addEventListener("click", () => {
  undoRedoListener(drawing, redoStack);
});

// Redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.classList.add("markerbtn");
buttonContainer.append(redoButton);

redoButton.addEventListener("click", () => {
  undoRedoListener(redoStack, drawing);
});

// Create Thin and Thick Marker Buttons
function makeMarkerButton(
  label: string,
  thickness: number,
  isSelected = false,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.classList.add("markerbtn");
  if (isSelected) btn.classList.add("selectedTool");

  btn.addEventListener("click", () => {
    curTool = label;
    curColor = randomColor();
    selectTool(btn, thickness);
  });

  buttonContainer.append(btn);
  return btn;
}

const thinButton = makeMarkerButton("thin", 2.5, true);
const thickButton = makeMarkerButton("thick", 5);

// Emoji Buttons
const stickers = ["😀", "⭐", "❤️"];
const stickerButtons: HTMLButtonElement[] = [];

// Sticker Button Container
const stickerContainer = document.createElement("div");
document.body.append(stickerContainer);

// Create Sticker Buttons
function makeStickerButton() {
  stickerContainer.innerHTML = ""; // clear previous
  stickerButtons.length = 0;

  for (const emoji of stickers) {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.classList.add("selectedstickerbtn");
    stickerButtons.push(btn);
    stickerContainer.append(btn);

    btn.addEventListener("click", () => {
      curTool = emoji;
      selectTool(btn, curThickness);
      canvas.dispatchEvent(new Event("tool-moved"));
    });
  }

  // Custom sticker button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Custom Sticker";
  addButton.classList.add("customstickerbtn");
  stickerContainer.append(addButton);

  addButton.addEventListener("click", () => {
    const custom = prompt("Enter your custom sticker:", "");
    if (custom && custom.trim() !== "") {
      stickers.push(custom);
      makeStickerButton(); // re-render
    }
  });
}

// Export Button
const exportButton = document.createElement("button");
exportButton.textContent = "Export as PNG";
exportButton.classList.add("exportbtn");
document.body.append(exportButton);

exportButton.addEventListener("click", () => {
  // Creating igh-res canvas
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  exportCtx.fillStyle = "white";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportCtx.scale(4, 4);

  // Redraw everything from display list
  for (const cmd of drawing) {
    cmd.display(exportCtx);
  }

  // Convert to PNG
  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sticker_sketchpad.png";
  anchor.click();
});

// Initial sticker buttons
makeStickerButton();

// Observer: Redraw on changes
canvas.addEventListener("drawing-changed", () => {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw strokes
  for (const cmd of drawing) {
    cmd.display(ctx);
  }

  // Draw cursor preview
  if (toolPreview) {
    toolPreview.display(ctx);
  }
});

// Function for tool button visual feedback
function selectTool(button: HTMLButtonElement, thickness: number) {
  curThickness = thickness;
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  for (const btn of stickerButtons) {
    btn.classList.remove("selectedTool");
  }
  button.classList.add("selectedTool");
}

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

// Helper to generate random colors
function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 50%)`;
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
  const color = curColor;

  return {
    drag(x: number, y: number) {
      points.push({ x, y });
    },
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.moveTo(points[0]!.x, points[0]!.y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i]!.x, points[i]!.y);
      }
      ctx.stroke();
    },
  };
}

interface StickerCommand {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function makeSticker(emoji: string, x: number, y: number): StickerCommand {
  let pos = { x, y };

  return {
    drag(x: number, y: number) {
      pos = { x, y };
    },
    display(ctx) {
      ctx.save();
      ctx.font = "32px serif";
      ctx.globalAlpha = 1;
      ctx.fillText(emoji, pos.x - 16, pos.y + 16);
      ctx.restore();
    },
  };
}

interface ToolPreview {
  display(ctx: CanvasRenderingContext2D): void;
}

function makeCursorPreview(
  x: number,
  y: number,
  thickness: number,
): ToolPreview {
  return {
    display(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = curColor;
      ctx.fillStyle = curColor;
      ctx.lineWidth = 1;
      ctx.arc(x, y, thickness * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },
  };
}

function makeStickerPreview(emoji: string, x: number, y: number): ToolPreview {
  return {
    display(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.font = "32px serif";
      ctx.fillText(emoji, x - 16, y + 16);
      ctx.restore();
    },
  };
}
