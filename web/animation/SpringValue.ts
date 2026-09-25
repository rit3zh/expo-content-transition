import type { Spring } from './Spring';

class SpringValue {
  spring: Spring;
  private _value: number;
  private _target: number;
  private _velocity = 0;
  private readonly epsilon: number;

  constructor(spring: Spring, initial: number, epsilon: number) {
    this.spring = spring;
    this._value = initial;
    this._target = initial;
    this.epsilon = epsilon;
  }

  get value(): number {
    return this._value;
  }

  get target(): number {
    return this._target;
  }

  get velocity(): number {
    return this._velocity;
  }

  snapTo(newValue: number): void {
    this._value = newValue;
    this._target = newValue;
    this._velocity = 0;
  }

  retarget(newTarget: number): void {
    this._target = newTarget;
  }

  reset(from: number, to: number): void {
    this._value = from;
    this._target = to;
    this._velocity = 0;
  }

  get isSettled(): boolean {
    return (
      Math.abs(this._value - this._target) < this.epsilon &&
      Math.abs(this._velocity) < this.epsilon * 8
    );
  }

  tick(deltaTime: number): boolean {
    if (this.isSettled) {
      this.settle();
      return false;
    }

    this.spring.advance(this, deltaTime);
    if (this.isSettled) {
      this.settle();
      return false;
    }

    return true;
  }

  write(newValue: number, newVelocity: number): void {
    this._value = newValue;
    this._velocity = newVelocity;
  }

  private settle(): void {
    this._value = this._target;
    this._velocity = 0;
  }
}

export { SpringValue };
