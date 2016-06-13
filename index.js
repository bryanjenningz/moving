var state = {
  x: 0,
  y: 0,
  keysDown: {west: false, north: false, east: false, south: false},
  direction: 'south',
  image: 'image/stand/south.gif',
  fireball: null
}

var hero = document.querySelector('#hero')
var fireball = document.querySelector('#fireball')

var directionCodes = {'37': 'west', '38': 'north', '39': 'east', '40': 'south'}
var keys = {s: 83}
var constants = {
  gameWidth: 400,
  fireballWidth: 44,
  fireballSpeed: 3,
  heroWidth: 23,
  heroHeight: 26
}

var update = state => {
  var vx = (state.keysDown.west && -1) || (state.keysDown.east && 1) || 0
  var vy = (state.keysDown.north && -1) || (state.keysDown.south && 1) || 0
  var direction = state.keysDown.west ? 'west' :
                  state.keysDown.east ? 'east' :
                  state.keysDown.north ? 'north' :
                  state.keysDown.south ? 'south' : state.direction

  if (state.fireball) {
    var fireball = Object.assign({}, state.fireball, {
      x: state.fireball.x + state.fireball.vx,
      y: state.fireball.y + state.fireball.vy
    })

    var {fireballWidth, gameWidth} = constants
    var fireballUpperBound = gameWidth - fireballWidth

    if (fireball.x <= 0 || fireball.y <= 0 || fireball.x >= fireballUpperBound || fireball.y >= fireballUpperBound) {
      fireball = null
    }
  }

  return Object.assign({}, state, {
    x: state.x + vx,
    y: state.y + vy,
    image: `images/hero/${vx || vy ? 'walk' : 'stand'}/${direction}.gif`,
    direction,
    fireball
  })
}

var draw = state => {
  hero.style.left = state.x + 'px'
  hero.style.top = state.y + 'px'
  if (hero.getAttribute('src') !== state.image) {
    hero.setAttribute('src', state.image)
  }

  if (state.fireball) {
    fireball.style.left = state.fireball.x + 'px'
    fireball.style.top = state.fireball.y + 'px'
    fireball.style.display = 'block'
  } else {
    fireball.style.display = 'none'
  }
}

var tick = () => {
  state = update(state)
  draw(state)
  requestAnimationFrame(tick)
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
      x: state.x + (state.direction === 'west' ? -heroWidth :
                   state.direction === 'east' ? heroWidth : 0)
                 + (heroWidth / 2) - (fireballWidth / 2),
      y: state.y + (state.direction === 'north' ? -heroHeight :
                   state.direction === 'south' ? heroHeight : 0)
                 + (heroHeight / 2) - (fireballWidth / 2),
      vx: fireballSpeed * (state.direction === 'west' ? -1 :
                          state.direction === 'east' ? 1 : 0),
      vy: fireballSpeed * (state.direction === 'north' ? -1 :
                          state.direction === 'south' ? 1 : 0)
    }
  }
})

tick()
