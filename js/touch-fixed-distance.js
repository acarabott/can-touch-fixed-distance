// prevent mobile scrolling
document.ontouchmove = function(event){ event.preventDefault(); };

class TouchDistance {
  constructor(normX, normY) {
    this.origin = new Point(normX, normY);
    this.extent = new Point(0.5, 0.5); // the point we will use for input
    this._rgb = [43, 156, 212];
    this._radius = 100;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    {
      const resize = event => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.update();
      };
      window.addEventListener('resize', resize);
      resize();
    }


    this._min = 0.0;
    this._max = 1.0;
    this.inputId = undefined;

    const startAction = input => {
      this.extent = this.getNormInput(input);
      this.update();
    };

    window.addEventListener('touchstart', event => {
      if (this.active) { return; }

      const touch = Array.from(event.changedTouches).find(t => {
        return this.getRelativeInput(t).distance(this.originCanvas) <= this.radius;
      });
      if (touch === undefined) { return; }
      this.inputId = touch.identifier;
      startAction(touch);
    });

    window.addEventListener('mousedown', event => {
      if (this.getRelativeInput(event).distance(this.originCanvas) >= this.radius) { return; }
      this.inputId = 1; // don't have id for mouse, so just use 1 as dummy
      startAction(event);
    });

    const endAction = input => {
      this.inputId = undefined;
      this.update();
    };

    window.addEventListener('touchend', event => {
      const touch = this.getMatchingTouch(event.changedTouches);
      if (touch === undefined) { return; }
      endAction(touch);
    });

    window.addEventListener('mouseup', event => endAction(event));

    const moveAction = input => {
      if (!this.active) { return; }
      this.extent = this.getNormInput(input);
      this.update();
    };

    window.addEventListener('touchmove', event => {
      const touch = this.getMatchingTouch(event.changedTouches);
      if (touch === undefined) { return; }
      moveAction(touch);
    });

    window.addEventListener('mousemove', event => moveAction(event));

    this.render();
  }

  getMatchingTouch(touches) {
    return Array.from(touches).find(t => t.identifier === this.inputId);
  }

  get radius() { return this._radius; }
  set radius(radius) {
    this._radius = radius;
    this.update();
  }

  get rgb() { return this._rgb; }
  set rgb(rgb) {
    this._rgb = rgb;
    this.update();
  }

  get active() { return this.inputId !== undefined; }

  get min() { return this._min; }
  set min(min) {
    this._min = min;
    this.update();
  }

  get max() { return this._max; }
  set max(max) {
    this._max = max;
    this.update();
  }

  getRelativePoint(normPoint) { return normPoint.mul(...this.dims); }

  get originCanvas() { return this.getRelativePoint(this.origin); }
  get extentCanvas() { return this.extent === undefined ? undefined : this.getRelativePoint(this.extent); }

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
    return Math.max(...this.dims) / 2;
  }

  get valueNorm() {
    return Math.min(1.0, this.originCanvas.distance(this.extentCanvas) / this.canvasMax);
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
    if (this.output !== undefined) { this.output.value = this.valueRender; }
  }

  appendTo(domElement) {
    domElement.appendChild(this.canvas);
  }

  set outputElement(domElement) {
    this.output = domElement;
  }

  get dims() { return [this.canvas.width, this.canvas.height]; }

  // @action: 'stroke' or 'fill'
  renderArc(relativePoint, radius, style, action) {
    this.ctx.save();
    this.ctx[{stroke: 'strokeStyle', fill: 'fillStyle'}[action]] = style;
    this.ctx.beginPath();
    this.ctx.arc(...relativePoint, radius, 0, Math.PI * 2, false);
    this.ctx[{stroke: 'stroke', fill: 'fill'}[action]]();
    this.ctx.restore();
  }

  getRgbaString(alpha) {
    return `rgba(${this.rgb.join(',')}, ${alpha})`;
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, ...this.dims);
    const style = this.getRgbaString(this.active ? 0.8 : 0.5);

    (this.active ? [this.origin, this.extent] : [this.origin]).forEach((point, i, arr) => {
      const relativePoint = this.getRelativePoint(point);

      // origin
      this.ctx.lineWidth = 4;
      this.renderArc(relativePoint, this.radius, style, 'stroke');
      this.renderArc(relativePoint, this.radius * this.valueNorm, style, 'fill');

      // text
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      const fontSize = this.radius * 0.5;
      this.ctx.font = `${fontSize}px Menlo`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.valueRender, ...relativePoint.add(0, fontSize / 4), this.radius * 2);
    });

    if (this.active) {
      // line
      this.ctx.strokeStyle = style;
      this.ctx.beginPath();
      this.ctx.moveTo(...this.originCanvas);
      this.ctx.lineTo(...this.extentCanvas);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}

function createOutput(input, parent = document.body) {
  const output = document.createElement('input');
  output.value = input.value;
  output.classList.add('output');
  parent.appendChild(output);
  input.outputElement = output;
}

const box = document.getElementById('container');

const dist = new TouchDistance(0.3, 0.5);
dist.min = 50;
dist.max = 100;
dist.appendTo(box);

const dist2 = new TouchDistance(0.6, 0.5);
dist2.radius = 80;
dist2.rgb = [43, 212, 156];
dist2.appendTo(box);
