import React, { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import etheruemLogo from './etheruem.png';
import bitcoinLogo from './bitcoin.png';
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
const CLICK_UPGRADE_COUNT_COOKIE = 'doge_click_upgrade_count';
const PASSIVE_UPGRADE_COUNT_COOKIE = 'doge_passive_upgrade_count';
const SHARPER_CLICKER_2_COUNT_COOKIE = 'doge_sharper_clicker_2_count';
const MINING_PUP_2_COUNT_COOKIE = 'doge_mining_pup_2_count';
const SHARPER_CLICKER_3_COUNT_COOKIE = 'doge_sharper_clicker_3_count';
const MINING_PUP_3_COUNT_COOKIE = 'doge_mining_pup_3_count';
const MOON_LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/4964/4964814.png';
const DEFAULT_BALANCE = 0;
const DEFAULT_DOGE_PER_CLICK = 1;
const DEFAULT_DOGE_PER_SECOND = 0;
const CLICK_UPGRADE_COST = 100;
const PASSIVE_UPGRADE_COST = 250;
const SHARPER_CLICKER_2_COST = 1000;
const MINING_PUP_2_COST = 1000;
const SHARPER_CLICKER_3_COST = 10000;
const MINING_PUP_3_COST = 10000;
const UPGRADE_COST_MULTIPLIER = 1.25;
const UPGRADE_POWER_MULTIPLIER = 1.1;
const TIER_TWO_BOOST_PER_PURCHASE = 0.35;
const TIER_THREE_BOOST_PER_PURCHASE = 0.5;
const PASSIVE_TICK_MS = 1000;
const MANUAL_RATE_WINDOW_MS = 1000;
const ADVANCED_UPGRADE_UNLOCK_COUNT = 10;
const DEVELOPER_REWARD = 100000;
const COOKIE_SYNC_MS = 500;

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

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateUpgradeGain(baseGain: number, ownedCount: number) {
  return roundToTwo(baseGain * UPGRADE_POWER_MULTIPLIER ** ownedCount);
}

function calculateUpgradeCost(baseCost: number, ownedCount: number) {
  return roundToTwo(baseCost * UPGRADE_COST_MULTIPLIER ** ownedCount);
}

function calculateTotalPower(baseValue: number, baseGain: number, ownedCount: number) {
  let total = baseValue;

  for (let index = 0; index < ownedCount; index += 1) {
    total += calculateUpgradeGain(baseGain, index);
  }

  return roundToTwo(total);
}

function inferClickUpgradeCount() {
  const legacyValue = readNumberCookie(DOGE_PER_CLICK_COOKIE, DEFAULT_DOGE_PER_CLICK);
  return Math.max(0, Math.round(legacyValue - DEFAULT_DOGE_PER_CLICK));
}

function inferPassiveUpgradeCount() {
  const legacyValue = readNumberCookie(DOGE_PER_SECOND_COOKIE, DEFAULT_DOGE_PER_SECOND);
  return Math.max(0, Math.round(legacyValue - DEFAULT_DOGE_PER_SECOND));
}

function buildMiningPupMoons(count: number) {
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

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentBalance, setCurrentBalance] = useState(() => readNumberCookie(BALANCE_COOKIE, DEFAULT_BALANCE));
  const [clickUpgradeCount, setClickUpgradeCount] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(CLICK_UPGRADE_COUNT_COOKIE, inferClickUpgradeCount()))),
  );
  const [passiveUpgradeCount, setPassiveUpgradeCount] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(PASSIVE_UPGRADE_COUNT_COOKIE, inferPassiveUpgradeCount()))),
  );
  const [sharperClicker2Count, setSharperClicker2Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_2_COUNT_COOKIE, 0))),
  );
  const [miningPup2Count, setMiningPup2Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(MINING_PUP_2_COUNT_COOKIE, readNumberCookie('doge_auto_clicker_count', 0)))),
  );
  const [sharperClicker3Count, setSharperClicker3Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_3_COUNT_COOKIE, 0))),
  );
  const [miningPup3Count, setMiningPup3Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(MINING_PUP_3_COUNT_COOKIE, 0))),
  );
  const [rewardBursts, setRewardBursts] = useState<RewardBurst[]>([]);
  const [manualGenerations, setManualGenerations] = useState<ManualGeneration[]>([]);

  const baseDogePerClick = useMemo(
    () => calculateTotalPower(DEFAULT_DOGE_PER_CLICK, 1, clickUpgradeCount),
    [clickUpgradeCount],
  );
  const dogePerClick = useMemo(
    () => roundToTwo(baseDogePerClick * (1 + sharperClicker2Count * TIER_TWO_BOOST_PER_PURCHASE)),
    [baseDogePerClick, sharperClicker2Count],
  );
  const totalDogePerClick = useMemo(
    () => roundToTwo(dogePerClick * (1 + sharperClicker3Count * TIER_THREE_BOOST_PER_PURCHASE)),
    [dogePerClick, sharperClicker3Count],
  );

  const baseDogePerSecond = useMemo(
    () => calculateTotalPower(DEFAULT_DOGE_PER_SECOND, 1, passiveUpgradeCount),
    [passiveUpgradeCount],
  );
  const dogePerSecond = useMemo(
    () => roundToTwo(baseDogePerSecond * (1 + miningPup2Count * TIER_TWO_BOOST_PER_PURCHASE)),
    [baseDogePerSecond, miningPup2Count],
  );
  const totalPassiveDogePerSecond = useMemo(
    () => roundToTwo(dogePerSecond * (1 + miningPup3Count * TIER_THREE_BOOST_PER_PURCHASE)),
    [dogePerSecond, miningPup3Count],
  );

  const nextClickUpgradeCost = useMemo(
    () => calculateUpgradeCost(CLICK_UPGRADE_COST, clickUpgradeCount),
    [clickUpgradeCount],
  );
  const nextPassiveUpgradeCost = useMemo(
    () => calculateUpgradeCost(PASSIVE_UPGRADE_COST, passiveUpgradeCount),
    [passiveUpgradeCount],
  );
  const nextClickUpgradeGain = useMemo(
    () => calculateUpgradeGain(1, clickUpgradeCount),
    [clickUpgradeCount],
  );
  const nextPassiveUpgradeGain = useMemo(
    () => calculateUpgradeGain(1, passiveUpgradeCount),
    [passiveUpgradeCount],
  );
  const nextSharperClicker2Cost = useMemo(
    () => calculateUpgradeCost(SHARPER_CLICKER_2_COST, sharperClicker2Count),
    [sharperClicker2Count],
  );
  const nextSharperClicker2Gain = useMemo(
    () => roundToTwo(baseDogePerClick * TIER_TWO_BOOST_PER_PURCHASE),
    [baseDogePerClick],
  );
  const nextMiningPup2Cost = useMemo(
    () => calculateUpgradeCost(MINING_PUP_2_COST, miningPup2Count),
    [miningPup2Count],
  );
  const nextMiningPup2Gain = useMemo(
    () => roundToTwo(baseDogePerSecond * TIER_TWO_BOOST_PER_PURCHASE),
    [baseDogePerSecond],
  );
  const nextSharperClicker3Cost = useMemo(
    () => calculateUpgradeCost(SHARPER_CLICKER_3_COST, sharperClicker3Count),
    [sharperClicker3Count],
  );
  const nextSharperClicker3Gain = useMemo(
    () => roundToTwo(dogePerClick * TIER_THREE_BOOST_PER_PURCHASE),
    [dogePerClick],
  );
  const nextMiningPup3Cost = useMemo(
    () => calculateUpgradeCost(MINING_PUP_3_COST, miningPup3Count),
    [miningPup3Count],
  );
  const nextMiningPup3Gain = useMemo(
    () => roundToTwo(dogePerSecond * TIER_THREE_BOOST_PER_PURCHASE),
    [dogePerSecond],
  );

  const sharperClicker2Unlocked = clickUpgradeCount >= ADVANCED_UPGRADE_UNLOCK_COUNT;
  const miningPup2Unlocked = passiveUpgradeCount >= ADVANCED_UPGRADE_UNLOCK_COUNT;
  const sharperClicker3Unlocked = sharperClicker2Count >= ADVANCED_UPGRADE_UNLOCK_COUNT;
  const miningPup3Unlocked = miningPup2Count >= ADVANCED_UPGRADE_UNLOCK_COUNT;
  const miningPupMoons = useMemo(() => buildMiningPupMoons(passiveUpgradeCount), [passiveUpgradeCount]);
  const miningPup2Moons = useMemo(
    () =>
      buildMiningPupMoons(miningPup2Count).map((moon) => ({
        ...moon,
        id: `mining-pup-2-${moon.id}`,
        radius: moon.radius + 42,
        size: moon.size + 6,
        duration: moon.duration + 1.25,
      })),
    [miningPup2Count],
  );
  const miningPup3Moons = useMemo(
    () =>
      buildMiningPupMoons(miningPup3Count).map((moon) => ({
        ...moon,
        id: `mining-pup-3-${moon.id}`,
        radius: moon.radius + 84,
        size: moon.size + 18,
        duration: moon.duration + 2.5,
      })),
    [miningPup3Count],
  );

  useEffect(() => {
    document.title = 'DogeCoin Generator';
  }, []);

  useEffect(() => {
    writeNumberCookie(BALANCE_COOKIE, roundToTwo(currentBalance));
  }, [currentBalance]);

  useEffect(() => {
    writeNumberCookie(CLICK_UPGRADE_COUNT_COOKIE, clickUpgradeCount);
    writeNumberCookie(DOGE_PER_CLICK_COOKIE, totalDogePerClick);
  }, [clickUpgradeCount, totalDogePerClick]);

  useEffect(() => {
    writeNumberCookie(PASSIVE_UPGRADE_COUNT_COOKIE, passiveUpgradeCount);
    writeNumberCookie(DOGE_PER_SECOND_COOKIE, totalPassiveDogePerSecond);
  }, [passiveUpgradeCount, totalPassiveDogePerSecond]);

  useEffect(() => {
    writeNumberCookie(SHARPER_CLICKER_2_COUNT_COOKIE, sharperClicker2Count);
  }, [sharperClicker2Count]);

  useEffect(() => {
    writeNumberCookie(MINING_PUP_2_COUNT_COOKIE, miningPup2Count);
  }, [miningPup2Count]);

  useEffect(() => {
    writeNumberCookie(SHARPER_CLICKER_3_COUNT_COOKIE, sharperClicker3Count);
  }, [sharperClicker3Count]);

  useEffect(() => {
    writeNumberCookie(MINING_PUP_3_COUNT_COOKIE, miningPup3Count);
  }, [miningPup3Count]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cookieBalance = readNumberCookie(BALANCE_COOKIE, DEFAULT_BALANCE);
      const cookieClickUpgradeCount = Math.max(
        0,
        Math.round(readNumberCookie(CLICK_UPGRADE_COUNT_COOKIE, inferClickUpgradeCount())),
      );
      const cookiePassiveUpgradeCount = Math.max(
        0,
        Math.round(readNumberCookie(PASSIVE_UPGRADE_COUNT_COOKIE, inferPassiveUpgradeCount())),
      );
      const cookieSharperClicker2Count = Math.max(
        0,
        Math.round(readNumberCookie(SHARPER_CLICKER_2_COUNT_COOKIE, 0)),
      );
      const cookieMiningPup2Count = Math.max(
        0,
        Math.round(readNumberCookie(MINING_PUP_2_COUNT_COOKIE, readNumberCookie('doge_auto_clicker_count', 0))),
      );
      const cookieSharperClicker3Count = Math.max(
        0,
        Math.round(readNumberCookie(SHARPER_CLICKER_3_COUNT_COOKIE, 0)),
      );
      const cookieMiningPup3Count = Math.max(
        0,
        Math.round(readNumberCookie(MINING_PUP_3_COUNT_COOKIE, 0)),
      );

      if (cookieBalance !== roundToTwo(currentBalance)) {
        setCurrentBalance(cookieBalance);
      }

      if (cookieClickUpgradeCount !== clickUpgradeCount) {
        setClickUpgradeCount(cookieClickUpgradeCount);
      }

      if (cookiePassiveUpgradeCount !== passiveUpgradeCount) {
        setPassiveUpgradeCount(cookiePassiveUpgradeCount);
      }

      if (cookieSharperClicker2Count !== sharperClicker2Count) {
        setSharperClicker2Count(cookieSharperClicker2Count);
      }

      if (cookieMiningPup2Count !== miningPup2Count) {
        setMiningPup2Count(cookieMiningPup2Count);
      }

      if (cookieSharperClicker3Count !== sharperClicker3Count) {
        setSharperClicker3Count(cookieSharperClicker3Count);
      }

      if (cookieMiningPup3Count !== miningPup3Count) {
        setMiningPup3Count(cookieMiningPup3Count);
      }
    }, COOKIE_SYNC_MS);

    return () => window.clearInterval(timer);
  }, [
    clickUpgradeCount,
    currentBalance,
    miningPup2Count,
    miningPup3Count,
    passiveUpgradeCount,
    sharperClicker2Count,
    sharperClicker3Count,
  ]);

  useEffect(() => {
    if (totalPassiveDogePerSecond <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentBalance((balance) => roundToTwo(balance + totalPassiveDogePerSecond));
    }, PASSIVE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [totalPassiveDogePerSecond]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setManualGenerations((events) => events.filter((event) => now - event.createdAt < MANUAL_RATE_WINDOW_MS));
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  const liveManualDogePerSecond = roundToTwo(
    manualGenerations.reduce((total, event) => total + event.amount, 0),
  );
  const totalDogePerSecond = roundToTwo(totalPassiveDogePerSecond + liveManualDogePerSecond);

  const spawnRewardBurst = (x: number, y: number, amount: number) => {
    const burstId = Date.now() + Math.random();

    setRewardBursts((bursts) => [...bursts, { id: burstId, x, y, amount }]);

    window.setTimeout(() => {
      setRewardBursts((bursts) => bursts.filter((burst) => burst.id !== burstId));
    }, 900);
  };

  const handleGenerateDogeCoin = (event: React.MouseEvent<HTMLButtonElement>) => {
    const createdAt = Date.now();

    setCurrentBalance((balance) => roundToTwo(balance + totalDogePerClick));
    setManualGenerations((events) => [
      ...events.filter((entry) => createdAt - entry.createdAt < MANUAL_RATE_WINDOW_MS),
      { id: createdAt + Math.random(), amount: totalDogePerClick, createdAt },
    ]);
    spawnRewardBurst(event.clientX, event.clientY, totalDogePerClick);
  };

  const buyClickUpgrade = () => {
    if (currentBalance < nextClickUpgradeCost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextClickUpgradeCost));
    setClickUpgradeCount((value) => value + 1);
  };

  const buyPassiveUpgrade = () => {
    if (currentBalance < nextPassiveUpgradeCost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextPassiveUpgradeCost));
    setPassiveUpgradeCount((value) => value + 1);
  };

  const buySharperClicker2Upgrade = () => {
    if (!sharperClicker2Unlocked || currentBalance < nextSharperClicker2Cost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextSharperClicker2Cost));
    setSharperClicker2Count((value) => value + 1);
  };

  const buyMiningPup2Upgrade = () => {
    if (!miningPup2Unlocked || currentBalance < nextMiningPup2Cost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextMiningPup2Cost));
    setMiningPup2Count((value) => value + 1);
  };

  const buySharperClicker3Upgrade = () => {
    if (!sharperClicker3Unlocked || currentBalance < nextSharperClicker3Cost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextSharperClicker3Cost));
    setSharperClicker3Count((value) => value + 1);
  };

  const buyMiningPup3Upgrade = () => {
    if (!miningPup3Unlocked || currentBalance < nextMiningPup3Cost) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - nextMiningPup3Cost));
    setMiningPup3Count((value) => value + 1);
  };

  const addDeveloperDoge = () => {
    setCurrentBalance((balance) => roundToTwo(balance + DEVELOPER_REWARD));
  };

  return (
    <div className="layout">
      <header className="topbar">
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
          <li>
            <button
              type="button"
              className="menu-button developer-button"
              onClick={addDeveloperDoge}
            >
              Developer +100000
            </button>
          </li>
        </ul>
      </header>

      <main className="main">
        {activeView === 'dashboard' ? (
          <>
            <div className="logo-orbit">
              <div className="moon-layer" aria-hidden="true">
                {miningPupMoons.map((moon) => (
                  <span
                    key={moon.id}
                    className="moon-orbit"
                    style={{
                      ['--orbit-angle' as string]: `${moon.angle}deg`,
                      ['--orbit-duration' as string]: `${moon.duration}s`,
                      ['--orbit-radius' as string]: `${moon.radius}px`,
                      ['--moon-size' as string]: `${moon.size}px`,
                    }}
                  >
                    <span className="moon-offset">
                      <img src={MOON_LOGO_URL} className="moon-logo spin" alt="" />
                    </span>
                  </span>
                ))}
                {miningPup2Moons.map((moon) => (
                  <span
                    key={moon.id}
                    className="moon-orbit moon-orbit-tier-two"
                    style={{
                      ['--orbit-angle' as string]: `${moon.angle}deg`,
                      ['--orbit-duration' as string]: `${moon.duration}s`,
                      ['--orbit-radius' as string]: `${moon.radius}px`,
                      ['--moon-size' as string]: `${moon.size}px`,
                    }}
                  >
                    <span className="moon-offset">
                      <img src={etheruemLogo} className="moon-logo spin" alt="" />
                    </span>
                  </span>
                ))}
                {miningPup3Moons.map((moon) => (
                  <span
                    key={moon.id}
                    className="moon-orbit moon-orbit-tier-three"
                    style={{
                      ['--orbit-angle' as string]: `${moon.angle}deg`,
                      ['--orbit-duration' as string]: `${moon.duration}s`,
                      ['--orbit-radius' as string]: `${moon.radius}px`,
                      ['--moon-size' as string]: `${moon.size}px`,
                    }}
                  >
                    <span className="moon-offset">
                      <img src={bitcoinLogo} className="moon-logo spin" alt="" />
                    </span>
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="logo-button"
                onClick={handleGenerateDogeCoin}
                aria-label="Generate DogeCoin"
              >
                <img src={logo} className="logo spin" alt="logo" />
              </button>
            </div>

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
                <h2 className="stats-value">{totalDogePerClick.toFixed(2)} DOGE/click</h2>
              </div>
            </section>
          </>
        ) : (
          <section className="store-card">
            <p className="store-label">Doge Store</p>
            <h1 className="store-title">Upgrade your generator</h1>

            <div className="upgrade-grid">
              <article className="upgrade-card">
                <p className="upgrade-name">Sharper Clicker</p>
                <p className="upgrade-cost">Cost: {nextClickUpgradeCost.toFixed(2)} DOGE</p>
                <p className="upgrade-owned">Owned: {clickUpgradeCount}</p>
                <p className="upgrade-note">Next bonus: +{nextClickUpgradeGain.toFixed(2)} DOGE/click</p>
                <button
                  type="button"
                  className="store-button"
                  onClick={buyClickUpgrade}
                  disabled={currentBalance < nextClickUpgradeCost}
                >
                  Buy Click Upgrade
                </button>
              </article>

              <article className="upgrade-card">
                <p className="upgrade-name">Mining Pup</p>
                <p className="upgrade-cost">Cost: {nextPassiveUpgradeCost.toFixed(2)} DOGE</p>
                <p className="upgrade-owned">Owned: {passiveUpgradeCount}</p>
                <p className="upgrade-note">Next bonus: +{nextPassiveUpgradeGain.toFixed(2)} DOGE/sec</p>
                <button
                  type="button"
                  className="store-button"
                  onClick={buyPassiveUpgrade}
                  disabled={currentBalance < nextPassiveUpgradeCost}
                >
                  Buy Passive Upgrade
                </button>
              </article>

              {sharperClicker2Unlocked ? (
                <article className="upgrade-card">
                  <p className="upgrade-name">Sharper Clicker 2</p>
                  <p className="upgrade-cost">Cost: {nextSharperClicker2Cost.toFixed(2)} DOGE</p>
                  <p className="upgrade-owned">Owned: {sharperClicker2Count}</p>
                  <p className="upgrade-note">Next bonus: +{nextSharperClicker2Gain.toFixed(2)} DOGE/click</p>
                  <button
                    type="button"
                    className="store-button"
                    onClick={buySharperClicker2Upgrade}
                    disabled={currentBalance < nextSharperClicker2Cost}
                  >
                    Buy Sharper Clicker 2
                  </button>
                </article>
              ) : null}

              {miningPup2Unlocked ? (
                <article className="upgrade-card">
                  <p className="upgrade-name">Mining Pup 2</p>
                  <p className="upgrade-cost">Cost: {nextMiningPup2Cost.toFixed(2)} DOGE</p>
                  <p className="upgrade-owned">Owned: {miningPup2Count}</p>
                  <p className="upgrade-note">Next bonus: +{nextMiningPup2Gain.toFixed(2)} DOGE/sec</p>
                  <button
                    type="button"
                    className="store-button"
                    onClick={buyMiningPup2Upgrade}
                    disabled={currentBalance < nextMiningPup2Cost}
                  >
                    Buy Mining Pup 2
                  </button>
                </article>
              ) : null}

              {sharperClicker3Unlocked ? (
                <article className="upgrade-card">
                  <p className="upgrade-name">Sharper Clicker 3</p>
                  <p className="upgrade-cost">Cost: {nextSharperClicker3Cost.toFixed(2)} DOGE</p>
                  <p className="upgrade-owned">Owned: {sharperClicker3Count}</p>
                  <p className="upgrade-note">Next bonus: +{nextSharperClicker3Gain.toFixed(2)} DOGE/click</p>
                  <button
                    type="button"
                    className="store-button"
                    onClick={buySharperClicker3Upgrade}
                    disabled={currentBalance < nextSharperClicker3Cost}
                  >
                    Buy Sharper Clicker 3
                  </button>
                </article>
              ) : null}

              {miningPup3Unlocked ? (
                <article className="upgrade-card">
                  <p className="upgrade-name">Mining Pup 3</p>
                  <p className="upgrade-cost">Cost: {nextMiningPup3Cost.toFixed(2)} DOGE</p>
                  <p className="upgrade-owned">Owned: {miningPup3Count}</p>
                  <p className="upgrade-note">Next bonus: +{nextMiningPup3Gain.toFixed(2)} DOGE/sec</p>
                  <button
                    type="button"
                    className="store-button"
                    onClick={buyMiningPup3Upgrade}
                    disabled={currentBalance < nextMiningPup3Cost}
                  >
                    Buy Mining Pup 3
                  </button>
                </article>
              ) : null}
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
          +{burst.amount.toFixed(2)} DOGE
        </span>
      ))}
    </div>
  );
}

export default App;
