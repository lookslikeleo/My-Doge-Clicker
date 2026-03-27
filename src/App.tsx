import { useState } from 'react';
import './App.css';
import { DashboardView } from './components/DashboardView';
import { StoreView } from './components/StoreView';
import { Topbar } from './components/Topbar';
import { useDogeGame } from './game/useDogeGame';
import { View } from './game/types';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const game = useDogeGame();

  return (
    <div className="layout">
      <Topbar
        activeView={activeView}
        onViewChange={setActiveView}
        onDeveloperReward={game.addDeveloperDoge}
      />

      <main className="main">
        {activeView === 'dashboard' ? (
          <DashboardView
            selectedSkin={game.selectedSkin}
            currentBalance={game.currentBalance}
            totalDogePerSecond={game.totalDogePerSecond}
            totalDogePerClick={game.totalDogePerClick}
            miningPupMoons={game.miningPupMoons}
            miningPup2Moons={game.miningPup2Moons}
            miningPup3Moons={game.miningPup3Moons}
            rewardBursts={game.rewardBursts}
            onGenerate={game.handleGenerateDogeCoin}
          />
        ) : (
          <StoreView
            currentBalance={game.currentBalance}
            clickUpgradeCount={game.clickUpgradeCount}
            passiveUpgradeCount={game.passiveUpgradeCount}
            sharperClicker2Count={game.sharperClicker2Count}
            miningPup2Count={game.miningPup2Count}
            sharperClicker3Count={game.sharperClicker3Count}
            miningPup3Count={game.miningPup3Count}
            catcoinSkinOwned={game.catcoinSkinOwned}
            markSkinOwned={game.markSkinOwned}
            selectedSkin={game.selectedSkin}
            nextClickUpgradeCost={game.nextClickUpgradeCost}
            nextPassiveUpgradeCost={game.nextPassiveUpgradeCost}
            nextClickUpgradeGain={game.nextClickUpgradeGain}
            nextPassiveUpgradeGain={game.nextPassiveUpgradeGain}
            nextSharperClicker2Cost={game.nextSharperClicker2Cost}
            nextSharperClicker2Gain={game.nextSharperClicker2Gain}
            nextMiningPup2Cost={game.nextMiningPup2Cost}
            nextMiningPup2Gain={game.nextMiningPup2Gain}
            nextSharperClicker3Cost={game.nextSharperClicker3Cost}
            nextSharperClicker3Gain={game.nextSharperClicker3Gain}
            nextMiningPup3Cost={game.nextMiningPup3Cost}
            nextMiningPup3Gain={game.nextMiningPup3Gain}
            sharperClicker2Unlocked={game.sharperClicker2Unlocked}
            miningPup2Unlocked={game.miningPup2Unlocked}
            sharperClicker3Unlocked={game.sharperClicker3Unlocked}
            miningPup3Unlocked={game.miningPup3Unlocked}
            onBuyClickUpgrade={game.buyClickUpgrade}
            onBuyPassiveUpgrade={game.buyPassiveUpgrade}
            onBuySharperClicker2Upgrade={game.buySharperClicker2Upgrade}
            onBuyMiningPup2Upgrade={game.buyMiningPup2Upgrade}
            onBuySharperClicker3Upgrade={game.buySharperClicker3Upgrade}
            onBuyMiningPup3Upgrade={game.buyMiningPup3Upgrade}
            onEquipDefaultSkin={game.equipDefaultSkin}
            onBuyCatcoinSkin={game.buyCatcoinSkin}
            onEquipCatcoinSkin={game.equipCatcoinSkin}
            onBuyMarkSkin={game.buyMarkSkin}
            onEquipMarkSkin={game.equipMarkSkin}
          />
        )}
      </main>
    </div>
  );
}

export default App;
