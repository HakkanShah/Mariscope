import { FLOATING_POINT_TOLERANCE } from './constants.js';
import { DomainValidationError } from './errors/domain-validation-error.js';

export interface PoolShipBalance {
  shipId: string;
  complianceBalance: number;
}

export interface PoolAdjustmentResult {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

interface MutablePoolShip {
  shipId: string;
  before: number;
  after: number;
}

const validatePoolInput = (ships: PoolShipBalance[]): void => {
  if (ships.length === 0) {
    throw new DomainValidationError('Pool must include at least one ship');
  }

  const seenShipIds = new Set<string>();
  for (const ship of ships) {
    if (ship.shipId.trim().length === 0) {
      throw new DomainValidationError('Ship id must not be empty');
    }

    if (seenShipIds.has(ship.shipId)) {
      throw new DomainValidationError(`Duplicate ship id in pool: ${ship.shipId}`);
    }
    seenShipIds.add(ship.shipId);

    if (!Number.isFinite(ship.complianceBalance)) {
      throw new DomainValidationError(
        `Ship compliance balance must be finite for ship ${ship.shipId}`,
      );
    }
  }
};

const totalComplianceBalance = (ships: PoolShipBalance[]): number => {
  return ships.reduce((total, ship) => total + ship.complianceBalance, 0);
};

export const createPool = (ships: PoolShipBalance[]): PoolAdjustmentResult[] => {
  validatePoolInput(ships);

  const total = totalComplianceBalance(ships);
  if (total < -FLOATING_POINT_TOLERANCE) {
    throw new DomainValidationError('Pool cannot be created when total compliance balance is negative');
  }

  const mutableShips: MutablePoolShip[] = ships.map((ship) => ({
    shipId: ship.shipId,
    before: ship.complianceBalance,
    after: ship.complianceBalance,
  }));

  const deficitShips = mutableShips
    .filter((ship) => ship.after < -FLOATING_POINT_TOLERANCE)
    .sort((left, right) => left.after - right.after);

  const surplusShips = mutableShips
    .filter((ship) => ship.after > FLOATING_POINT_TOLERANCE)
    .sort((left, right) => right.after - left.after);

  for (const deficitShip of deficitShips) {
    let remainingDeficit = Math.abs(deficitShip.after);

    for (const surplusShip of surplusShips) {
      if (remainingDeficit <= FLOATING_POINT_TOLERANCE) {
        break;
      }

      if (surplusShip.after <= FLOATING_POINT_TOLERANCE) {
        continue;
      }

      const transferAmount = Math.min(remainingDeficit, surplusShip.after);
      surplusShip.after -= transferAmount;
      deficitShip.after += transferAmount;
      remainingDeficit -= transferAmount;
    }
  }

  for (const ship of mutableShips) {
    if (ship.before < -FLOATING_POINT_TOLERANCE && ship.after + FLOATING_POINT_TOLERANCE < ship.before) {
      throw new DomainValidationError(`Deficit ship cannot exit worse: ${ship.shipId}`);
    }

    if (ship.before > FLOATING_POINT_TOLERANCE && ship.after < -FLOATING_POINT_TOLERANCE) {
      throw new DomainValidationError(`Surplus ship cannot exit negative: ${ship.shipId}`);
    }
  }

  return mutableShips.map((ship) => ({
    shipId: ship.shipId,
    cbBefore: ship.before,
    cbAfter: Math.abs(ship.after) < FLOATING_POINT_TOLERANCE ? 0 : ship.after,
  }));
};

