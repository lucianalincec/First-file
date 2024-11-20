let font;
let tSize = 125; // Tamaño de texto reducido a la mitad
let pointCount = 0.9; // entre 0 - 1 // point count

let speed = 10; // velocidad de las partículas
let comebackSpeed = 100; // menor número, menos interacción
let dia = 50; // diámetro de interacción
let randomPos = false; // puntos iniciales aleatorios
let pointsDirection = "general"; // dirección de puntos: left, right, up, down, general 
let interactionDirection = -1; // -1 o 1

let textPoints = [];
let words = ["Happy", "Free", "Colorful", "Excited", "Creative", "Elegant"];
let currentWordIndex = 0; // Índice de la palabra actual

let time = 0; // Variable de tiempo para el ruido Perlin

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  generateTextPoints(words[currentWordIndex]); // Generar puntos para la primera palabra
}

function draw() {
  background(0);

  // Incrementar el tiempo para animar el ruido Perlin
  time += 0.01;

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update(time); // Pasar el tiempo al método update
    v.show();
    v.behaviors();
  }
}

// Genera puntos para el texto centrado
function generateTextPoints(word) {
  textPoints = []; // Limpiar los puntos anteriores
  
  // Calcular ancho del texto para centrarlo
  let bounds = font.textBounds(word, 0, 0, tSize);
  let tposX = width / 2 - bounds.w / 2;
  let tposY = height / 2 + bounds.h / 2.8;

  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

// Cambia el texto cuando el usuario hace clic
function mousePressed() {
  currentWordIndex = (currentWordIndex + 1) % words.length; // Cambiar a la siguiente palabra
  generateTextPoints(words[currentWordIndex]); // Generar puntos para la nueva palabra
}

// Clase Interact
function Interact(x, y, m, d, t, s, di, p) {
  if (t) {
    this.home = createVector(random(width), random(height));
  } else {
    this.home = createVector(x, y);
  }
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  this.vel = di === "general" ? createVector() : createVector(random(-x, x), random(-y, y));

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.colorIndex = 0; // Índice para el efecto RGB
  this.colorChangeDelay = 10; // Velocidad de cambio de color
  this.colorCounter = 0; // Contador para el retardo
}

// Comportamientos del objeto
Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

// Actualiza la posición del punto con ruido Perlin
Interact.prototype.update = function (time) {
  // Aplicar ruido Perlin para distorsionar la posición
  let noiseFactorX = noise(this.home.x * 0.01, time);
  let noiseFactorY = noise(this.home.y * 0.01, time);

  this.pos.x = this.target.x + map(noiseFactorX, 0, 1, -30, 30);
  this.pos.y = this.target.y + map(noiseFactorY, 0, 1, -30, 30);

  this.vel.add(this.acc);
  this.acc.mult(0);
};

// Muestra el punto con efecto RGB delay
Interact.prototype.show = function () {
  let distanceToMouse = dist(this.pos.x, this.pos.y, mouseX, mouseY);

  // Si el mouse está cerca, cambia de color
  if (distanceToMouse < this.dia) {
    this.colorCounter++;
    if (this.colorCounter > this.colorChangeDelay) {
      this.colorIndex = (this.colorIndex + 1) % 3; // Ciclo entre 0, 1 y 2 (R, G, B)
      this.colorCounter = 0;
    }

    // Cambia el color basado en el índice
    stroke(
      this.colorIndex === 0 ? 255 : 0,
      this.colorIndex === 1 ? 255 : 0,
      this.colorIndex === 2 ? 255 : 0
    );
  } else {
    stroke(255);
  }

  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

// Actualiza el canvas y genera nuevos puntos en redimensionar
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateTextPoints(words[currentWordIndex]);
}
