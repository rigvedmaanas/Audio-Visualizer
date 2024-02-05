let sound;
let fft
let font;
let color1 = ['E63946', 'F1FAEE', 'A8DADC', '457B9D', '1D3557'] 
//color1 = ['F72585', '7209B7', '3A0CA3', '4361EE', '4CC9F0']
//color1 = ['FBFF12', '41EAD4', 'F20089', '2D00F7', 'FF6201', 'FF01FB']
let particles = []
let started = false
let time;
let songName = display
let song = path
let colour = "#" + color1[0]
let bass = 230;
function preload() {
  console.log(song)
  sound = loadSound(song);
  angleMode(DEGREES)
  font = loadFont(font_name)

}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT()


  background(255/20)

}
function shortenWave(arr, val) {
  let vec = [];
 
  for (let i = 0; i < arr.length; i++){
    if (i % val == 0){
      vec.push(arr[i])
    }
  }
  return vec
}

function draw() {
  noCursor()
  background(255/20, 255/20,255/20, 75)



  translate(width / 2, height / 2)
  smooth(0.1)
  fft.analyze()
  let amp = fft.getEnergy(20, 200)

  let p = new Particle()
  particles.push(p)
  rotate(-frameCount/100)
  for (let i = particles.length-1; i >= 0; i--){
    if (!particles[i].out()){
      particles[i].update(amp > bass)
      particles[i].show()
    } else {
      particles.splice(i, 1)
    }
    
  }
  
  let wave = fft.waveform()
  //console.log(wave.length)
  //wave = shortenWave(wave, 5)
  //wave = shortenWave(wave, 2)
 

  //console.log(wave.length)

  noFill()
  //let colour = "#" + color1[Math.floor(Math.random()*color1.length)]

  //drawingContext.shadowBlur = 20;
  //drawingContext.shadowColor = colour
  if (amp > 230) colour = "#" + color1[Math.floor(Math.random()*color1.length)]
  else colour = "#" + color1[0]
  stroke(color(colour))
  strokeWeight(2)
  rotate(frameCount/100)
  
  for (let t = -1; t <= 1; t += 2) {
    beginShape()
    let lastWave = 0
    let r = lastWave
    for (let a = -1; a < 182; a++) {
      let index = floor(map(a, -10, 180, 0, wave.length - 200))
      if (r == 0){
        lastWave = map(wave[index], -1, 1, 150, 350)
        r = lastWave
      } else{
        r = lerp(lastWave, map(wave[index], -1, 1, 150, 350), 0.05)

      }
      
      let x = sin(a) * r  * t
      let y = cos(a) * r
      curveVertex(x, y)
      lastWave = r
    }
    endShape()

  }
  //rotate(-frameCount)
  for (let t = -1; t <= 1; t += 2) {
    beginShape()

    for (let a = -1; a < 182; a++) {
      let index = floor(map(a, -10, 180, 0, wave.length - 200))
      let r = map(wave[index], -1, 1, 80, 130)
      let x = sin(a) * r  * t
      let y = cos(a) * r
      curveVertex(x, y)
    }
    endShape()

  }
  fill(255)
  noStroke()
  textAlign(CENTER, CENTER)
  textSize(60);
  textFont(font);
  text(songName, 0, height/2-40-70);
}


function mouseClicked() {
  if (sound.isPlaying()) {
    sound.pause()
 
  } else {
    sound.play()
  
  }
}


function windowResized() { 
    
  resizeCanvas(windowWidth, windowHeight)
} 

/*
function mousePressed() {
  userStartAudio();
}
*/

class Particle{
  constructor(){
    this.pos = p5.Vector.random2D().mult(250)
    this.vel = createVector(0, 0)
    this.acc = this.pos.copy().mult(random(0.00001, 0.000001))
    

  }
  update(val){
    this.acc = this.pos.copy().mult(1/100000)
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    if (val){
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
    }
    

    
  }
  out(){
    if (dist(this.pos.x, this.pos.y, 0, 0) > dist(0, 0, width/2 ,height/2)) {
    //if (this.pos.x < -width/2 || this.pos.x > width/2 || this.pos.y < -height/2 || this.pos.y > height/2){
      return true;
    } else {
      return false;
    }
  }
  show(){
    noStroke()
    fill(color("#" + color1[Math.floor(Math.random()*color1.length)]))
    circle(this.pos.x, this.pos.y, 4)
  }
} 