let font;
let tSize = 125; // Tamaño del texto
let pointCount = 0.9; // Proporción de puntos del texto
let speed = 10; // Velocidad de las partículas
let comebackSpeed = 100; // Velocidad de retorno al objetivo
let dia = 50; // Diámetro de interacción
let randomPos = false; // Puntos iniciales aleatorios
let words = ["Lince Studios", "Proyectos", "Contacto", "Perfil"];
let currentWordIndex = 0;

let textPoints = [];
let floatingWords = []; // Lista de palabras flotantes
let circleParticles = []; // Partículas del círculo orgánico
let time = 0; // Tiempo para Perlin Noise
let firstWord = true; // Variable para saber si es la primera palabra
let clickSound; // Variable para el sonido de clic

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
  clickSound = loadSound("click-234708.mp3"); // Cargar el sonido
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  generateTextPoints(words[currentWordIndex]);
  createCircleParticles(); // Crear partículas del círculo
}

function draw() {
  background(0);

  // Dibujar palabras flotantes
  for (let i = floatingWords.length - 1; i >= 0; i--) {
    let fw = floatingWords[i];
    fw.update();
    fw.show();

    if (fw.opacity <= 0) {
      floatingWords.splice(i, 1); // Eliminar palabras que ya son invisibles
    }
  }

  time += 0.01; // Incremento para animaciones suaves

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update(time);
    v.show();
    v.behaviors();
  }

  // Dibujar el círculo de partículas
  drawCircleParticles();
}

// Genera puntos para la palabra actual
function generateTextPoints(word) {
  textPoints = [];
  let bounds = font.textBounds(word, 0, 0, tSize);
  let tposX = width / 2 - bounds.w / 2;
  let tposY = height / 2 + bounds.h / 2.8;

  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  // Si es la primera palabra, las partículas comienzan desde abajo (fuera de la pantalla)
  let startY = firstWord ? height + 50 : tposY;

  for (let pt of points) {
    textPoints.push(new Interact(pt.x, pt.y, startY, randomPos));
  }

  if (firstWord) {
    firstWord = false;
  }
}

// Crear partículas para el círculo orgánico
function createCircleParticles() {
  let numParticles = 300;
  let radius = 300; // Radio del círculo (más grande que las palabras)
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let distance = radius + random(-50, 50); // Variación en el radio para mayor organicidad
    let x = width / 2 + cos(angle) * distance;
    let y = height / 2 + sin(angle) * distance;
    circleParticles.push({
      x,
      y,
      angle,
      distance,
      offset: random(1000), // Desplazamiento de Perlin Noise
    });
  }
}

// Dibujar partículas del círculo
function drawCircleParticles() {
  stroke(255, 150);
  strokeWeight(2);

  for (let p of circleParticles) {
    p.angle += map(noise(p.offset, time), 0, 1, -0.01, 0.01); // Movimiento orgánico con Perlin Noise
    let radiusVariation = map(noise(p.offset + time), 0, 1, -20, 20);
    let radius = p.distance + radiusVariation;
    p.x = width / 2 + cos(p.angle) * radius;
    p.y = height / 2 + sin(p.angle) * radius;
    point(p.x, p.y);
  }
}

// Cambia la palabra al hacer clic
function mousePressed() {
  clickSound.play(); // Reproducir el sonido de clic
  currentWordIndex = (currentWordIndex + 1) % words.length;
  generateTextPoints(words[currentWordIndex]);

  // Añadir la palabra actual a las palabras flotantes
  floatingWords.push(new FloatingWord(words[currentWordIndex]));
}

// Clase para partículas
class Interact {
  constructor(x, y, startY, randomize) {
    this.home = randomize ? createVector(random(width), random(height)) : createVector(x, y);
    this.pos = createVector(x, startY);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.r = 5; // Radio de las partículas
    this.maxSpeed = speed;
    this.target = createVector(x, y);
  }

  behaviors() {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY);
    let flee = this.flee(mouse);

    this.applyForce(arrive);
    this.applyForce(flee);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = d < comebackSpeed ? map(d, 0, comebackSpeed, 0, this.maxSpeed) : this.maxSpeed;
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(0.3); // Ajustar la fuerza máxima
    return steer;
  }

  flee(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    if (d < dia) {
      desired.setMag(this.maxSpeed);
      desired.mult(-1);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(0.5);
      return steer;
    }
    return createVector(0, 0);
  }

  update(time) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    stroke(255);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
  }
}

// Clase para palabras flotantes
class FloatingWord {
  constructor(text) {
    this.text = text;
    this.x = width / 2;
    this.y = height / 2;
    this.opacity = 255; // Comienza completamente visible
    this.speed = 2; // Velocidad de ascenso
    this.size = tSize / 3; // Tamaño de la palabra flotante
  }

  update() {
    this.y -= this.speed;
    this.opacity -= 3; // Reduce opacidad gradualmente
  }

  show() {
    fill(255, this.opacity);
    noStroke();
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateTextPoints(words[currentWordIndex]);
}
