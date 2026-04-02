import { MouseEvent, useEffect, useMemo, useState } from 'react';
import {
  ADVANCED_UPGRADE_UNLOCK_COUNT,
  BALANCE_COOKIE,
  CATCOIN_SKIN_COST,
  CATCOIN_SKIN_OWNED_COOKIE,
  CENTER_LOGO_DRAG_COST,
  CENTER_LOGO_DRAG_ENABLED_COOKIE,
  CENTER_LOGO_DRAG_UNLOCKED_COOKIE,
  CLICK_UPGRADE_COST,
  CLICK_UPGRADE_COUNT_COOKIE,
  COOKIE_SYNC_MS,
  DEFAULT_BALANCE,
  DEFAULT_DOGE_PER_CLICK,
  DEFAULT_DOGE_PER_SECOND,
  DEVELOPER_REWARD,
  DOGE_PER_CLICK_COOKIE,
  DOGE_PER_SECOND_COOKIE,
  LEGACY_AUTO_CLICKER_COUNT_COOKIE,
  MANUAL_RATE_WINDOW_MS,
  MARK_SKIN_COST,
  MARK_SKIN_OWNED_COOKIE,
  MINING_PUP_2_COST,
  MINING_PUP_2_COUNT_COOKIE,
  MINING_PUP_3_COST,
  MINING_PUP_3_COUNT_COOKIE,
  ORBIT_DRAG_COST,
  ORBIT_DRAG_ENABLED_COOKIE,
  ORBIT_DRAG_UNLOCKED_COOKIE,
  PASSIVE_TICK_MS,
  PASSIVE_UPGRADE_COST,
  PASSIVE_UPGRADE_COUNT_COOKIE,
  SELECTED_SKIN_COOKIE,
  SHARPER_CLICKER_2_COST,
  SHARPER_CLICKER_2_COUNT_COOKIE,
  SHARPER_CLICKER_3_COST,
  SHARPER_CLICKER_3_COUNT_COOKIE,
  TIER_THREE_BOOST_PER_PURCHASE,
  TIER_TWO_BOOST_PER_PURCHASE,
} from './constants';
import { readNumberCookie, readStringCookie, writeNumberCookie, writeStringCookie } from './cookies';
import {
  buildMiningPupMoons,
  calculateTotalPower,
  calculateUpgradeCost,
  calculateUpgradeGain,
  readClickUpgradeCount,
  readPassiveUpgradeCount,
  roundToTwo,
} from './calculations';
import { CenterSkin, ManualGeneration, RewardBurst } from './types';

function readSelectedSkin(): CenterSkin {
  const savedSkin = readStringCookie(SELECTED_SKIN_COOKIE, 'doge');
  return savedSkin === 'catcoin' || savedSkin === 'mark' ? savedSkin : 'doge';
}

export function useDogeGame() {
  const [currentBalance, setCurrentBalance] = useState(() => readNumberCookie(BALANCE_COOKIE, DEFAULT_BALANCE));
  const [clickUpgradeCount, setClickUpgradeCount] = useState(() => readClickUpgradeCount());
  const [passiveUpgradeCount, setPassiveUpgradeCount] = useState(() => readPassiveUpgradeCount());
  const [sharperClicker2Count, setSharperClicker2Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_2_COUNT_COOKIE, 0))),
  );
  const [miningPup2Count, setMiningPup2Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(MINING_PUP_2_COUNT_COOKIE, readNumberCookie(LEGACY_AUTO_CLICKER_COUNT_COOKIE, 0)))),
  );
  const [sharperClicker3Count, setSharperClicker3Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_3_COUNT_COOKIE, 0))),
  );
  const [miningPup3Count, setMiningPup3Count] = useState(() =>
    Math.max(0, Math.round(readNumberCookie(MINING_PUP_3_COUNT_COOKIE, 0))),
  );
  const [catcoinSkinOwned, setCatcoinSkinOwned] = useState(() => readNumberCookie(CATCOIN_SKIN_OWNED_COOKIE, 0) >= 1);
  const [markSkinOwned, setMarkSkinOwned] = useState(() => readNumberCookie(MARK_SKIN_OWNED_COOKIE, 0) >= 1);
  const [orbitDragUnlocked, setOrbitDragUnlocked] = useState(() => readNumberCookie(ORBIT_DRAG_UNLOCKED_COOKIE, 0) >= 1);
  const [orbitDragEnabled, setOrbitDragEnabled] = useState(() => readNumberCookie(ORBIT_DRAG_ENABLED_COOKIE, 0) >= 1);
  const [centerLogoDragUnlocked, setCenterLogoDragUnlocked] = useState(() =>
    readNumberCookie(CENTER_LOGO_DRAG_UNLOCKED_COOKIE, 0) >= 1,
  );
  const [centerLogoDragEnabled, setCenterLogoDragEnabled] = useState(() =>
    readNumberCookie(CENTER_LOGO_DRAG_ENABLED_COOKIE, 0) >= 1,
  );
  const [selectedSkin, setSelectedSkin] = useState<CenterSkin>(() => readSelectedSkin());
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
    writeNumberCookie(CATCOIN_SKIN_OWNED_COOKIE, catcoinSkinOwned ? 1 : 0);
  }, [catcoinSkinOwned]);

  useEffect(() => {
    writeNumberCookie(MARK_SKIN_OWNED_COOKIE, markSkinOwned ? 1 : 0);
  }, [markSkinOwned]);

  useEffect(() => {
    writeNumberCookie(ORBIT_DRAG_UNLOCKED_COOKIE, orbitDragUnlocked ? 1 : 0);
  }, [orbitDragUnlocked]);

  useEffect(() => {
    writeNumberCookie(ORBIT_DRAG_ENABLED_COOKIE, orbitDragEnabled ? 1 : 0);
  }, [orbitDragEnabled]);

  useEffect(() => {
    writeNumberCookie(CENTER_LOGO_DRAG_UNLOCKED_COOKIE, centerLogoDragUnlocked ? 1 : 0);
  }, [centerLogoDragUnlocked]);

  useEffect(() => {
    writeNumberCookie(CENTER_LOGO_DRAG_ENABLED_COOKIE, centerLogoDragEnabled ? 1 : 0);
  }, [centerLogoDragEnabled]);

  useEffect(() => {
    writeStringCookie(SELECTED_SKIN_COOKIE, selectedSkin);
  }, [selectedSkin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cookieBalance = readNumberCookie(BALANCE_COOKIE, DEFAULT_BALANCE);
      const cookieClickUpgradeCount = readClickUpgradeCount();
      const cookiePassiveUpgradeCount = readPassiveUpgradeCount();
      const cookieSharperClicker2Count = Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_2_COUNT_COOKIE, 0)));
      const cookieMiningPup2Count = Math.max(
        0,
        Math.round(readNumberCookie(MINING_PUP_2_COUNT_COOKIE, readNumberCookie(LEGACY_AUTO_CLICKER_COUNT_COOKIE, 0))),
      );
      const cookieSharperClicker3Count = Math.max(0, Math.round(readNumberCookie(SHARPER_CLICKER_3_COUNT_COOKIE, 0)));
      const cookieMiningPup3Count = Math.max(0, Math.round(readNumberCookie(MINING_PUP_3_COUNT_COOKIE, 0)));
      const cookieCatcoinSkinOwned = readNumberCookie(CATCOIN_SKIN_OWNED_COOKIE, 0) >= 1;
      const cookieMarkSkinOwned = readNumberCookie(MARK_SKIN_OWNED_COOKIE, 0) >= 1;
      const cookieOrbitDragUnlocked = readNumberCookie(ORBIT_DRAG_UNLOCKED_COOKIE, 0) >= 1;
      const cookieOrbitDragEnabled = readNumberCookie(ORBIT_DRAG_ENABLED_COOKIE, 0) >= 1;
      const cookieCenterLogoDragUnlocked = readNumberCookie(CENTER_LOGO_DRAG_UNLOCKED_COOKIE, 0) >= 1;
      const cookieCenterLogoDragEnabled = readNumberCookie(CENTER_LOGO_DRAG_ENABLED_COOKIE, 0) >= 1;
      const cookieSelectedSkin = readSelectedSkin();

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

      if (cookieCatcoinSkinOwned !== catcoinSkinOwned) {
        setCatcoinSkinOwned(cookieCatcoinSkinOwned);
      }

      if (cookieMarkSkinOwned !== markSkinOwned) {
        setMarkSkinOwned(cookieMarkSkinOwned);
      }

      if (cookieOrbitDragUnlocked !== orbitDragUnlocked) {
        setOrbitDragUnlocked(cookieOrbitDragUnlocked);
      }

      if (cookieOrbitDragEnabled !== orbitDragEnabled) {
        setOrbitDragEnabled(cookieOrbitDragEnabled);
      }

      if (cookieCenterLogoDragUnlocked !== centerLogoDragUnlocked) {
        setCenterLogoDragUnlocked(cookieCenterLogoDragUnlocked);
      }

      if (cookieCenterLogoDragEnabled !== centerLogoDragEnabled) {
        setCenterLogoDragEnabled(cookieCenterLogoDragEnabled);
      }

      if (cookieSelectedSkin !== selectedSkin) {
        setSelectedSkin(cookieSelectedSkin);
      }
    }, COOKIE_SYNC_MS);

    return () => window.clearInterval(timer);
  }, [
    catcoinSkinOwned,
    clickUpgradeCount,
    currentBalance,
    centerLogoDragUnlocked,
    centerLogoDragEnabled,
    markSkinOwned,
    miningPup2Count,
    miningPup3Count,
    orbitDragUnlocked,
    orbitDragEnabled,
    passiveUpgradeCount,
    selectedSkin,
    sharperClicker2Count,
    sharperClicker3Count,
  ]);

  useEffect(() => {
    if (totalPassiveDogePerSecond <= 0) {
      return undefined;
    }

    const passiveDogePerTick = totalPassiveDogePerSecond * (PASSIVE_TICK_MS / 1000);

    const timer = window.setInterval(() => {
      setCurrentBalance((balance) => roundToTwo(balance + passiveDogePerTick));
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

  const handleGenerateDogeCoin = (event: MouseEvent<HTMLButtonElement>) => {
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

  const buyCatcoinSkin = () => {
    if (catcoinSkinOwned || currentBalance < CATCOIN_SKIN_COST) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - CATCOIN_SKIN_COST));
    setCatcoinSkinOwned(true);
    setSelectedSkin('catcoin');
  };

  const buyMarkSkin = () => {
    if (markSkinOwned || currentBalance < MARK_SKIN_COST) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - MARK_SKIN_COST));
    setMarkSkinOwned(true);
    setSelectedSkin('mark');
  };

  const buyOrbitDragUnlock = () => {
    if (orbitDragUnlocked || currentBalance < ORBIT_DRAG_COST) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - ORBIT_DRAG_COST));
    setOrbitDragUnlocked(true);
    setOrbitDragEnabled(true);
  };

  const buyCenterLogoDragUnlock = () => {
    if (centerLogoDragUnlocked || !orbitDragUnlocked || currentBalance < CENTER_LOGO_DRAG_COST) {
      return;
    }

    setCurrentBalance((balance) => roundToTwo(balance - CENTER_LOGO_DRAG_COST));
    setCenterLogoDragUnlocked(true);
    setCenterLogoDragEnabled(true);
  };

  const toggleOrbitDragEnabled = () => {
    if (!orbitDragUnlocked) {
      return;
    }

    setOrbitDragEnabled((value) => !value);
  };

  const toggleCenterLogoDragEnabled = () => {
    if (!centerLogoDragUnlocked) {
      return;
    }

    setCenterLogoDragEnabled((value) => !value);
  };

  const equipDefaultSkin = () => setSelectedSkin('doge');

  const equipCatcoinSkin = () => {
    if (catcoinSkinOwned) {
      setSelectedSkin('catcoin');
    }
  };

  const equipMarkSkin = () => {
    if (markSkinOwned) {
      setSelectedSkin('mark');
    }
  };

  return {
    currentBalance,
    clickUpgradeCount,
    passiveUpgradeCount,
    sharperClicker2Count,
    miningPup2Count,
    sharperClicker3Count,
    miningPup3Count,
    catcoinSkinOwned,
    markSkinOwned,
    orbitDragUnlocked,
    orbitDragEnabled,
    centerLogoDragUnlocked,
    centerLogoDragEnabled,
    selectedSkin,
    rewardBursts,
    totalDogePerSecond,
    totalDogePerClick,
    nextClickUpgradeCost,
    nextPassiveUpgradeCost,
    nextClickUpgradeGain,
    nextPassiveUpgradeGain,
    nextSharperClicker2Cost,
    nextSharperClicker2Gain,
    nextMiningPup2Cost,
    nextMiningPup2Gain,
    nextSharperClicker3Cost,
    nextSharperClicker3Gain,
    nextMiningPup3Cost,
    nextMiningPup3Gain,
    sharperClicker2Unlocked,
    miningPup2Unlocked,
    sharperClicker3Unlocked,
    miningPup3Unlocked,
    miningPupMoons,
    miningPup2Moons,
    miningPup3Moons,
    handleGenerateDogeCoin,
    buyClickUpgrade,
    buyPassiveUpgrade,
    buySharperClicker2Upgrade,
    buyMiningPup2Upgrade,
    buySharperClicker3Upgrade,
    buyMiningPup3Upgrade,
    addDeveloperDoge,
    buyCatcoinSkin,
    buyMarkSkin,
    buyOrbitDragUnlock,
    buyCenterLogoDragUnlock,
    toggleOrbitDragEnabled,
    toggleCenterLogoDragEnabled,
    equipDefaultSkin,
    equipCatcoinSkin,
    equipMarkSkin,
  };
}
