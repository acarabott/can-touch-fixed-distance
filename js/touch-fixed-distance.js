// prevent mobile scrolling
document.ontouchmove = function(event){ event.preventDefault(); };

class TouchDistance {
  constructor(normX, normY) {
    this.canvas = document.createElement('canvas');
    {
      const resize = event => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      };
      document.body.addEventListener('resize', resize);
      resize();
    }

    this.ctx = this.canvas.getContext('2d');

    this._min = 0.0;
    this._max = 1.0;

    this.origin = new Point(normX, normY);
    this.extent = new Point(0.5, 0.5); // the point we will use for touches

    this.active = false;
    this.touchRadius = 100;

    document.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      const pos = this.getRelativeTouch(touch);
      this.active = pos.distance(this.originCanvas) <= this.touchRadius;
      this.extent = this.active ? this.getNormTouch(touch) : this.extent;
      this.update();
    });

    document.addEventListener('touchend', event => {
      this.active = false;
      this.update();
    });

    document.addEventListener('touchmove', event => {
      this.extent = this.active ? this.getNormTouch(event.touches[0]) : this.extent;
      this.update();
    });

    this.render();
  }

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

  getRelativeTouch(touch) {
    const bb = this.canvas.getBoundingClientRect();
    const x = touch.clientX - bb.left;
    const y = touch.clientY - bb.top;
    return new Point(x, y);
  }

  getNormTouch(touch) {
    return this.getRelativeTouch(touch).divide(...this.dims);
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
  renderArc(normPoint, radius, style, action) {
    this.ctx.save();
    this.ctx[{stroke: 'strokeStyle', fill: 'fillStyle'}[action]] = style;
    this.ctx.beginPath();
    this.ctx.arc(...this.getRelativePoint(normPoint), radius, 0, Math.PI * 2, false);
    this.ctx[{stroke: 'stroke', fill: 'fill'}[action]]();
    this.ctx.restore();
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, ...this.dims);

    // origin
    {
      const style = `rgba(43, 156, 212, ${this.active ? 0.8 : 0.5})`;
      this.ctx.lineWidth = 4;
      this.renderArc(this.origin, this.touchRadius, style, 'stroke');

      const feedbackRadius = this.touchRadius * this.valueNorm;
      this.renderArc(this.origin, feedbackRadius, style, 'fill');

      this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      const fontSize = this.touchRadius * 0.5;
      this.ctx.font = `${fontSize}px Menlo`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.valueRender, ...this.originCanvas.add(0, fontSize / 4), this.touchRadius * 2);
    }

    // max
    if (this.active) {
      const style = `rgba(43, 156, 212, ${this.active ? 0.8 : 0.5})`;
      this.ctx.lineWidth = 2;
      this.renderArc(this.origin, this.canvasMax, style, 'stroke');
    }

    if (this.active) {
      // touch
      const touchStyle = 'rgba(249, 182, 118, 1.0)';
      this.renderArc(this.extent, this.touchRadius, touchStyle, 'fill');

      // line

      this.ctx.strokeStyle = 'rgba(150, 150, 150, 1.0)';
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
dist2.appendTo(box);
