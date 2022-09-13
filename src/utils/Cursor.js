import "../assets/cursor.scss";
import gsap from "gsap";

export default class DvbCursor {
  constructor(options) {
    this.options = {
      container: "body",
      speed: 0.2,
      ...options,
    };

    this.body = document.querySelector(this.options.container);
    document.createElement("div");

    // Cursor main div
    const cursorEl = document.createElement("div");
    cursorEl.classList.add("vim-cursor");
    this.el = cursorEl;

    // Cursor ball
    const cursorBallEl = document.createElement("div");
    cursorBallEl.classList.add("cursor-ball");
    this.ball = cursorBallEl;

    const cursorText = document.createElement("div");
    cursorText.classList.add("vim-cursor-text");
    this.text = cursorText;
    this.isHidden = false;

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
    this.bindEventListeners();

    // Hide cursor ball on mouse leaving the container
    this.body.addEventListener("mouseleave", this.hideCursorBall);

    // Show cursor ball on mouse leaving the container
    this.body.addEventListener("mouseenter", this.showCursorBall);

    // update cursor ball position on mouse move
    this.body.addEventListener("mousemove", this.updateOnMouseMove);

    // Reduce cursor ball size to indicate mouse left click down
    this.body.addEventListener("mousedown", this.pointerActive);

    // Change the cursor ball size back to normal after mouse left click up
    this.body.addEventListener("mouseup", this.pointerDeactive);

    // Change the cursor ball size back to normal after drag end
    this.body.addEventListener("dragend", this.pointerDeactive);

    // Get all the elements we need for different cursor modes
    const {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements,
    } = this.getAllPointerElements();

    // Set cursor to pointer when hovers on links, inputs, textarea and buttons
    pointerStateElements.forEach((el) => {
      el.addEventListener("mouseover", this.setPointerState);
      el.addEventListener("mouseleave", this.removePointerState);
    });

    // Hide cursor ball when an Iframe is hovered
    iframes.forEach((el) => {
      el.addEventListener("mouseenter", this.showCursorBall);
      el.addEventListener("mouseleave", this.hideCursorBall);
    });

    // Get elements with data-cursor and apply the classes or state to cursor ball
    dataCursorElements.forEach((el) => {
      el.addEventListener("mouseenter", this.addCustomState);
      el.addEventListener("mouseleave", this.removeCustomState);
    });

    // Add cursor text to elements with cursor-text
    cursorTextElements.forEach((el) => {
      el.addEventListener("mouseenter", this.setCursorText);
      el.addEventListener("mouseleave", this.removeCursorText);
    });

    // Add cursor stick for elements with cursor-stick
    cursorStickElements.forEach((el) => {
      el.addEventListener("mouseenter", this.enableStick);
      el.addEventListener("mouseleave", this.disableStick);
    });

    // Reset cursor ball mousemove on window resize
    // window.addEventListener('resize', this.resetMousemoveOnResize )
  }

  bindEventListeners() {
    this.hideCursorBall = function () {
      this.hide();
    };

    this.showCursorBall = function () {
      this.show();
    };

    this.updateOnMouseMove = function (e) {
      const x = this.stick
        ? this.stick.x - (this.stick.x - e.clientX) * 0.15
        : e.clientX;
      const y = this.stick
        ? this.stick.y - (this.stick.y - e.clientY) * 0.15
        : e.clientY;

      if (!this.pos || !this.pos.x === undefined) {
        this.pos = {
          x,
          y,
        };
      } else {
        if (this.lastTimeUpdate) {
          const now = Date.now();

          if (now - this.lastTimeUpdate >= 20) {
            const oldX = this.pos.x;
            const oldY = this.pos.y;

            this.pos.x = x;
            this.pos.y = y;

            this.updatePhysics();
            this.lastTimeUpdate = Date.now();

            this.pos.oldX = oldX;
            this.pos.oldY = oldY;
          } else {
            this.pos.x = x;
            this.pos.y = y;
          }
        } else {
          const oldX = this.pos.x;
          const oldY = this.pos.y;

          this.lastTimeUpdate = Date.now();

          this.pos = {
            x: this.stick
              ? this.stick.x - (this.stick.x - e.clientX) * 0.15
              : e.clientX,
            y: this.stick
              ? this.stick.y - (this.stick.y - e.clientY) * 0.15
              : e.clientY,
            oldX,
            oldY,
          };
        }
      }

      this.update();
    };

    this.pointerActive = function () {
      this.setState("-active");
    };

    this.pointerDeactive = function () {
      this.removeState("-active");
    };

    this.setPointerState = function () {
      this.setState("-pointer");
    };

    this.removePointerState = function () {
      this.removeState("-pointer");
    };

    this.addCustomState = function (e) {
      this.setState(e.target.dataset.cursor);
    };

    this.removeCustomState = function (e) {
      this.removeState(e.target.dataset.cursor);
    };

    this.setCursorText = function (e) {
      this.setText(e.target.dataset.cursorText);
    };

    this.removeCursorText = function (e) {
      this.removeText(e.target.dataset.cursorText);
    };

    this.enableStick = function (e) {
      e.target.dataset.cursorStick
        ? this.setStick(e.target, e.target.dataset.cursorStick)
        : this.setStick(e.target);
    };

    this.disableStick = function (e) {
      this.removeStick(e.target, e.target.dataset.cursorStick);
    };

    resetMousemoveOnResize = function () {
      this.body.removeEventListener("mousemove", this.updateOnMouseMove);
      this.body.addEventListener("mousemove", this.updateOnMouseMove);
    };
  }

  removeAllEventListeners() {
    this.body
      .removeEventListener("mouseleave", this.hideCursorBall)
      .removeEventListener("mouseenter", this.showCursorBall)
      .removeEventListener("mouseover", this.showCursorBall)
      .removeEventListener("mousemove", this.updateOnMouseMove)
      .removeEventListener("mousedown", this.pointerActive)
      .removeEventListener("mouseup", this.pointerDeactive)
      .removeEventListener("dragend", this.pointerDeactive);

    // Get all the elements we need for different cursor modes
    const {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements,
    } = this.getAllPointerElements();

    pointerStateElements.forEach((el) => {
      el.removeEventListener("mouseenter", this.setPointerState);
      el.removeEventListener("mouseleave", this.removePointerState);
    });

    iframes.forEach((el) => {
      el.removeEventListener("mouseenter", this.showCursorBall);
      el.removeEventListener("mouseleave", this.hideCursorBall);
    });

    // Get elements with data-cursor and apply the classes or state to cursor ball
    dataCursorElements.forEach((el) => {
      el.removeEventListener("mouseenter", this.addCustomState);
      el.removeEventListener("mouseleave", this.removeCustomState);
    });

    cursorTextElements.forEach((el) => {
      el.removeEventListener("mouseenter", this.setCursorText);
      el.removeEventListener("mouseleave", this.removeCursorText);
    });

    cursorStickElements.forEach((el) => {
      el.removeEventListener("mouseenter", this.enableStick);
      el.removeEventListener("mouseleave", this.disableStick);
    });

    // window.removeEventListener('resize', this.resetMousemoveOnResize )
  }

  addNewlyRenderedSection(newSection, q) {
    // Get all the elements we need for different cursor modes
    const {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements,
    } = this.getAllPointerElements(newSection);

    // Set cursor to pointer when hovers on links, inputs, textarea and buttons
    pointerStateElements.forEach((el) => {
      el.addEventListener("mouseover", this.setPointerState);
      el.addEventListener("mouseleave", this.removePointerState);
    });

    // Hide cursor ball when an Iframe is hovered
    iframes.forEach((el) => {
      el.addEventListener("mouseenter", this.showCursorBall);
      el.addEventListener("mouseleave", this.hideCursorBall);
    });

    // Get elements with data-cursor and apply the classes or state to cursor ball
    dataCursorElements.forEach((el) => {
      el.addEventListener("mouseenter", this.addCustomState);
      el.addEventListener("mouseleave", this.removeCustomState);
    });

    // Add cursor text to elements with cursor-text
    cursorTextElements.forEach((el) => {
      el.addEventListener("mouseenter", this.setCursorText);
      el.addEventListener("mouseleave", this.removeCursorText);
    });

    // Add cursor stick for elements with cursor-stick
    cursorStickElements.forEach((el) => {
      el.addEventListener("mouseenter", this.enableStick);
      el.addEventListener("mouseleave", this.disableStick);
    });
  }

  setState(state) {
    this.el.classList.add(state);
  }

  removeState(state) {
    this.el.classList.remove(state);
  }

  toggleState(state) {
    this.el.classList.toggle(state);
  }

  setText(text) {
    this.text.innerText = text;
    this.el.classList.add("-text");
  }

  removeText() {
    this.el.classList.remove("-text");
  }

  setStick(el, childTarget = null) {
    if (childTarget) {
      const target = el.querySelector(childTarget);
      const targetBound = target.getBoundingClientRect();
      const bound = target.parentElement.getBoundingClientRect();
      this.stick = {
        y: bound.top + targetBound.height / 2 + (targetBound.top - bound.top),
        x: bound.left + targetBound.width / 2 + (targetBound.left - bound.left),
      };
    } else {
      const targetBound = el.getBoundingClientRect();

      this.stick = {
        y: targetBound.top + targetBound.height / 2,
        x: targetBound.left + targetBound.width / 2,
      };
    }

    this.move(this.stick.x, this.stick.y, 5);
  }

  removeStick() {
    this.stick = false;
  }

  update() {
    this.move();
    this.show();
  }

  move(x, y, duration) {
    gsap.to(this.el, {
      x: x || this.pos.x,
      y: y || this.pos.y,
      force3D: true,
      overwrite: true,
      ease: this.options.ease,
      duration: this.visible ? duration || this.options.speed : 0,
    });
  }

  updatePhysics() {
    
  }

  getAllPointerElements(newSection = null) {
    const container = newSection ? newSection : document;

    const pointerStateElements = [
      ...Array.from(container.querySelectorAll("a")),
      ...Array.from(container.querySelectorAll("input")),
      ...Array.from(container.querySelectorAll("textarea")),
      ...Array.from(container.querySelectorAll("button")),
    ];
    const iframes = Array.from(container.querySelectorAll("iframe"));
    const dataCursorElements = Array.from(
      container.querySelectorAll("[data-cursor]")
    );
    const cursorTextElements = Array.from(
      container.querySelectorAll("[data-cursor-text]")
    );
    const cursorStickElements = Array.from(
      container.querySelectorAll("[data-cursor-stick]")
    );

    return {
      pointerStateElements,
      iframes,
      dataCursorElements,
      cursorTextElements,
      cursorStickElements,
    };
  }

  show() {
    if (this.visible || this.isHidden) return;
    clearInterval(this.visibleInt);
    this.el.classList.add("-visible");
    this.visibleInt = setTimeout(() => (this.visible = true));
  }

  hide() {
    clearInterval(this.visibleInt);
    this.el.classList.remove("-visible");
    this.visibleInt = setTimeout(
      () => (this.visible = false),
      this.options.visibleTimeout
    );
  }

  destroy() {
    this.removeAllEventListeners();
    this.isHidden = true;
    this.hide();
  }
}

function calcSpeed(x1,x2,y1,y2) {
  const xDiff = x2 - x1
  const yDiff = y2 - y1

  const diff = Math.pow(xDiff,2) + Math.pow(yDiff,2)

  return diff <= 6 ? 0 : Math.sqrt(diff)

}

function calcAngle(x1,x2,y1,y2) {

  const dx = x2 - x1
  const dy = y2 - y1
  // Angle in deg
  const deg = Math.atan2(dy,dx) * (180 / Math.PI)

  return deg < 0 ? 360 - Math.abs(deg) : deg

}

function calcAngleDiff(ang1,ang2) {

  const reverted = ang1 > 180 ? (360 - ang1) + ang2 : (360 - ang2) + ang1

  const diff1 = Math.abs( ang2 - ang1 )
  const diff2 = reverted

  return diff1 < diff2 ? diff1 : diff2
}