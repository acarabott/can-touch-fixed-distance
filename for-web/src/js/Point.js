export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  gte(point) { return this.x >= point.x && this.y >= point.y; }
  lte(point) { return this.x <= point.x && this.y <= point.y; }

  toString() { return `${this.x.toFixed(0)}, ${this.y.toFixed(0)}`; }

  subtract(pointOrX, y) {
    const args = pointOrX instanceof Point
      ? [this.x - pointOrX.x, this.y - pointOrX.y]
      : [this.x - pointOrX, this.y - y];
    return new Point(...args);
  }

  add(pointOrX, y) {
    const args = pointOrX instanceof Point
      ? [this.x + pointOrX.x, this.y + pointOrX.y]
      : [this.x + pointOrX, this.y + y];
    return new Point(...args);
  }

  mul(x, y = x) { return new Point(this.x * x, this.y * y); }

  divide(x, y = x) { return new Point(this.x / x, this.y / y); }

  distance(point) {
    const x = this.x - point.x;
    const y = this.y - point.y;
    return Math.sqrt((x * x) + (y * y));
  }

  asArray() { return [this.x, this.y]; }
}
