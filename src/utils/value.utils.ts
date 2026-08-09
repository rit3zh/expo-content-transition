import { MILLISECONDS_PER_SECOND } from '../constants';
import type { INumericText } from '../interfaces';

const toDisplayValue = <T extends INumericText['value']>(value: T): string =>
  typeof value === 'number' ? String(value) : value;

const toSeconds = (milliseconds: number | undefined): number | null =>
  milliseconds === undefined ? null : milliseconds / MILLISECONDS_PER_SECOND;

export { toDisplayValue, toSeconds };
