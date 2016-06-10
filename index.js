var state = {
  x: 0,
  y: 0,
  direction: {west: false, north: false, east: false, south: false},
  image: 'image/stand/south.gif'
}

var hero = document.querySelector('#hero')

var directionCodes = {'37': 'west', '38': 'north', '39': 'east', '40': 'south'}

var update = state => {
  var vx = (state.direction.west && -1) || (state.direction.east && 1) || 0
  var vy = (state.direction.north && -1) || (state.direction.south && 1) || 0
  return Object.assign({}, state, {
    x: state.x + vx,
    y: state.y + vy,
    image: 'images/hero/' + (vx || vy ? 'walk/' : 'walk/' || 'stand/') + (
      state.direction.west ? 'west' :
      state.direction.east ? 'east' :
      state.direction.north ? 'north' : 'south'
    ) + '.gif'
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
    state.direction[direction] = true
  }
})

addEventListener('keyup', e => {
  if (directionCodes[e.keyCode]) {
    var direction = directionCodes[e.keyCode]
    state.direction[direction] = false
  }
})

tick()
