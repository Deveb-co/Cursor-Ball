import '../assets/cursor.scss'
import gsap from 'gsap'

export default class DvbCursor {
  constructor(options) {

    this.options = {
        container: "body",
        speed: 0.2,
        ...options
    }

    this.body = document.querySelector(this.options.container)
    document.createElement('div')

    // Cursor main div
    const cursorEl = document.createElement('div')
    cursorEl.classList.add('vim-cursor')
    this.el = cursorEl

    // Cursor ball
    const cursorBallEl = document.createElement('div')
    cursorBallEl.classList.add('cursor-ball')
    this.ball = cursorBallEl

    const cursorText = document.createElement('div')
    cursorText.classList.add('vim-cursor-text')
    this.text = cursorText
    this.isHidden = false

    
    this.init();

  }

  init() {
    this.el.append(this.text);
    this.el.append(this.ball);
    this.body.append(this.el);
    this.bind();
    this.move(-window.innerWidth, -window.innerHeight, 0);
  }

  bind() {

    this.bindEventListeners()

    // Hide cursor ball on mouse leaving the container
    this.body.addEventListener('mouseleave', this.hideCursorBall)

    // Show cursor ball on mouse leaving the container
    this.body.addEventListener('mouseenter', this.showCursorBall)

    // update cursor ball position on mouse move
    this.body.addEventListener('mousemove', this.updateOnMouseMove)

    // Reduce cursor ball size to indicate mouse left click down
    this.body.addEventListener('mousedown', this.pointerActive)

    // Change the cursor ball size back to normal after mouse left click up
    this.body.addEventListener('mouseup', this.pointerDeactive)

    // Change the cursor ball size back to normal after drag end
    this.body.addEventListener('dragend', this.pointerDeactive)

    // Get all the elements we need for different cursor modes
    const {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements
    } = this.getAllPointerElements()

    // Set cursor to pointer when hovers on links, inputs, textarea and buttons
    pointerStateElements.forEach( el => {
      el.addEventListener('mouseover', this.onCursor6)
      el.addEventListener('mouseleave', this.onCursor7)
    })
    
    // Hide cursor ball when an Iframe is hovered
    iframes.forEach( el => {
      el.addEventListener('mouseenter',this.showCursorBall)
      el.addEventListener('mouseleave',this.hideCursorBall)
    })
    
    // Get elements with data-cursor and apply the classes or state to cursor ball
    dataCursorElements.forEach( el => {
      el.addEventListener('mouseenter',this.addCustomState)
      el.addEventListener('mouseleave',this.removeCustomState)
    })

    // Add cursor text to elements with cursor-text
    cursorTextElements.forEach( el => {
      el.addEventListener('mouseenter',this.setCursorText)
      el.addEventListener('mouseleave',this.removeCursorText)
    })

    // Add cursor stick for elements with cursor-stick
    cursorStickElements.forEach( el => {
      el.addEventListener('mouseenter',this.enableStick)
      el.addEventListener('mouseleave',this.disableStick)
    })
    
    // Reset cursor ball mousemove on window resize
    // window.addEventListener('resize', this.resetMousemoveOnResize )
  }

  bindEventListeners() {

    this.hideCursorBall = function() {
      this.hide();
    }

    this.showCursorBall = function() {
      this.show();
    }

    this.updateOnMouseMove = function (e) {

      const x = this.stick ? this.stick.x - ((this.stick.x - e.clientX) * 0.15) : e.clientX
      const y = this.stick ? this.stick.y - ((this.stick.y - e.clientY) * 0.15) : e.clientY
  
      if( !this.pos || !this.pos.x === undefined ) {
  
          this.pos = {
              x,
              y
          }
  
      } else {
  
          if( this.lastTimeUpdate ) {
      
              const now = Date.now()
      
              if( now - this.lastTimeUpdate >= 20 ) {
                  const oldX = this.pos.x
                  const oldY = this.pos.y
  
                  this.pos.x = x
                  this.pos.y = y
  
                  this.updatePhysics()
                  this.lastTimeUpdate = Date.now()
          
                  this.pos.oldX = oldX
                  this.pos.oldY = oldY
  
              } else {
                  this.pos.x = x
                  this.pos.y = y
              }
  
          } else {
              const oldX = this.pos.x
              const oldY = this.pos.y
      
              this.lastTimeUpdate = Date.now()
      
              this.pos = {
                  x: this.stick ? this.stick.x - ((this.stick.x - e.clientX) * 0.15) : e.clientX,
                  y: this.stick ? this.stick.y - ((this.stick.y - e.clientY) * 0.15) : e.clientY,
                  oldX,
                  oldY
              }
          }
      }
  
      this.update();
    }

    this.pointerActive = function() {
      this.setState('-active');
    }

    this.pointerDeactive = function() {
      this.removeState('-active');
    }

    this.setPointerState = function() {
      this.setState('-pointer')
    }

    this.removePointerState = function() {
      this.removeState('-pointer')
    }

    this.addCustomState = function(e) {
      this.setState(e.target.dataset.cursor)
    }
    
    this.removeCustomState = function(e) {
      this.removeState(e.target.dataset.cursor)
    }

    this.setCursorText = function(e) {
      this.setText(e.target.dataset.cursorText)
    }

    this.removeCursorText = function(e) {
      this.removeText(e.target.dataset.cursorText)
    }

    this.enableStick = function(e) {
      e.target.dataset.cursorStick ?
        this.setStick(e.target,e.target.dataset.cursorStick)
      :
        this.setStick(e.target)
    }

    this.disableStick = function(e) {
        this.removeStick(e.target,e.target.dataset.cursorStick)
    }

    resetMousemoveOnResize = function() {
      this.body.removeEventListener('mousemove', this.updateOnMouseMove)
      this.body.addEventListener('mousemove', this.updateOnMouseMove)
    }
  }

  removeAllEventListeners() {
    this.body.removeEventListener('mouseleave', this.hideCursorBall)
    .removeEventListener('mouseenter', this.showCursorBall)
    .removeEventListener('mouseover', this.showCursorBall)
    .removeEventListener('mousemove', this.updateOnMouseMove)
    .removeEventListener('mousedown', this.pointerActive)
    .removeEventListener('mouseup', this.pointerDeactive)
    .removeEventListener('dragend', this.pointerDeactive)

    // Get all the elements we need for different cursor modes
    const {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements
    } = this.getAllPointerElements()

    pointerStateElements.forEach( el => {
      el.removeEventListener('mouseenter', this.setPointerState)
      el.removeEventListener('mouseleave', this.removePointerState)
    })

    iframes.forEach( el => {
      el.removeEventListener('mouseenter',this.showCursorBall)
      el.removeEventListener('mouseleave',this.hideCursorBall)
    })
    
    // Get elements with data-cursor and apply the classes or state to cursor ball
    dataCursorElements.forEach( el => {
      el.removeEventListener('mouseenter',this.addCustomState)
      el.removeEventListener('mouseleave',this.removeCustomState)
    })

    cursorTextElements.forEach( el => {
      el.removeEventListener('mouseenter',this.setCursorText)
      el.removeEventListener('mouseleave',this.removeCursorText)
    })

    cursorStickElements.forEach( el => {
      el.removeEventListener('mouseenter',this.enableStick)
      el.removeEventListener('mouseleave',this.disableStick)
    })

    // window.removeEventListener('resize', this.resetMousemoveOnResize )

}

  move(x, y, duration) {

    gsap.to(this.el, {
      x: x || this.pos.x,
      y: y || this.pos.y,
      force3D: true,
      overwrite: true,
      ease: this.options.ease,
      duration: this.visible ? (duration || this.options.speed) : 0
    });
  }

  getAllPointerElements() {
    const pointerStateElements = [
      ...Array.from(document.querySelectorAll('a')),
      ...Array.from(document.querySelectorAll('input')),
      ...Array.from(document.querySelectorAll('textarea')),
      ...Array.from(document.querySelectorAll('button'))
    ]
    const iframes = Array.from( document.querySelectorAll('iframe') )
    const dataCursorElements = Array.from( document.querySelectorAll('[data-cursor]') )
    const cursorTextElements = Array.from( document.querySelectorAll('[data-cursor-text]') )
    const cursorStickElements = Array.from( document.querySelectorAll('[data-cursor-stick]') )


    return {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements
    }
  }
}