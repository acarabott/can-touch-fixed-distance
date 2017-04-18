// prevent mobile scrolling
document.ontouchmove = function(event){ event.preventDefault(); };

class TouchDistance {
  constructor() {
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
    this._mul = 1.0;
    this._value = 0.5;

    this.origin = new Point(0.5, 0.5);
    this.extent = undefined; // the points we will use for touches

    this.active = false;
    this.touchRadius = 100;

    this.canvas.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      const pos = this.getRelativeTouch(touch);
      const originCanvas = this.origin.mul(...this.dims);
      const distance = pos.distance(originCanvas);
      this.active = pos.distance(originCanvas) <= this.touchRadius;

      this.extent = this.active ? this.getNormTouch(touch) : undefined;
      this.update();
    });

    this.canvas.addEventListener('touchend', event => {
      this.active = false;
      this.extent = undefined;
      this.update();
    });

    this.canvas.addEventListener('touchmove', event => {
      this.extent = this.active ? this.getNormTouch(event.touches[0]) : undefined;
      this.update();
    });

    this.render();
  }

  get min() { return this._min; }
  set min(min) {
    this._min = min;
    this.value = Math.max(min, this.value);
    this.updateOutput();
  }
  get mul() { return this._mul; }
  set mul(mul) {
    this._mul = mul;
    this.value = Math.min(this.value * mul, this.value);
    this.updateOutput();
  }

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
    const haveTwo = [this.origin, this.extent].every(p => p !== undefined);
    this.value = haveTwo
      ? this.min + this.origin.distance(this.extent) * this.mul
      : this.value;
  }

  get value() { return this._value; }

  set value(value) {
    this._value = value;
    this.updateOutput();
    this.render();
  }

  updateOutput() {
    if (this.output !== undefined) { this.output.value = this.value.toFixed(1); }
  }

  appendTo(domElement) {
    domElement.appendChild(this.canvas);
  }

  set outputElement(domElement) {
    this.output = domElement;
  }

  get dims() { return [this.canvas.width, this.canvas.height]; }

  renderTouch(point, style) {
    this.ctx.fillStyle = style;
    this.ctx.beginPath();
    this.ctx.arc(...point.mul(...this.dims), this.touchRadius, 0, Math.PI * 2, false);
    this.ctx.fill();
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, ...this.dims);

    if (this.origin !== undefined) {
      const opacity = this.active ? 0.8 : 0.5;
      this.renderTouch(this.origin, `rgba(43, 156, 212, ${opacity})`);
    }

    if (this.extent !== undefined) {
      this.renderTouch(this.extent, 'rgba(249, 182, 118, 1.0)');
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

const dist = new TouchDistance();

dist.min = 50;
dist.mul = 100;

createOutput(dist, box);
dist.appendTo(box);
