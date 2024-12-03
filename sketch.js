let hexagonSize;
let titleText = "Titolo";
let displayedText = "";
let lastTypewriterUpdate = 0;
let typewriterSpeed = 100; // milliseconds per character

function setup() {
  createCanvas(windowWidth, windowHeight);
  hexagonSize = min(width, height) / 4;
  
  textAlign(CENTER, CENTER);
  textSize(50);
}

function draw() {
  background(30);
  
  updateTypewriter();
  noStroke();
  fill(250);
  text(displayedText, width / 2, height * 0.4 - hexagonSize - 40);
  
  fill(150);
  stroke(50)
  strokeWeight(5);
  drawHexagon(width / 2, height / 2, hexagonSize);
}

function drawHexagon(x, y, size) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    // per mettere la base dell'esagono in verticale:
    let angle = TWO_PI / 6 * i - TWO_PI / 4;
    let vx = x + cos(angle) * size;
    let vy = y + sin(angle) * size;
    vertex(vx, vy);
  }
  endShape(CLOSE);
}

function updateTypewriter() {
  if (millis() - lastTypewriterUpdate > typewriterSpeed) {
    if (displayedText.length < titleText.length) {
      displayedText += titleText[displayedText.length];
      lastTypewriterUpdate = millis();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  hexagonSize = min(width, height) / 4;
}
