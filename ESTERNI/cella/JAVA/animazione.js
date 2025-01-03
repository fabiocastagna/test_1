class Animazione {
  constructor() {
    this.esagonoInterno = {
      x: 0,
      y: 0,
      size: width / 5,
      velocita: 2,
      angolo: 0,
      raggio: 30,
    };
    this.sovraffollamento = 0;
    this.targetSovraffollamento = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.currentColor = color(255, 255, 255);
    this.easing = 0.1;
    this.blurAmount = 50;
  }

  getTargetColor(valore) {
    if (valore <= 50) {
      return lerpColor(
        color(255, 255, 255), // bianco
        color(255, 255, 200), // bianco tendente al giallo
        valore / 50
      );
    } else if (valore <= 100) {
      return lerpColor(
        color(255, 255, 200), // bianco tendente al giallo
        color(255, 255, 0),   // giallo
        (valore - 50) / 20
      );
    } else if (valore <= 150) {
      return lerpColor(
        color(255, 255, 0),   // giallo
        color(255, 200, 0),   // giallo-arancione
        (valore - 100) / 20
      );
    } else {
      return lerpColor(
        color(255, 200, 0),   // giallo-arancione
        color(255, 0, 0),     // rosso
        (valore - 150) / 20
      );
    }
  }

  spostamento(valore) {
    this.targetSovraffollamento = valore;
    
    if (valore > 100) {
      let spostamento = map(valore, 100, 200, 0, this.esagonoInterno.size * 0.5);
      this.targetX = spostamento * cos(2 * PI / 3);
      this.targetY = -spostamento * sin(2 * PI / 3);
    } else {
      this.targetX = 0;
      this.targetY = 0;
    }
  }

  aggiorna() {
    let dx = this.targetX - this.esagonoInterno.x;
    let dy = this.targetY - this.esagonoInterno.y;
    this.esagonoInterno.x += dx * this.easing;
    this.esagonoInterno.y += dy * this.easing;

    this.sovraffollamento += (this.targetSovraffollamento - this.sovraffollamento) * this.easing;
    let targetColor = this.getTargetColor(this.sovraffollamento);
    this.currentColor = lerpColor(this.currentColor, targetColor, this.easing);
  }

  disegna() {
    this.aggiorna();
    push();
    translate(width / 2, height / 2);
    rotate(PI / 2);
    
    fill(0);
    noStroke();
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
      let x = cos(a) * this.esagonoInterno.size + this.esagonoInterno.x;
      let y = sin(a) * this.esagonoInterno.size + this.esagonoInterno.y;
      vertex(x, y);
    }
    endShape(CLOSE);

    fill(this.currentColor);
    
    pop();
  }
}
