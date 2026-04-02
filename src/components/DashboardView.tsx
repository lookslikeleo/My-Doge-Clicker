import {
  MouseEventHandler,
  PointerEvent as ReactPointerEvent,
  useCallback,
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

const normalizeAngle = (angle: number) => {
  const normalized = angle % 360;
  return normalized <= -180 ? normalized + 360 : normalized > 180 ? normalized - 360 : normalized;
};

const ORBIT_SPEED_MULTIPLIER = 0.65;
const RETURN_EASE_MULTIPLIER = 0.6;

function MoonOrbit({ moons, imageSrc, className = 'moon-orbit' }: MoonOrbitProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const orbitTargetsRef = useRef<Record<string, number>>(
    Object.fromEntries(moons.map((moon) => [moon.id, moon.angle])),
  );
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
      const nextTargets: Record<string, number> = {};

      moons.forEach((moon) => {
        const existingState = currentStates[moon.id];
        nextTargets[moon.id] = orbitTargetsRef.current[moon.id] ?? moon.angle;
        nextStates[moon.id] = existingState
          ? existingState
          : {
            angle: moon.angle,
            radius: moon.radius,
            isDragging: false,
          };
      });

      orbitTargetsRef.current = nextTargets;
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
          const orbitSpeed = (360 / moon.duration) * ORBIT_SPEED_MULTIPLIER;
          const nextTargetAngle = (orbitTargetsRef.current[moon.id] ?? moon.angle) - orbitSpeed * deltaSeconds;
          orbitTargetsRef.current[moon.id] = nextTargetAngle;

          if (currentState.isDragging) {
            nextStates[moon.id] = currentState;
            return;
          }

          const angleDifference = normalizeAngle(nextTargetAngle - currentState.angle);
          const easeStrength = Math.min(1, deltaSeconds * RETURN_EASE_MULTIPLIER);
          const nextAngle = currentState.angle + angleDifference * easeStrength;
          const nextRadius = currentState.radius + (moon.radius - currentState.radius) * easeStrength;
          nextStates[moon.id] = {
            ...currentState,
            angle: nextAngle,
            radius: nextRadius,
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
  const [orbitOffset, setOrbitOffset] = useState({ x: 0, y: 0 });
  const orbitDragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    active: boolean;
  } | null>(null);
  const suppressLogoClickRef = useRef(false);
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

  const handleLogoPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    orbitDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: orbitOffset.x,
      originY: orbitOffset.y,
      moved: false,
      active: true,
    };
    suppressLogoClickRef.current = false;
    event.preventDefault();
  }, [orbitOffset.x, orbitOffset.y]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const activeDrag = orbitDragRef.current;

      if (!activeDrag?.active) {
        return;
      }

      const deltaX = event.clientX - activeDrag.startX;
      const deltaY = event.clientY - activeDrag.startY;

      if (!activeDrag.moved && Math.hypot(deltaX, deltaY) > 4) {
        activeDrag.moved = true;
      }

      setOrbitOffset({
        x: activeDrag.originX + deltaX,
        y: activeDrag.originY + deltaY,
      });
    };

    const handlePointerUp = () => {
      if (!orbitDragRef.current?.active) {
        return;
      }

      suppressLogoClickRef.current = orbitDragRef.current.moved;
      orbitDragRef.current = {
        ...orbitDragRef.current,
        active: false,
      };
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const handleGenerateClick: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    if (suppressLogoClickRef.current) {
      suppressLogoClickRef.current = false;
      event.preventDefault();
      return;
    }

    onGenerate(event);
  }, [onGenerate]);

  return (
    <>
      <div
        className="logo-orbit"
        style={{ transform: `translate(${orbitOffset.x}px, ${orbitOffset.y}px)` }}
      >
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
          onClick={handleGenerateClick}
          onPointerDown={handleLogoPointerDown}
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
