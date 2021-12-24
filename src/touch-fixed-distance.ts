import { Point } from "./Point.js";

class TouchDistance {
  constructor(parentEl, normX, normY) {
    this.parentEl = parentEl;
    this.origin = new Point(normX, normY);
    this.extent = new Point(normX, normY); // the point we will use for input
    this._rgb = [43, 156, 212];
    this._radius = 100;
    this.grabbed = false;
    this.tutorialDone = false;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.parentEl.appendChild(this.canvas);
    this.resize();

    this._min = 0.0;
    this._max = 1.0;
    this.inputId = undefined;

    this.tutorialEl = undefined;
    const startAction = () => {
      this.update();

      if (!this.tutorialDone && this.extent.x !== normX && this.extent.y !== normY) {
        this.tutorialEl = document.createElement("div");
        this.tutorialEl.style.position = "absolute";
        const startPoint = this.originCanvasPoint.round();
        const endPoint = this.getRelativePoint(this.extent).round().add(20, -10);
        this.tutorialEl.style.width = "300px";
        this.tutorialEl.style.left = `${startPoint.x}px`;
        this.tutorialEl.style.top = `${startPoint.y}px`;
        this.tutorialEl.textContent = "Move to the handle to grab it";
        this.parentEl.appendChild(this.tutorialEl);

        this.tutorialEl.style.transition = `left ${endPoint.x}px 1s ease-in-out 0.3s`;

        this.tutorialEl.animate([{ left: `${endPoint.x}px`, top: `${endPoint.y}px` }], {
          delay: 100,
          duration: 1000,
          easing: "ease-out",
          fill: "forwards",
        });
      }
    };

    const onMouseDown = (event) => {
      event.preventDefault();
      if (!this.inputInsideOrigin(event)) {
        return;
      }
      this.inputId = 1; // don"t have id for mouse, so just use 1 as dummy
      startAction(event);
    };

    this.parentEl.addEventListener(
      "touchstart",
      (event) => {
        this.parentEl.removeEventListener("mousedown", onMouseDown);
        if (this.active) {
          return;
        }

        const touch = Array.from(event.changedTouches).find((t) => this.inputInsideOrigin(t));
        if (touch === undefined) {
          return;
        }
        this.inputId = touch.identifier;
        startAction(touch);
      },
      { passive: false },
    );

    this.parentEl.addEventListener("mousedown", onMouseDown, { passive: false });

    const endAction = () => {
      this.inputId = undefined;
      this.grabbed = false;
      this.update();
      if (this.tutorialEl !== undefined) {
        this.tutorialEl.remove();
        this.tutorialEl = undefined;
      }
    };

    const mouseEndAction = (event) => endAction(event);

    window.addEventListener(
      "touchend",
      (event) => {
        window.removeEventListener("mouseup", mouseEndAction);
        const touch = this.getMatchingTouch(event.changedTouches);
        if (touch === undefined) {
          return;
        }
        endAction(touch);
      },
      { passive: false },
    );

    window.addEventListener("mouseup", mouseEndAction, { passive: false });

    const moveAction = (input) => {
      if (!this.active) {
        return;
      }
      if (this.grabbed) {
        const relativeInput = this.getRelativeInput(input);
        const dist = this.originCanvasPoint.distance(relativeInput) / this.canvasMax;
        if (dist <= 1.0) {
          this.extent = this.getNormInput(input);
        } else {
          const inputTranslated = relativeInput.subtract(this.originCanvasPoint);
          const inputConstrained = inputTranslated.mul(1.0 / dist);
          const inputRetranslated = inputConstrained.add(this.originCanvasPoint);
          this.extent = inputRetranslated.divide(...this.dims);
        }
        this.extent = this.extent.max(Point.zero).min(new Point(1, 1));
      } else {
        const insideExtent = this.inputInsidePoint(input, this.extentCanvasPoint, this.radius);
        const originExtentDistance = this.originCanvasPoint.distance(this.extentCanvasPoint);
        const originInputDistance = this.getRelativeInput(input).distance(this.originCanvasPoint);
        const beyondCenter = originInputDistance >= originExtentDistance;
        if (insideExtent && beyondCenter) {
          this.grabbed = true;
          if (this.tutorialEl !== undefined) {
            this.tutorialEl.remove();
            this.tutorialEl = undefined;
            this.tutorialDone = true;
          }
        }
      }
      this.update();
    };

    window.addEventListener(
      "touchmove",
      (event) => {
        const touch = this.getMatchingTouch(event.changedTouches);
        if (touch === undefined) {
          return;
        }
        moveAction(touch);
      },
      { passive: false },
    );

    window.addEventListener("mousemove", (event) => moveAction(event), { passive: false });

    this.render();
  }

  get canvasWidth() {
    return this.canvas.width / devicePixelRatio;
  }
  set canvasWidth(canvasWidth) {
    this.canvas.width = Math.round(canvasWidth * devicePixelRatio);
  }

  get canvasHeight() {
    return this.canvas.height / devicePixelRatio;
  }
  set canvasHeight(canvasHeight) {
    this.canvas.height = Math.round(canvasHeight * devicePixelRatio);
  }

  resize() {
    this.canvasWidth = this.parentEl.clientWidth;
    this.canvasHeight = this.parentEl.clientHeight;

    this.canvas.style.width = `${this.parentEl.clientWidth}px`;
    this.canvas.style.height = `${this.parentEl.clientHeight}px`;

    this.canvas.style.transformOrigin = "top left";
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.update();
  }

  inputInsidePoint(input, point, radius) {
    return this.getRelativeInput(input).distance(point) <= radius;
  }

  inputInsideOrigin(input) {
    return this.inputInsidePoint(input, this.originCanvasPoint, this.radius);
  }

  getMatchingTouch(touches) {
    return Array.from(touches).find((t) => t.identifier === this.inputId);
  }

  get radius() {
    return this._radius;
  }
  set radius(radius) {
    this._radius = radius;
    this.update();
  }

  get rgb() {
    return this._rgb;
  }
  set rgb(rgb) {
    this._rgb = rgb;
    this.update();
  }

  get active() {
    return this.inputId !== undefined;
  }

  get min() {
    return this._min;
  }
  set min(min) {
    this._min = min;
    this.update();
  }

  get max() {
    return this._max;
  }
  set max(max) {
    this._max = max;
    this.update();
  }

  getRelativePoint(normPoint) {
    return normPoint.mul(...this.dims);
  }

  get originCanvasPoint() {
    return this.getRelativePoint(this.origin);
  }
  get extentCanvasPoint() {
    return this.extent === undefined ? undefined : this.getRelativePoint(this.extent);
  }

  getRelativeInput(input) {
    const bb = this.canvas.getBoundingClientRect();
    return new Point(input.clientX - bb.left, input.clientY - bb.top);
  }

  getNormInput(input) {
    return this.getRelativeInput(input).divide(...this.dims);
  }

  update() {
    this.updateOutput();
    this.render();
  }

  get canvasMax() {
    return Math.min(...this.dims) / 2;
  }

  get valueNorm() {
    return Math.min(1.0, this.originCanvasPoint.distance(this.extentCanvasPoint) / this.canvasMax);
  }

  get value() {
    const scaled = this.valueNorm * (this.max - this.min);
    return Math.min(this.min + scaled, this.max);
  }

  get valueRender() {
    const range = this.max - this.min;
    const precision = Math.pow(10, -Math.ceil(Math.log10(range))) + 1;
    return this.value.toFixed(precision);
  }

  updateOutput() {
    if (this.output !== undefined) {
      this.output.value = this.valueRender;
    }
  }

  appendTo(domElement) {
    domElement.appendChild(this.canvas);
  }

  set outputElement(domElement) {
    this.output = domElement;
  }

  get dims() {
    return [this.canvasWidth, this.canvasHeight];
  }

  // @action: "stroke" or "fill"
  renderArc(normPoint, radius, style, action) {
    this.ctx.save();
    this.ctx[{ stroke: "strokeStyle", fill: "fillStyle" }[action]] = style;
    this.ctx.beginPath();
    this.ctx.arc(...this.getRelativePoint(normPoint), radius, 0, Math.PI * 2, false);
    this.ctx[{ stroke: "stroke", fill: "fill" }[action]]();
    this.ctx.restore();
  }

  getRgbaString(alpha) {
    return `rgba(${this.rgb.join(",")}, ${alpha})`;
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, ...this.dims);

    // origin
    const style = this.getRgbaString(this.active ? 0.8 : 0.5);
    this.ctx.lineWidth = 4;
    this.renderArc(this.origin, this.radius, style, "stroke");
    this.renderArc(this.origin, this.radius * this.valueNorm, style, "fill");

    // text
    this.ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    const fontSize = this.radius * 0.5;
    this.ctx.font = `${fontSize}px Menlo`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      this.valueRender,
      ...this.originCanvasPoint.add(0, fontSize / 4),
      this.radius * 2,
    );

    // extent
    if (this.active) {
      // max
      const lineWidth = 2;
      this.ctx.lineWidth = lineWidth;
      this.renderArc(this.origin, this.canvasMax - lineWidth * 2, style, "stroke");

      // input
      const inputStyle = this.grabbed ? style : "rgba(150, 150, 150, 0.5)";
      this.renderArc(this.extent, this.radius * 0.8, inputStyle, "fill");

      // line
      this.ctx.strokeStyle = style;
      this.ctx.beginPath();
      this.ctx.moveTo(...this.originCanvasPoint);
      this.ctx.lineTo(...this.extentCanvasPoint);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}

const container = document.createElement("div");
container.id = "container";
container.classList.add("touchFixedDistanceContainer");

// prevent mobile scrolling
container.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });

const dist = new TouchDistance(container, 0.5, 0.5);
dist.min = 0;
dist.max = 100;

const dist2 = new TouchDistance(container, 0.1, 0.9);
dist2.radius = 50;
dist2.rgb = [43, 212, 156];

const dist3 = new TouchDistance(container, 0.9, 0.5);
dist3.radius = 50;
dist3.rgb = [43, 212, 156];
dist3.min = 10;
dist3.max = 30;

const normRadii = [0.15, 0.075, 0.075];

function resize() {
  [dist, dist2, dist3].forEach((touchDistance, i) => {
    const minDimension = Math.min(
      touchDistance.parentEl.clientWidth,
      touchDistance.parentEl.clientHeight,
    );
    touchDistance.radius = minDimension * normRadii[i];
    touchDistance.resize();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(container);
  window.addEventListener("resize", resize);
  resize();
});
