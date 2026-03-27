export type View = 'dashboard' | 'store';

export type CenterSkin = 'doge' | 'catcoin' | 'mark';

export type RewardBurst = {
  id: number;
  x: number;
  y: number;
  amount: number;
};

export type ManualGeneration = {
  id: number;
  amount: number;
  createdAt: number;
};

export type OrbitMoon = {
  id: string;
  angle: number;
  duration: number;
  radius: number;
  size: number;
};
