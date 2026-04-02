import { MouseEventHandler } from 'react';
import bitcoinLogo from '../assets/images/bitcoin.png';
import catcoinLogo from '../assets/images/catcoin.png';
import etheruemLogo from '../assets/images/etheruem.png';
import logo from '../assets/images/logo.svg';
import markLogo from '../assets/images/mark.png';
import { MOON_LOGO_URL } from '../game/constants';
import { CenterSkin, OrbitMoon, RewardBurst } from '../game/types';

type DashboardViewProps = {
  selectedSkin: CenterSkin;
  currentBalance: number;
  totalDogePerSecond: number;
  totalDogePerClick: number;
  miningPupMoons: OrbitMoon[];
  miningPup2Moons: OrbitMoon[];
  miningPup3Moons: OrbitMoon[];
  rewardBursts: RewardBurst[];
  onGenerate: MouseEventHandler<HTMLButtonElement>;
  onDeveloperReward: () => void;
};

type MoonOrbitProps = {
  moons: OrbitMoon[];
  imageSrc: string;
  className?: string;
};

function MoonOrbit({ moons, imageSrc, className = 'moon-orbit' }: MoonOrbitProps) {
  return (
    <>
      {moons.map((moon) => (
        <span
          key={moon.id}
          className={className}
          style={{
            ['--orbit-angle' as string]: `${moon.angle}deg`,
            ['--orbit-duration' as string]: `${moon.duration}s`,
            ['--orbit-radius' as string]: `${moon.radius}px`,
            ['--moon-size' as string]: `${moon.size}px`,
          }}
        >
          <span className="moon-offset">
            <img src={imageSrc} className="moon-logo spin" alt="" />
          </span>
        </span>
      ))}
    </>
  );
}

export function DashboardView({
  selectedSkin,
  currentBalance,
  totalDogePerSecond,
  totalDogePerClick,
  miningPupMoons,
  miningPup2Moons,
  miningPup3Moons,
  rewardBursts,
  onGenerate,
  onDeveloperReward,
}: DashboardViewProps) {
  const centerLogoSrc = selectedSkin === 'catcoin'
    ? catcoinLogo
    : selectedSkin === 'mark'
      ? markLogo
      : logo;
  const isPictureSkin = selectedSkin === 'catcoin' || selectedSkin === 'mark';
  const centerLogoClassName = isPictureSkin
    ? 'logo spin center-logo center-logo-picture'
    : 'logo spin center-logo';
  const centerLogoAlt = selectedSkin === 'catcoin'
    ? 'CatCoin skin'
    : selectedSkin === 'mark'
      ? 'Mark skin'
      : 'Doge logo';

  return (
    <>
      <div className="logo-orbit">
        <div className="moon-layer" aria-hidden="true">
          <MoonOrbit moons={miningPupMoons} imageSrc={MOON_LOGO_URL} />
          <MoonOrbit moons={miningPup2Moons} imageSrc={etheruemLogo} className="moon-orbit moon-orbit-tier-two" />
          <MoonOrbit moons={miningPup3Moons} imageSrc={bitcoinLogo} className="moon-orbit moon-orbit-tier-three" />
        </div>
        <div className="logo-feedback-layer" aria-hidden="true">
          {rewardBursts.map((burst) => (
            <span key={`pulse-${burst.id}`} className="logo-pulse-ring" />
          ))}
        </div>

        <button
          type="button"
          className="logo-button"
          onClick={onGenerate}
          aria-label="Generate DogeCoin"
        >
          <img src={centerLogoSrc} className={centerLogoClassName} alt={centerLogoAlt} />
        </button>
      </div>

      <h1 className="dashboard-title">DogeCoin Generator</h1>
      <section className="stats-banner">
        <div className="metric-card">
          <p className="balance-label">Current balance</p>
          <h2 className="balance-value">
            {currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} DOGE
          </h2>
        </div>
        <div className="metric-card">
          <p className="stats-label">Doge per second</p>
          <h2 className="stats-value">{totalDogePerSecond.toFixed(2)} DOGE/sec</h2>
        </div>
        <div className="metric-card">
          <p className="stats-label">Doge per click</p>
          <h2 className="stats-value">{totalDogePerClick.toFixed(2)} DOGE/click</h2>
        </div>
      </section>
      <button
        type="button"
        className="secret-smiley-button"
        onClick={onDeveloperReward}
        aria-label="Smiley reward"
      >
        :)
      </button>

      {rewardBursts.map((burst) => (
        <span
          key={burst.id}
          className="reward-burst"
          style={{ left: burst.x, top: burst.y }}
        >
          +{burst.amount.toFixed(2)} DOGE
        </span>
      ))}
    </>
  );
}
