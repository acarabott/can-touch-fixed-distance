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

    this.min = 0.0;
    this.mul = 1.0;
    this._value = 0.5;

    this.origin = undefined; // the points we will use for touches
    this.extent = undefined; // the points we will use for touches

    this.canvas.addEventListener('touchstart', e => this.updateTouches(e));
    this.canvas.addEventListener('touchend', e => this.updateTouches(e));
    this.canvas.addEventListener('touchmove', e => this.updateTouches(e));

    this.render();
  }

  updateTouches(event) {
    event.preventDefault();
    ['origin', 'extent'].forEach((label, i) => {
      this[label] = event.touches.length > i
        ? this.getNormTouch(event.touches[i])
        : undefined;
    });
    this.update();
  }

  getNormTouch(touch) {
    const bb = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - bb.left) / this.canvas.width;
    const y = (touch.clientY - bb.top) / this.canvas.height;
    return new Point(x, y);
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
    if (this.output !== undefined) { this.output.value = value.toFixed(1); }
    this.render();
  }

  appendTo(domElement) {
    domElement.appendChild(this.canvas);
  }

  set outputElement(domElement) {
    this.output = domElement;
  }

  get dims() { return [this.canvas.width, this.canvas.height]; }

  renderTouch(point, style) {
    const radius = 120;
    this.ctx.fillStyle = style;
    this.ctx.beginPath();
    this.ctx.arc(...point.mul(...this.dims), radius, 0, Math.PI * 2, false);
    this.ctx.fill();
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const touchRadius = 100;
    if (this.origin !== undefined) {
      this.renderTouch(this.origin, 'rgba(43, 156, 212, 1.0)');
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
