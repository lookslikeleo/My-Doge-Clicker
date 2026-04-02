import {
  MouseEventHandler,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
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

type MoonMotionState = {
  angle: number;
  radius: number;
  isDragging: boolean;
};

function MoonOrbit({ moons, imageSrc, className = 'moon-orbit' }: MoonOrbitProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const [moonStates, setMoonStates] = useState<Record<string, MoonMotionState>>(() => (
    Object.fromEntries(
      moons.map((moon) => [
        moon.id,
        {
          angle: moon.angle,
          radius: moon.radius,
          isDragging: false,
        },
      ]),
    )
  ));

  useEffect(() => {
    setMoonStates((currentStates) => {
      const nextStates: Record<string, MoonMotionState> = {};

      moons.forEach((moon) => {
        const existingState = currentStates[moon.id];
        nextStates[moon.id] = existingState
          ? existingState
          : {
            angle: moon.angle,
            radius: moon.radius,
            isDragging: false,
          };
      });

      return nextStates;
    });
  }, [moons]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      const lastTimestamp = lastFrameTimeRef.current ?? timestamp;
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastFrameTimeRef.current = timestamp;

      setMoonStates((currentStates) => {
        let changed = false;
        const nextStates: Record<string, MoonMotionState> = {};

        moons.forEach((moon) => {
          const currentState = currentStates[moon.id] ?? {
            angle: moon.angle,
            radius: moon.radius,
            isDragging: false,
          };

          if (currentState.isDragging) {
            nextStates[moon.id] = currentState;
            return;
          }

          const orbitSpeed = 360 / moon.duration;
          const nextAngle = currentState.angle - orbitSpeed * deltaSeconds;
          nextStates[moon.id] = {
            ...currentState,
            angle: nextAngle,
          };
          changed = true;
        });

        return changed ? nextStates : currentStates;
      });

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      lastFrameTimeRef.current = null;
    };
  }, [moons]);

  const updateMoonFromPointer = (moonId: string, clientX: number, clientY: number) => {
    const layerRect = layerRef.current?.getBoundingClientRect();

    if (!layerRect) {
      return;
    }

    const centerX = layerRect.left + layerRect.width / 2;
    const centerY = layerRect.top + layerRect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const nextRadius = Math.hypot(deltaX, deltaY);
    const nextAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    setMoonStates((currentStates) => ({
      ...currentStates,
      [moonId]: {
        ...(currentStates[moonId] ?? { angle: nextAngle, radius: nextRadius }),
        angle: nextAngle,
        radius: nextRadius,
        isDragging: true,
      },
    }));
  };

  const handlePointerDown = (moonId: string) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    dragIdRef.current = moonId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateMoonFromPointer(moonId, event.clientX, event.clientY);
  };

  const handlePointerMove = (moonId: string) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragIdRef.current !== moonId) {
      return;
    }

    updateMoonFromPointer(moonId, event.clientX, event.clientY);
  };

  const handlePointerEnd = (moonId: string) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragIdRef.current !== moonId) {
      return;
    }

    dragIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setMoonStates((currentStates) => ({
      ...currentStates,
      [moonId]: {
        ...(currentStates[moonId] ?? { angle: 0, radius: 0 }),
        isDragging: false,
      },
    }));
  };

  return (
    <div ref={layerRef} className="moon-orbit-layer">
      {moons.map((moon) => (
        <span
          key={moon.id}
          className={className}
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${(
              moonStates[moon.id]?.radius ?? moon.radius
            ) * Math.cos(((moonStates[moon.id]?.angle ?? moon.angle) * Math.PI) / 180)}px, ${(
              moonStates[moon.id]?.radius ?? moon.radius
            ) * Math.sin(((moonStates[moon.id]?.angle ?? moon.angle) * Math.PI) / 180)}px)`,
            ['--moon-size' as string]: `${moon.size}px`,
          }}
          onPointerDown={handlePointerDown(moon.id)}
          onPointerMove={handlePointerMove(moon.id)}
          onPointerUp={handlePointerEnd(moon.id)}
          onPointerCancel={handlePointerEnd(moon.id)}
        >
          <img src={imageSrc} className="moon-logo spin" alt="" draggable={false} />
        </span>
      ))}
    </div>
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
