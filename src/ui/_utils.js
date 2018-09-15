exports.createElement = (
  name,
  {
    alt = null,
    checked = null,
    className = null,
    disabled = null,
    height = null,
    href = null,
    innerText = null,
    role = null,
    src = null,
    title = null,
    type = null,
    width = null,
    style = null,
    children = [],
    onChange = null,
    onClick = null,
    onDrop = null,
    onMousedown = null,
    map = null
  } = {}
) => {
  const element = document.createElement(name)

  if (alt) {
    element.alt = alt
  }
  if (typeof checked === 'boolean') {
    element.checked = checked
  }
  if (className) {
    element.className = className
  }
  if (disabled) {
    element.disabled = disabled
  }
  if (height) {
    element.height = height
  }
  if (href) {
    element.href = href
  }
  if (innerText) {
    element.innerText = innerText
  }
  if (role) {
    element.role = role
  }
  if (src) {
    element.src = src
  }
  if (title) {
    element.title = title
  }
  if (type) {
    element.type = type
  }
  if (width) {
    element.width = width
  }

  if (children.length) {
    children.forEach(child => element.appendChild(child))
  }

  if (style) {
    Object.keys(style).forEach(styleAttr => {
      element.style[styleAttr] = style[styleAttr]
    })
  }

  if (onChange) {
    element.addEventListener('change', onChange)
  }
  if (onClick) {
    element.addEventListener('click', onClick)
  }
  if (onDrop) {
    element.addEventListener('dragover', event => {
      event.preventDefault()
    })
    element.addEventListener('drop', onDrop)
  }
  if (onMousedown) {
    element.addEventListener('mousedown', onMousedown)
  }

  if (map) {
    map(element)
  }

  return element
}

exports.getImageUrl = async img => {
  const reader = new window.FileReader()
  reader.readAsDataURL(img)

  const url = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()

  return url
}
