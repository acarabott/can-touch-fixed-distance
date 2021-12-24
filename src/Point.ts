export class Point {
  public x: number;
  public y: number;

  static get zero() {
    return new Point(0, 0);
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get vals() {
    return [this.x, this.y] as const;
  }

  gte(point: Point) {
    return this.x >= point.x && this.y >= point.y;
  }

  lte(point: Point) {
    return this.x <= point.x && this.y <= point.y;
  }

  toString() {
    return `${this.x.toFixed(0)}, ${this.y.toFixed(0)}`;
  }

  subtract(pointOrX: Point | number, y?: number) {
    if (pointOrX instanceof Point) {
      return new Point(this.x - pointOrX.x, this.y - pointOrX.y);
    }

    if (y === undefined) {
      throw new TypeError("No y value provided");
    }

    return new Point(this.x - pointOrX, this.y - y);
  }

  add(pointOrX: Point | number, y?: number) {
    if (pointOrX instanceof Point) {
      return new Point(this.x + pointOrX.x, this.y + pointOrX.y);
    }

    if (y === undefined) {
      throw new TypeError("No y value provided");
    }

    return new Point(this.x + pointOrX, this.y + y);
  }

  mul(x: number, y = x) {
    return new Point(this.x * x, this.y * y);
  }

  divide(x: number, y = x) {
    return new Point(this.x / x, this.y / y);
  }

  distance(point: Point) {
    const x = this.x - point.x;
    const y = this.y - point.y;
    return Math.sqrt(x * x + y * y);
  }

  min(point: Point) {
    return new Point(Math.min(this.x, point.x), Math.min(this.y, point.y));
  }

  max(point: Point) {
    return new Point(Math.max(this.x, point.x), Math.max(this.y, point.y));
  }

  round() {
    return new Point(Math.round(this.x), Math.round(this.y));
  }

  asArray() {
    return [this.x, this.y];
  }
}
