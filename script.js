const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
const fps = 20
let difficult = 1
let menu = "main"
let choosedHero=1
const tileSize = Math.ceil((window.innerWidth + window.innerHeight) / 50)
let buttons = []
for (let i = 0; i < 5; i++) {
  buttons[i] = false
}
let mousedown = false
let mouseclick = false
document.onmousedown = function(event) {
  mouseclick = true
  mousedown = true
}
document.onmouseup = function(event) {
  mouseclick = false
  mousedown = false
}
let mouseX = 0
let mouseY = 0
document.onmousemove = function(event) {
  mouseX = Math.round(event.x / window.screen.width * canvas.width)
  mouseY = Math.round(event.y / window.screen.height * canvas.height)
}
document.onkeydown = function(event) {
  if (event.key == "w" || event.key == "W") {
    buttons[0] = true;
  }
  if (event.key == "s" || event.key == "S") {
    buttons[1] = true;
  }
  if (event.key == "a" || event.key == "A") {
    buttons[2] = true;
  }
  if (event.key == "d" || event.key == "D") {
    buttons[3] = true;
  }
  if (event.keyCode ==32) {
    buttons[4] = true;
  }
  
}
document.onkeyup = function(event) {
  if (event.key == "w" || event.key == "W") {
    buttons[0] = false;
  }
  if (event.key == "s" || event.key == "S") {
    buttons[1] = false;
  }
  if (event.key == "a" || event.key == "A") {
    buttons[2] = false;
  }
  if (event.key == "d" || event.key == "D") {
    buttons[3] = false;
  }
  if (event.keyCode ==32) {
    buttons[4] = false;
  }
}

function drawRotated(context,image,x,y,degrees,size){
  context.save();
  context.translate(x,y);
  context.rotate(degrees*Math.PI/180);
  context.drawImage(image,-(image.width*size)/2,-(image.height*size)/2,image.width*size,image.height*size);
  context.restore();
}

function drawText(text, color, x, y, font, size) {
  ctx.font = size + "px " + font;
  ctx.fillStyle = color;
  ctx.fillText(text, x - (text.length / 4 * size), y - (size / 2));
}

function getDir(x1,y1,x2,y2){
  let dir=Math.atan2(y2-y1,x2-x1)*180/Math.PI
  return dir
}

function distanse(x1, y1, x2, y2) {
  let dist = Math.pow((((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1))), 0.5)
  return dist
}

function drawRect(color, x, y, width, height) {
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

function drawSquare(color, x, y, size) {
  drawRect(color, x, y, size, size)
}

function fillBackground(color) {
  drawRect(color, 0, 0, canvas.width, canvas.height)
}

function random(min, max) {
  let result = Math.floor(Math.random() * (max - min + 1)) + min;
  return result;
}

function axis(i) {
  if (i == 0) {
    return 0
  }
  return (i / Math.abs(i))
}

function drawCircle(color, x, y, radius) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

class GameObject {
  x
  y
  size = 1
  destroy() {
    game.objects.splice(game.objects.indexOf(this), 1)
    delete this
  }
  move(x, y) {
    if (Math.abs(x) > 0) {
      this.moveX(x, 10)
    }
    if (Math.abs(y) > 0) {
      this.moveY(y, 10)
    }
  }
  moveX(power, steps) {
    for (let i = 0; i < steps; i++) {
      let solid = 0
      let tile = game.getTile(this.x + (power / steps) + ((this.size / 2 * axis(power))), this.y)
      solid += tile
      tile = game.getTile(this.x + (power / steps) + ((this.size / 2 * axis(power))), this.y + (this.size / 2))
      solid += tile
      tile = game.getTile(this.x + (power / steps) + ((this.size / 2 * axis(power))), this.y - (this.size / 2))
      solid += tile
      if (solid > 0) {
        break;
      } else {
        this.x += power / steps
      }
    }
  }
  moveY(power, steps) {
    for (let i = 0; i < steps; i++) {
      let solid = 0
      let tile = game.getTile(this.x, this.y + (power / steps) + ((this.size / 2 * axis(power))))
      solid += tile
      tile = game.getTile(this.x + (this.size / 2), this.y + (power / steps) + ((this.size / 2 * axis(power))))
      solid += tile
      tile = game.getTile(this.x - (this.size / 2), this.y + (power / steps) + ((this.size / 2 * axis(power))))
      solid += tile
      if (solid > 0) {
        break;
      } else {
        this.y += power / steps
      }
    }
  }
  tick() {

  }
  render() {
  }
}

class Collectable extends GameObject {
  value
  time
  constructor(x, y, value = 1) {
    super()
    this.x = x
    this.y = y
    this.value = value
    this.time = 0
  }
  tick() {
    this.time += 1 / fps
    if (this.time > 1) {
      if (this.time > 10) {
        this.destroy()
      } else if (distanse(this.x, this.y, game.objects[0].x, game.objects[0].y) < 1) {
        game.objects[0].collected += this.value
        this.destroy()
      }
    }
  }
  render() {
    drawCircle("#ff0", (this.x - game.camX) * game.tileSize, (this.y - game.camY) * game.tileSize, game.tileSize / 4)
  }
}

class Enemy extends GameObject {
  dir
  speed = 4

  constructor(x, y, dir) {
    super()
    this.x = x
    this.y = y
    this.dir = Math.PI * (dir / 180)
    this.speed = 3 + difficult
  }

  tick() {
    this.x += Math.round(Math.sin(this.dir)) * (this.speed / fps)
    this.y -= Math.round(Math.cos(this.dir)) * (this.speed / fps)
    if (game.getTile(this.x, this.y) > 0) {
      this.destroy()
    }
    if (distanse(this.x, this.y, game.objects[0].x, game.objects[0].y) < 1) {
      game.over = true
    }
  }

  render() {
    drawCircle("#4a4a4a", (this.x - game.camX) * game.tileSize, (this.y - game.camY) * game.tileSize, game.tileSize / 1.8)
  }
}

class Player extends GameObject {
  specialAbilityCooldown=0
  character
  speed = 5
  dir = 0
  collected
  specialAbilityData=[]
  specialAbility(hero){
    if(hero==1){
        this.move(Math.sin(this.specialAbilityData[0]*(Math.PI/180))*this.speed*5/fps,Math.cos(this.specialAbilityData[0]*(Math.PI/180))*this.speed*-5/fps)
    }
  }
  specialAbilityActivate(hero){
    if(hero==1){
      this.specialAbilityData[0]=this.dir
      this.specialAbilityCooldown=-0.2
    }
  }
  tick() {
    this.move(((buttons[3] - buttons[2]) * this.speed / fps), ((buttons[1] - buttons[0]) * this.speed / fps))
    this.dir=getDir((this.x-game.camX)*game.tileSize,(this.y-game.camY)*game.tileSize,mouseX,mouseY)+90
    if(this.specialAbilityCooldown>0){
      this.specialAbilityCooldown-=Math.round(100/fps)/100
      if(!(this.specialAbilityCooldown>0)){
        this.specialAbilityCooldown=0
      }
    }else if(this.specialAbilityCooldown<0){
      this.specialAbilityCooldown+=Math.round(100/fps)/100
      this.specialAbility(choosedHero)
      if(this.specialAbilityCooldown>-0.1){
        if(choosedHero==1){
          this.specialAbilityCooldown=3
        }
      }
    }else{
      if(buttons[4]){
        this.specialAbilityActivate(choosedHero)
      }
    }
  }
  constructor(x, y) {
    super()
    this.x = x
    this.y = y
    this.collected = 0
    if(choosedHero==1){
      this.specialAbilityData=[0]
    }
  }
  render() {
    const renderX=(this.x-game.camX)*game.tileSize
    const renderY=(this.y-game.camY)*game.tileSize
    drawRotated(ctx,UgolekImg,renderX,renderY,this.dir-90,game.tileSize/((UgolekImg.width+UgolekImg.height)/2))
  }
}


class Game {
  map
  width
  height
  camX
  camY
  objects
  tileSize
  over
  time
  nextSpawn
  collected
  nextMoneySpawn
  wall(tile, x, y, width, height) {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        this.map[i][j] = tile
      }
    }
  }

  resetMap(width = 1, height = 1) {
    this.width = width
    this.height = height
    this.map = []
    for (let i = 0; i < width; i++) {
      this.map[i] = []
      for (let j = 0; j < height; j++) {
        this.map[i][j] = 0
      }
    }
    this.wall(1, 0, 0, width, 1)
    this.wall(1, 0, 0, 1, height)
    this.wall(1, width - 1, 0, 1, height)
    this.wall(1, 0, height - 1, width, 1)
  }
  canSpawn(x, y) {
    let can = true
    if (this.getTile(x, y) > 0) {
      can = false
    } else if ((!(this.getTile(x, y + 1) > 0)) && (!(this.getTile(x, y - 1) > 0)) && (!(this.getTile(x + 1, y) > 0)) && (!(this.getTile(x - 1, y) > 0))) {
      can = false
    }
    return can
  }

  getDir(x, y) {
    if (this.getTile(x, y + 1) > 0) {
      return 0
    } else if (this.getTile(x, y - 1) > 0) {
      return 180
    } else if (this.getTile(x - 1, y) > 0) {
      return 90
    } else if (this.getTile(x + 1, y) > 0) {
      return -90
    } else {
      return 0
    }
  }

  summonEnemy(x, y, dir) {
    this.newObject(new Enemy(x, y, dir))
  }

  summonEnemies(count) {
    for (let i = 0; i < count; i++) {
      let x
      let y
      do {
        x = random(0, this.width - 1)
        y = random(0, this.height - 1)
      } while (!(this.canSpawn(x, y)))
      this.summonEnemy(x, y, this.getDir(x, y))
    }
  }

  constructor(tileSize = 1, width = 1, height = 1) {
    this.resetMap(width, height)
    this.camX = 0
    this.camY = 0
    this.objects = []
    this.tileSize = tileSize
    this.over = false
    this.time = 0
    this.nextSpawn = fps * 5
    this.nextMoneySpawn = fps * 5
  }

  newObject(object) {
    this.objects.push(object)
  }

  tickAll() {
    for (let i in this.objects) {
      this.objects[i].tick()
    }
  }

  renderAll() {
    for (let i in this.objects) {
      this.objects[i].render()
    }
  }
  renderTile(tile, x = 0, y = 0) {
    let color = "#000"
    switch (tile) {
      case 0:
        color = "#30ba0d"
        //Земля
        break;
      case 1:
        color = "#a3a3a3"
        //Стена
        break;
    }
    drawSquare(color, x, y, this.tileSize + 1)
  }
  renderMap() {
    for (let i in this.map) {
      for (let j in this.map[i]) {
        this.renderTile(this.map[i][j], (i - this.camX-0.5) * this.tileSize, (j - this.camY-0.5) * this.tileSize)
      }
    }
  }
  summonMoney(count) {
    for (let i = 0; i < count; i++) {
      let x
      let y
      do {
        x = random(0, this.width - 1)
        y = random(0, this.height - 1)
      } while (this.getTile(x, y) > 0)
      this.newObject(new Collectable(x, y, 1))
    }
  }
  getTile(findX, findY) {
    let x = Math.round(findX)
    let y = Math.round(findY)
    if (x < 0) {
      x = 0
    }
    if (x > this.width - 1) {
      x = this.width - 1
    }
    if (y < 0) {
      y = 0
    }
    if (y > this.height - 1) {
      y = this.height - 1
    }
    try {
      return this.map[x][y]
    } catch (e) {
      console.log(x + " " + y)
      return 1
    }
  }
  render() {
    fillBackground("#000")
    this.renderMap()
    if (this.over) {
      drawText("Игра окончена", "#f00", canvas.width / 2, canvas.height / 2, "Arial", 32)
      drawText("Нажмите где либо чтобы продолжить", "#fff", canvas.width / 2, canvas.height / 2 + canvas.height / 10, "Arial", "20")
      if (mouseclick) {
        menu = "game over"
      }
    } else {
      this.renderAll()
      drawText(String(Math.floor(this.time)), "#fff", canvas.width / 2, 30, "Arial", 10)
      drawText(String(this.collected), "#ff0", canvas.width / 2 + 30, 30, "Arial", 10)
      drawText(String(Math.ceil(this.objects[0].specialAbilityCooldown)), "#fff", canvas.width *0.75, canvas.height*0.75, "Arial", 10)
    }
  }
  getCollectedCount() {
    this.collected = 0
    for (let i in this.objects) {
      if (this.objects[i] instanceof Player) {
        this.collected += this.objects[i].collected
      }
    }
  }
  tick() {
    this.getCollectedCount()
    this.render()
    if (!this.over) {
      this.tickAll()
      this.camX = this.objects[0].x - (canvas.width / this.tileSize / 2)
      this.camY = this.objects[0].y - (canvas.height / this.tileSize / 2)
      this.time += 1 / fps
      if (this.nextSpawn > 0) {
        this.nextSpawn--
      } else {
        this.summonEnemies(Math.floor(this.time / (5 / (1 + ((difficult - 1) / 10)))) + difficult)
        this.nextSpawn = fps * (3-((difficult-1)/2))
      }
      if (this.nextMoneySpawn > 0) {
        this.nextMoneySpawn--
      } else {
        this.summonMoney(1)
        this.nextMoneySpawn = fps * 5
      }
    }
  }
}

function runMenu() {
  const button = function(x, y, text = "", borderSize, width, height, borderColor, textColor, bracketColor, textFont, textSize) {
    drawRect(borderColor, x - borderSize - width / 2, y - borderSize - height / 2, width + borderSize * 2, height + borderSize * 2)
    drawRect(bracketColor, x - width / 2, y - height / 2, width, height)
    drawText(text, textColor, x, y + Number(textSize), textFont, textSize)
  }
  fillBackground("#1e9600")
  drawText(mouseX + " " + mouseY + " " + mousedown + " " + mouseclick, "#fff", 100, 50, "Arial", "16")
  if (menu == "main") {
    drawText("Cat to run 2", "#fff", canvas.width / 2, canvas.height / 8 + 20, "Arial", "64")
    button(canvas.width / 2, canvas.height / 2, "Играть", 10, 200, 75, "#000", "#000", "#fff", "Arial", "40")
    button(canvas.width - 60, canvas.height - 25, "Fandom", 5, 100, 30, "#000", "#000", "#fff", "Arial", "20")
    button(canvas.width/2, canvas.height/2+canvas.height/5,"Сложность: "+difficult, 7, 175, 50,"#000", "#000", "#fff", "Arial", "25")
    if (mousedown) {
      if ((mouseX > 369) && (mouseY > 189) && (mouseX < 575) && (mouseY < 275)) {
        startGame()
      }else if ((mouseX > 830) && (mouseY > 420) && (mouseX < 935) && (mouseY < 455)) {
        console.log("Trying redirect")
        redirectThis("fandom")
      }
    }
    if((mouseX > 379) && (mouseY > 294) && (mouseX < 561) && (mouseY < 351) && mouseclick){
      difficult++
      if(difficult>5){
        difficult=1
      }
    }
  } else if (menu == "game over") {
    drawText("ИГРА ОКОНЧЕНА", "#f00", canvas.width / 2 - 25, canvas.height / 8 + 20, "Arial", "64")
    drawText("Время: " + String(Math.floor(game.time)), "#fff", canvas.width / 2 - 25, canvas.height / 4 + 20, "Arial", "16")
    drawText("Мышей собрано: " + String(game.collected), "#ff0", canvas.width / 2 - 25, canvas.height / 4 + 40, "Arial", "16")
    button(canvas.width / 2 - 250, canvas.height / 2 + 50, "Меню", 10, 150, 50, "#000", "#000", "#fff", "Arial", "30")
    button(canvas.width / 2 + 250, canvas.height / 2 + 50, "Заново", 10, 150, 50, "#000", "#000", "#fff", "Arial", "30")
    if (mouseclick) {
      if ((mouseX > 159) && (mouseY > 244) && (mouseX < 315) && (mouseY < 310)) {
        menu = "main"
      } else if ((mouseX > 624) && (mouseY > 244) && (mouseX < 785) && (mouseY < 310)) {
        startGame()
      }
    }
  }
}

function startGame() {
  restart(difficult)
  menu = "game"
}

function tick() {
  switch (menu) {
    case "game":
      game.tick()
      break
    case "main":
      runMenu()
      break
    case "game over":
      runMenu()
      break
  }
  mouseclick = false
}

function restart(diff = 1) {
  difficult = diff
  if (game instanceof Game) {
    for (let i in game.objects) {
      game.objects[i].destroy()
    }
  }
  game = new Game(tileSize, 15, 15)
  game.newObject(new Player(2, 2))
}
var game
restart(1)
setInterval(tick, Math.floor(1000 / fps))