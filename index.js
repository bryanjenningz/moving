var state = {
  x: 0,
  y: 0,
  keysDown: {west: false, north: false, east: false, south: false},
  direction: 'south',
  image: 'image/stand/south.gif'
}

var hero = document.querySelector('#hero')

var directionCodes = {'37': 'west', '38': 'north', '39': 'east', '40': 'south'}

var update = state => {
  var vx = (state.keysDown.west && -1) || (state.keysDown.east && 1) || 0
  var vy = (state.keysDown.north && -1) || (state.keysDown.south && 1) || 0
  var direction = state.keysDown.west ? 'west' :
                  state.keysDown.east ? 'east' :
                  state.keysDown.north ? 'north' :
                  state.keysDown.south ? 'south' : state.direction

  return Object.assign({}, state, {
    x: state.x + vx,
    y: state.y + vy,
    image: `images/hero/${vx || vy ? 'walk' : 'stand'}/${direction}.gif`,
    direction
  })
}

var draw = state => {
  hero.style.left = state.x + 'px'
  hero.style.top = state.y + 'px'
  if (hero.getAttribute('src') !== state.image) {
    hero.setAttribute('src', state.image)
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
  }
})

tick()
