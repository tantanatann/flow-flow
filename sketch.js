  // Soft Flow Field Animation
// Variables for animation control
let particles = [];
let flowfield;
let cols, rows;
let zoff = 0;

// Parameters
// Number of particles
let numParticles = 800;      
// Size of particles
let particleSize = 4;        
// Transparency of particles
let particleAlpha = 30;    
// Background fade strength
let fadeStrength = 10;       
// How strongly particles follow the flow field
let flowStrength = 0.5; 
let flowComplexity = 0.1; 
let flowChangeSpeed = 0.0005; 
let colorChangeSpeed = 0.5;  
let hue = 0;                 

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Calculate grid size for the flow field
  let scl = 20;
  cols = floor(width / scl);
  rows = floor(height / scl);
  
  // Initialize flow field array
  flowfield = new Array(cols * rows);
  
  // Create particles
  for (let i = 0; i < numParticles; i++) {
    particles[i] = new Particle();
  }
  
  // Start with black background
  background(0);
}

function draw() {
  // Apply semi-transparent background for fade effect
  fill(0, 0, 0, fadeStrength);
  noStroke();
  rect(0, 0, width, height);
  
  // Update flow field
  updateFlowField();
  
  // Update and display particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
  
  // Shift colors over time
  hue += colorChangeSpeed;
  if (hue > 360) {
    hue = 0;
  }
}

// Update the flow field based on Perlin noise
function updateFlowField() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      
      // Use Perlin noise to create smooth angles
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      
      // Create a vector from the angle
      let v = p5.Vector.fromAngle(angle);
      v.setMag(flowStrength);
      flowfield[index] = v;
      
      xoff += flowComplexity;
    }
    yoff += flowComplexity;
  }
  zoff += flowChangeSpeed;
}

// Particle class
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    
    // Each particle gets a slightly different base color
    this.colorOffset = random(60);
  }
  
  // Update particle position
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  // Apply force to particle
  applyForce(force) {
    this.acc.add(force);
  }
  
  // Follow the flow field
  follow(flowfield) {
    let x = floor(this.pos.x / 20);
    let y = floor(this.pos.y / 20);
    let index = x + y * cols;
    
    // Make sure we're within the flow field
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      let force = flowfield[index];
      this.applyForce(force);
    }
  }
  
  // Wrap around edges
  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
  
  // Display the particle
  show() {
    // Calculate color based on position and time
    let currentHue = (hue + this.colorOffset) % 360;
    // Softer pastel colors
    let currentColor = color(currentHue, 50, 90, particleAlpha);
    
    noStroke();
    fill(currentColor);
    ellipse(this.pos.x, this.pos.y, particleSize, particleSize);
  }
}

// Pause/resume the animation on mouse press
let paused = false;
function mousePressed() {
  paused = !paused;
  if (paused) {
    noLoop();
  } else {
    loop();
  }
}

// Save the canvas as an image when 's' is pressed
function keyPressed() {
  if (key === 's') {
    save("soft_flow_animation.png");
  }
}
