function place(n) {
  return [10, 100].find(x => n % x === n)
}

function makeId(m, n = 0) {
  return m * place(n) + n
}

export function makeVisit(ultra, state) {
  let currLen = history.length, visited = ultra.visited || []
  let origId = state && state.id, id, newState
  let [len, ...visits] = visited
  if (!len || currLen > len) {
    id = makeId(currLen)
    visited = [currLen, id]
  } else {
    id = origId || makeId(currLen, visits.length)
    if (!visits.length || id > visits[visits.length - 1]) {
      visited = [currLen, ...visits, id]
    }
  }
  if (origId !== id) newState = Object.assign({}, state, { id })
  return { visited, newState }
}

export function recalibrate(msg) {
  let { ultra, state } = msg, currentLen = history.length
  let [len, ...visits] = ultra.visited, delta = 0
  if (state && state.id && currentLen === len) {
    delta = visits[visits.length - 1] === state.id ? -1 : 1
  }
  console.log('recalibrated: ', delta)
  return delta
}
