var state = {
  hero: {
    x: 0,
    y: 0
  },
  keysDown: {west: false, north: false, east: false, south: false},
  direction: 'south',
  image: 'image/stand/south.gif',
  fireball: null,
  monster: {
    x: 200,
    y: 200,
    vx: 0,
    vy: 0
  }
}

var players = {}
var imgs = {}

var hero = document.querySelector('#hero')
var fireball = document.querySelector('#fireball')
var game = document.querySelector('#game')

var directionCodes = {'37': 'west', '38': 'north', '39': 'east', '40': 'south'}
var keys = {s: 83}
var constants = {
  gameWidth: 400,
  fireballWidth: 44,
  fireballSpeed: 3,
  heroWidth: 23,
  heroHeight: 26,
  monsterWidth: 50
}

var update = state => {
  var vx = (state.keysDown.west && -1) || (state.keysDown.east && 1) || 0
  var vy = (state.keysDown.north && -1) || (state.keysDown.south && 1) || 0
  var direction = state.keysDown.west ? 'west' :
                  state.keysDown.east ? 'east' :
                  state.keysDown.north ? 'north' :
                  state.keysDown.south ? 'south' : state.direction

  var {fireballWidth, monsterWidth, heroWidth, gameWidth} = constants
  var hero = updateObject(Object.assign({}, state.hero, {vx, vy}), gameWidth - heroWidth, (obj, newObj) => {
    if (newObj.x <= 0) {
      return Object.assign({}, newObj, {x: gameWidth - heroWidth - 1})
    } else if (newObj.x >= gameWidth - heroWidth) {
      return Object.assign({}, newObj, {x: 1})
    } else if (newObj.y <= 0) {
      return Object.assign({}, newObj, {y: gameWidth - heroWidth - 1})
    } else if (newObj.y >= gameWidth - heroWidth) {
      return Object.assign({}, newObj, {y: 1})
    }
  })
  var fireball = updateObject(state.fireball, gameWidth - fireballWidth)
  var monster = updateObject(state.monster, gameWidth - monsterWidth)

  // Fireball-monster collision detection
  if (fireball && monster && isCollision(fireball, monster)) {
    fireball = null
    monster = null
  }

  if (!monster) {
    monster = respawnMonster()
  }

  return Object.assign({}, state, {
    hero,
    image: `images/hero/${vx || vy ? 'walk' : 'stand'}/${direction}.gif`,
    direction,
    fireball,
    monster
  })
}

var updateObject = (object, upperBound, outOfBoundsCallback = (obj, newObj) => null) => {
  if (object == null) {
    return null
  }

  var {x, y, vx, vy} = object
  if (![x, y, vx, vy].every(value => typeof value === 'number')) {
    return null
  }

  var updatedObject = Object.assign({}, object, {
    x: x + vx,
    y: y + vy
  })

  if (updatedObject.x < 0 || updatedObject.y < 0 || updatedObject.x >= upperBound || updatedObject.y >= upperBound) {
    updatedObject = outOfBoundsCallback(object, updatedObject)
  }

  return updatedObject
}

var respawnMonster = () => {
  var {gameWidth} = constants
  var location
  while (!location || isCollision(location, hero, 100)) {
    location = {x: Math.random() * gameWidth, y: Math.random() * gameWidth}
  }
  return Object.assign({}, location, {vx: 0, vy: 0})
}

var draw = state => {
  // hero.style.left = state.hero.x + 'px'
  // hero.style.top = state.hero.y + 'px'
  // if (hero.getAttribute('src') !== state.image) {
  //   hero.setAttribute('src', state.image)
  // }

  if (state.fireball) {
    fireball.style.left = state.fireball.x + 'px'
    fireball.style.top = state.fireball.y + 'px'
    fireball.style.display = 'block'
  } else {
    fireball.style.display = 'none'
  }

  if (state.monster) {
    monster.style.left = state.monster.x + 'px'
    monster.style.top = state.monster.y + 'px'
    monster.style.display = 'block'
  } else {
    monster.style.display = 'none'
  }

  for (var id in players) {
    var otherState = players[id]
    var otherHero = otherState.hero
    var img = imgs[id]
    img.style.left = otherHero.x + 'px'
    img.style.top = otherHero.y + 'px'
    if (img.getAttribute('src') !== otherState.image) {
      img.setAttribute('src', otherState.image)
    }
  }
}

var tick = () => {
  state = update(state)
  draw(state)
  requestAnimationFrame(tick)
  socket.emit('update', state)
}

var isCollision = (obj1, obj2, minDistance = 40) => {
  return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2)) < minDistance
}

addEventListener('keydown', e => {
  if (directionCodes[e.keyCode]) {
    var direction = directionCodes[e.keyCode]
    state.keysDown[direction] = true
  }
})

addEventListener('keyup', e => {
  if (directionCodes[e.keyCode]) {
    var direction = directionCodes[e.keyCode]
    state.keysDown[direction] = false
  } else if (e.keyCode === keys.s && !state.fireball) {
    var {heroWidth, heroHeight, fireballWidth, fireballSpeed} = constants
    state.fireball = {
      x: state.hero.x + (state.direction === 'west' ? -heroWidth :
                   state.direction === 'east' ? heroWidth : 0)
                 + (heroWidth / 2) - (fireballWidth / 2),
      y: state.hero.y + (state.direction === 'north' ? -heroHeight :
                   state.direction === 'south' ? heroHeight : 0)
                 + (heroHeight / 2) - (fireballWidth / 2),
      vx: fireballSpeed * (state.direction === 'west' ? -1 :
                          state.direction === 'east' ? 1 : 0),
      vy: fireballSpeed * (state.direction === 'north' ? -1 :
                          state.direction === 'south' ? 1 : 0)
    }
  }
})

var socket = io()

socket.on('update users state', ({usersState}) => {
  players = usersState

  // Add images for players that just logged in
  for (var id in players) {
    if (!imgs[id]) {
      var img = document.createElement('img')
      img.setAttribute('src', 'images/hero/stand/south.gif')
      img.setAttribute('class', 'player')
      imgs[id] = img
      game.appendChild(img)
    }
  }

  // Remove images for players who are logged out
  for (var id in imgs) {
    if (!players[id]) {
      var img = imgs[id]
      game.removeChild(img)
      delete imgs[id]
    }
  }
})

tick()
