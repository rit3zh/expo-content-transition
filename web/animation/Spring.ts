import type { SpringValue } from './SpringValue';

class Spring {
  private readonly omega: number;
  private readonly zeta: number;

  constructor(response: number, dampingRatio: number) {
    this.omega = (2 * Math.PI) / Math.max(response, 1e-4);
    this.zeta = Math.min(Math.max(dampingRatio, 1e-4), 10);
  }

  advance(value: SpringValue, deltaTime: number): void {
    const { omega, zeta } = this;
    const x0 = value.value - value.target;
    const v0 = value.velocity;

    let x: number;
    let v: number;

    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * omega * deltaTime);
      const c1 = x0;
      const c2 = (v0 + zeta * omega * x0) / wd;
      const cosine = Math.cos(wd * deltaTime);
      const sine = Math.sin(wd * deltaTime);
      x = decay * (c1 * cosine + c2 * sine);
      v = decay * ((c2 * wd - zeta * omega * c1) * cosine - (c1 * wd + zeta * omega * c2) * sine);
    } else if (zeta === 1) {
      const decay = Math.exp(-omega * deltaTime);
      const c1 = x0;
      const c2 = v0 + omega * x0;
      x = (c1 + c2 * deltaTime) * decay;
      v = (c2 - omega * (c1 + c2 * deltaTime)) * decay;
    } else {
      const s = Math.sqrt(zeta * zeta - 1);
      const r1 = -omega * (zeta - s);
      const r2 = -omega * (zeta + s);
      const c2 = (v0 - r1 * x0) / (r2 - r1);
      const c1 = x0 - c2;
      const e1 = Math.exp(r1 * deltaTime);
      const e2 = Math.exp(r2 * deltaTime);
      x = c1 * e1 + c2 * e2;
      v = c1 * r1 * e1 + c2 * r2 * e2;
    }

    value.write(value.target + x, v);
  }
}

export { Spring };
