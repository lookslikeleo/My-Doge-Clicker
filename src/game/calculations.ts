import {
  CLICK_UPGRADE_COUNT_COOKIE,
  DEFAULT_DOGE_PER_CLICK,
  DEFAULT_DOGE_PER_SECOND,
  DOGE_PER_CLICK_COOKIE,
  DOGE_PER_SECOND_COOKIE,
  PASSIVE_UPGRADE_COUNT_COOKIE,
  UPGRADE_COST_MULTIPLIER,
  UPGRADE_POWER_MULTIPLIER,
} from './constants';
import { readNumberCookie } from './cookies';
import { OrbitMoon } from './types';

export function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateUpgradeGain(baseGain: number, ownedCount: number) {
  return roundToTwo(baseGain * UPGRADE_POWER_MULTIPLIER ** ownedCount);
}

export function calculateUpgradeCost(baseCost: number, ownedCount: number) {
  return roundToTwo(baseCost * UPGRADE_COST_MULTIPLIER ** ownedCount);
}

export function calculateTotalPower(baseValue: number, baseGain: number, ownedCount: number) {
  let total = baseValue;

  for (let index = 0; index < ownedCount; index += 1) {
    total += calculateUpgradeGain(baseGain, index);
  }

  return roundToTwo(total);
}

export function inferClickUpgradeCount() {
  const legacyValue = readNumberCookie(DOGE_PER_CLICK_COOKIE, DEFAULT_DOGE_PER_CLICK);
  return Math.max(0, Math.round(legacyValue - DEFAULT_DOGE_PER_CLICK));
}

export function inferPassiveUpgradeCount() {
  const legacyValue = readNumberCookie(DOGE_PER_SECOND_COOKIE, DEFAULT_DOGE_PER_SECOND);
  return Math.max(0, Math.round(legacyValue - DEFAULT_DOGE_PER_SECOND));
}

export function readClickUpgradeCount() {
  return Math.max(0, Math.round(readNumberCookie(CLICK_UPGRADE_COUNT_COOKIE, inferClickUpgradeCount())));
}

export function readPassiveUpgradeCount() {
  return Math.max(0, Math.round(readNumberCookie(PASSIVE_UPGRADE_COUNT_COOKIE, inferPassiveUpgradeCount())));
}

export function buildMiningPupMoons(count: number): OrbitMoon[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    const duration = 8 + (index % 4) * 1.5;
    const size = 24 + (index % 3) * 4;
    const radius = 105 + (index % 4) * 18;

    return {
      id: `moon-${index}`,
      angle,
      duration,
      radius,
      size,
    };
  });
}
