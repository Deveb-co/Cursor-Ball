import '../assets/cursor.scss'
import gsap from 'gsap'

export default class Cursor {
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

    this.hideOnMouseOut = function() {
      this.hide();
    }

    this.showOnMouseIn = function () {
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

    this.pointerActive = function pointerActive() {
      this.setState('-active');
    }
    this.pointerDeactive = function pointerDeactive() {
      this.removeState('-active');
    }

    // Hide cursor ball on mouse leaving the container
    this.body.addEventListener('mouseleave', this.hideOnMouseOut)

    // Show cursor ball on mouse leaving the container
    this.body.addEventListener('mouseenter', this.showOnMouseIn)

    // update cursor ball position on mouse move
    this.body.addEventListener('mousemove', this.updateOnMouseMove)

    // Reduce cursor ball size to indicate mouse left click down
    this.body.addEventListener('mousedown', this.pointerActive)

    // Change the cursor ball size back to normal after mouse left click up
    this.body.addEventListener('mouseup', this.pointerDeactive)

    // Change the cursor ball size back to normal after drag end
    this.body.addEventListener('dragend', this.pointerDeactive)

  }

  move(x, y, duration) {

    // gsap.to(this.el, {
    //   x: x || this.pos.x,
    //   y: y || this.pos.y,
    //   force3D: true,
    //   overwrite: true,
    //   ease: this.options.ease,
    //   duration: this.visible ? (duration || this.options.speed) : 0
    // });
  }

}