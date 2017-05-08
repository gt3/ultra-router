export default function createEvent(key, detail) {
  let event, bubbles = false, cancelable = true
  try {
    event = new CustomEvent(key, { detail, bubbles, cancelable })
  } catch (ex) {
    if (ex instanceof TypeError) {
      event = document.createEvent('Event')
      event.detail = detail
      event.initEvent(key, bubbles, cancelable)
    } else throw ex
  }
  return event
}
