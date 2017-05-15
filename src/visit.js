function place(n) {
  return [10, 100].find(x => n % x === n);
}

function makeId(m, n = 0) {
  return m * place(n) + n;
}

export function makeVisit(ultra, state) {
  let id, currentLen = history.length, result = ultra.visited || [];
  let [len, ...visits] = result;
  if (!len || currentLen > len) {
    id = makeId(currentLen);
    result = [currentLen, id];
  } else {
    id = state ? state.id : makeId(currentLen, visits.length);
    if (!visits.length || id > visits[visits.length - 1]) {
      result = [currentLen, ...visits, id];
    }
  }
  return [result, id];
}

export function recalibrate(msg) {
  let { ultra, state } = msg, currentLen = history.length;
  let [len, ...visits] = ultra.visited, delta = 0;
  if (state && state.id && currentLen === len) {
    delta = visits[visits.length - 1] === state.id ? -1 : 1;
  }
  console.log('recalibrated: ', delta);
  return delta;
}
