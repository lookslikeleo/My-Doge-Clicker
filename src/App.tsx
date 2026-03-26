import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

type View = 'dashboard' | 'store';
type RewardBurst = {
  id: number;
  x: number;
  y: number;
  amount: number;
};
type ManualGeneration = {
  id: number;
  amount: number;
  createdAt: number;
};

const BALANCE_COOKIE = 'doge_balance';
const DOGE_PER_CLICK_COOKIE = 'doge_per_click';
const DOGE_PER_SECOND_COOKIE = 'doge_per_second';
const DEFAULT_BALANCE = 0;
const DEFAULT_DOGE_PER_CLICK = 1;
const DEFAULT_DOGE_PER_SECOND = 0;
const CLICK_UPGRADE_COST = 100;
const PASSIVE_UPGRADE_COST = 250;
const PASSIVE_TICK_MS = 250;
const MANUAL_RATE_WINDOW_MS = 1000;

function readNumberCookie(name: string, fallback: number) {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) {
    return fallback;
  }

  const value = Number.parseFloat(decodeURIComponent(targetCookie.split('=')[1]));

  return Number.isFinite(value) ? value : fallback;
}

function writeNumberCookie(name: string, value: number) {
  document.cookie = `${name}=${encodeURIComponent(value.toString())}; path=/; max-age=31536000; SameSite=Lax`;
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentBalance, setCurrentBalance] = useState(() => readNumberCookie(BALANCE_COOKIE, DEFAULT_BALANCE));
  const [dogePerClick, setDogePerClick] = useState(() => readNumberCookie(DOGE_PER_CLICK_COOKIE, DEFAULT_DOGE_PER_CLICK));
  const [dogePerSecond, setDogePerSecond] = useState(() => readNumberCookie(DOGE_PER_SECOND_COOKIE, DEFAULT_DOGE_PER_SECOND));
  const [rewardBursts, setRewardBursts] = useState<RewardBurst[]>([]);
  const [manualGenerations, setManualGenerations] = useState<ManualGeneration[]>([]);

  useEffect(() => {
    document.title = 'DogeCoin Generator';
  }, []);

  useEffect(() => {
    writeNumberCookie(BALANCE_COOKIE, currentBalance);
  }, [currentBalance]);

  useEffect(() => {
    writeNumberCookie(DOGE_PER_CLICK_COOKIE, dogePerClick);
  }, [dogePerClick]);

  useEffect(() => {
    writeNumberCookie(DOGE_PER_SECOND_COOKIE, dogePerSecond);
  }, [dogePerSecond]);

  useEffect(() => {
    if (dogePerSecond <= 0) {
      return undefined;
    }

    const tickValue = dogePerSecond * (PASSIVE_TICK_MS / 1000);
    const timer = window.setInterval(() => {
      setCurrentBalance((balance) => balance + tickValue);
    }, PASSIVE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [dogePerSecond]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setManualGenerations((events) => events.filter((event) => now - event.createdAt < MANUAL_RATE_WINDOW_MS));
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  const liveManualDogePerSecond = manualGenerations.reduce((total, event) => total + event.amount, 0);
  const totalDogePerSecond = dogePerSecond + liveManualDogePerSecond;

  const spawnRewardBurst = (x: number, y: number, amount: number) => {
    const burstId = Date.now() + Math.random();

    setRewardBursts((bursts) => [...bursts, { id: burstId, x, y, amount }]);

    window.setTimeout(() => {
      setRewardBursts((bursts) => bursts.filter((burst) => burst.id !== burstId));
    }, 900);
  };

  const handleGenerateDogeCoin = (event: React.MouseEvent<HTMLButtonElement>) => {
    const createdAt = Date.now();

    setCurrentBalance((balance) => balance + dogePerClick);
    setManualGenerations((events) => [
      ...events.filter((entry) => createdAt - entry.createdAt < MANUAL_RATE_WINDOW_MS),
      { id: createdAt + Math.random(), amount: dogePerClick, createdAt },
    ]);
    spawnRewardBurst(event.clientX, event.clientY, dogePerClick);
  };

  const buyClickUpgrade = () => {
    if (currentBalance < CLICK_UPGRADE_COST) {
      return;
    }

    setCurrentBalance((balance) => balance - CLICK_UPGRADE_COST);
    setDogePerClick((value) => value + 1);
  };

  const buyPassiveUpgrade = () => {
    if (currentBalance < PASSIVE_UPGRADE_COST) {
      return;
    }

    setCurrentBalance((balance) => balance - PASSIVE_UPGRADE_COST);
    setDogePerSecond((value) => value + 1);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>Doge Menu</h3>
        <ul>
          <li>
            <button
              type="button"
              className={`menu-button ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`menu-button ${activeView === 'store' ? 'active' : ''}`}
              onClick={() => setActiveView('store')}
            >
              Store
            </button>
          </li>
        </ul>
      </aside>

      <main className="main">
        {activeView === 'dashboard' ? (
          <>
            <h1>DogeCoin Generator</h1>
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
                <h2 className="stats-value">{dogePerClick.toFixed(0)} DOGE/click</h2>
              </div>
            </section>

            <div className="logo-container">
              <img src={logo} className="logo spin" alt="logo" />
            </div>

            <p>Become rich in one click!</p>

            <button
              type="button"
              className="link generate-button"
              onClick={handleGenerateDogeCoin}
            >
              Generate DogeCoin
            </button>
          </>
        ) : (
          <section className="store-card">
            <p className="store-label">Doge Store</p>
            <h1 className="store-title">Upgrade your generator</h1>

            <div className="upgrade-grid">
              <article className="upgrade-card">
                <p className="upgrade-name">Sharper Clicker</p>
                <p className="upgrade-cost">Cost: {CLICK_UPGRADE_COST} DOGE</p>
                <p className="upgrade-note">Adds +1 DOGE to every click.</p>
                <button
                  type="button"
                  className="store-button"
                  onClick={buyClickUpgrade}
                  disabled={currentBalance < CLICK_UPGRADE_COST}
                >
                  Buy Click Upgrade
                </button>
              </article>

              <article className="upgrade-card">
                <p className="upgrade-name">Mining Pup</p>
                <p className="upgrade-cost">Cost: {PASSIVE_UPGRADE_COST} DOGE</p>
                <p className="upgrade-note">Adds +1 DOGE/sec permanently.</p>
                <button
                  type="button"
                  className="store-button"
                  onClick={buyPassiveUpgrade}
                  disabled={currentBalance < PASSIVE_UPGRADE_COST}
                >
                  Buy Passive Upgrade
                </button>
              </article>
            </div>
          </section>
        )}
      </main>

      {rewardBursts.map((burst) => (
        <span
          key={burst.id}
          className="reward-burst"
          style={{ left: burst.x, top: burst.y }}
        >
          +{burst.amount} DOGE
        </span>
      ))}
    </div>
  );
}

export default App;
