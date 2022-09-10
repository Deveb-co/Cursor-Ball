export function $(query,addStuff = false) {

  let el = document.querySelector(query);

  if( !addStuff ) return el

  el = attachStuff(el,query)

  return el
  
}

export function $all(query) {
  return Array.from(document.querySelectorAll(query));
}

export function $el(tag,atts,addStuff = false) {

  let element = document.createElement(tag)

  if( atts )
    Object.entries(atts).forEach( ([att,val]) => {
      element.setAttribute(att,val)
    })

  if( !addStuff ) return element

  element = attachStuff(element)

  return element
}

export function $make(el = 'div',options = {}) {

  const element = document.createElement(el)

  if( options.class ) {
    addClass(options.class)
  }

  if( options.attr ) {
    addAttr(options.attr)
  }

  if( options.data ) {
    addData(options.data)
  }

  function returnThis() {
    return {
      el: element,
      addClass,
      addAttr,
      addData,
      css,
      append,
      text,
      getText,
      html,
      htmlInsert,
      getHtml,
      on
    }
  }

  function addClass(classNames) {
    Array.isArray(classNames) ? 
      element.classList.add(...classNames) 
    : 
      element.classList.add(classNames)

    return returnThis()
  }

  function addAttr(attr, value = '') {
    if ( Array.isArray(attr) ) {

      if( Array.isArray(attr[0]) ) 
        attr.forEach( item => {
          element.setAttribute(item[0],item[1])
        })
      else element.setAttribute(...attr)
    } else element.setAttribute(attr,value)

    return returnThis()

  }

  function addData( data ) {

    if ( Array.isArray(data) ) {
      data.forEach( item => {
        Array.isArray(item) ?
          element.dataset[item[0]] = item[1]
        :
          element.dataset[item] = ''
      })
    } else element.dataset[data]

    return returnThis()

  }

  function css() {
    return element.style
  }

  function append(...elements) {

    try {

      if ( Array.isArray(elements)) elements.forEach( nodeChild => {
        element.appendChild(nodeChild)
      })
      else element.appendChild(elements)

    } catch(err) {
      console.log('error happened in append function while trying to append')
      console.log(elements)
      console.log('to')
      console.log(element)
    }

    return returnThis()

  }

  function text(val = null) {

    element.innerText = val

    return returnThis()

  }

  function getText() {
    return element.innerText
  }

  function html(val = null) {

    element.innerHTML = val

    return returnThis()

  }

  function htmlInsert(insert) {
    element.innerHTML += val

    return returnThis()

  }

  function getHtml() {
    return element.innerHTML
  }

  function on( eventName = '', fn = () => {} ) {

    element.addEventListener(eventName, fn)

    return returnThis()

  }

  return returnThis()

}

export function createRateStars(num) {
  const starImgs = []

  while( num > 0 ) {

    const star = $make('img').addAttr([
      ['src', 'pics/star.svg'],
      ['alt', 'review-rate']
    ])

    if( num >= 1 ) star.addClass('star')
    else star.addClass(['star','half'])

    starImgs.push(star.el)
    num--
  }

  return starImgs
}

export function shortenText(text,maxLength = 180,withDots = true) {
  const splitted = text.split(' ')
  let shortedStr = ''

  while( shortedStr.length < maxLength ) {
    shortedStr += splitted.shift() + ' '
  }

  return withDots ? shortedStr + ' ...' : shortedStr
}

export function attachStuff(el, query = '') {

  el.on = (eventName,fn) => {
    el.addEventListener(eventName,fn)
    return el
  }

  el.onAllChildren = (eventName,sl,fn) => {

    if( Array.isArray(sl) ) {
      sl.forEach( selector => {
        
        const foundEls = $all(`${query} ${selector}`.trim())
        foundEls.length ?
          foundEls.forEach( element => {
            element.addEventListener(eventName, fn)
          })
        :
          ''
      })
    } else {

      const foundEls = $all(`${query} ${sl}`.trim())

      foundEls ?
        foundEls.forEach( element => {
          element.addEventListener(eventName, fn)
        })
      :
        ''
    }

    return el
  }

  el.rmOn = (eventName,fn) => {
    el.removeEventListener(eventName,fn)
    return el
  }

  el.rmOnAll = (eventName,sl,fn) => {

    if( Array.isArray(sl) ) {
      sl.forEach( selector => {
        
        const foundEls = $all(`${query} ${selector}`.trim())
        foundEls.length ?
          foundEls.forEach( element => {
            element.removeEventListener(eventName, fn)
          })
        :
          ''
      })
    } else {

      const foundEls = $all(`${query} ${sl}`.trim())

      foundEls ?
        foundEls.forEach( element => {
          element.removeEventListener(eventName, fn)
        })
      :
        ''
    }

    return el
  }

  el.toggleClass = (className) => {
    const splitted = className.split(' ')

    splitted.length > 1 ?
      splitted.forEach( className => {
        el.classList.toggle(className)
      })
    :
      el.classList.toggle(className)
  }

  const coords = (el) => el.getBoundingClientRect()

  el.height = () => coords(el).height

  el.outerHeight = () => coords(el.parentElement).height

  el.width = () => {
    coords(el).width
  }

  el.outerWidth = () => coords(el.parentElement).width

  el.getParent = () => el.parentElement

  el.data = (dataName) => el.dataset[dataName]

  el.html = (content) => {
    el.innerText = content
    return el
  }

  el.addClass = (className) => {
    const splitted = className.split(' ')
    splitted.length > 1 ?
      splitted.forEach( className => {
        el.classList.add(className)
      })
    :
      el.classList.add(className)
  }

  el.removeClass = (className) => {
    const splitted = className.split(' ')

    splitted.length > 1 ?
      splitted.forEach( className => {
        el.classList.remove(className)
      })
    :
      el.classList.remove(className)
  }

  return el
}

export function getOffsetTop(element) {

  const pos = getComputedStyle(element).position
  if( pos === 'absolute' ) 
    return getOffsetTop(element.offsetParent) + element.offsetTop
  if( pos === 'relative' ) 
    return getOffsetTopIfRelative(element.offsetParent) + element.offsetTop
  
  return element &&
      ( element.offsetTop === 0 && element.offsetParent ? getOffsetTop(element.offsetParent) : element.offsetTop);
}

export function isTouchScreendevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;      
};

function getOffsetTopIfRelative(element) {
  const pos = getComputedStyle(element).position

  if( pos === 'relative' ) return element.offsetTop
  else return getOffsetTopIfRelative(element.parentElement)
}