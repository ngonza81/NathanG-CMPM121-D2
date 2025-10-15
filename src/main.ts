import "./style.css";

document.body.innerHTML = `
  <canvas id = "canvas"></canvas>
`;

// Title
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.prepend(title);

// Canvas
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
