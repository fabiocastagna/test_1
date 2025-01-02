class Esagono {
  constructor() {
    this.x = width / 3;
    this.y = height / 3;
    this.size = width / 5;
    this.angolo = PI/6;
  }

  aggiornaPosizione() {
    this.x = width / 2;
    this.y = height / 2;
  }

  disegna() {
    push();
    translate(this.x, this.y);
    stroke(255);
    fill("red");
    rotate(this.angolo);
    beginShape();
    for (let angolo = 0; angolo < TWO_PI; angolo += TWO_PI / 6) {
      let x = cos(angolo) * this.size;
      let y = sin(angolo) * this.size;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}
