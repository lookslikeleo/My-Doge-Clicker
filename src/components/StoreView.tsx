import { CATCOIN_SKIN_COST, MARK_SKIN_COST } from '../game/constants';
import { CenterSkin } from '../game/types';

type UpgradeCardProps = {
  name: string;
  cost: number;
  ownedLabel: string;
  note: string;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
};

type StoreViewProps = {
  currentBalance: number;
  clickUpgradeCount: number;
  passiveUpgradeCount: number;
  sharperClicker2Count: number;
  miningPup2Count: number;
  sharperClicker3Count: number;
  miningPup3Count: number;
  catcoinSkinOwned: boolean;
  markSkinOwned: boolean;
  selectedSkin: CenterSkin;
  nextClickUpgradeCost: number;
  nextPassiveUpgradeCost: number;
  nextClickUpgradeGain: number;
  nextPassiveUpgradeGain: number;
  nextSharperClicker2Cost: number;
  nextSharperClicker2Gain: number;
  nextMiningPup2Cost: number;
  nextMiningPup2Gain: number;
  nextSharperClicker3Cost: number;
  nextSharperClicker3Gain: number;
  nextMiningPup3Cost: number;
  nextMiningPup3Gain: number;
  sharperClicker2Unlocked: boolean;
  miningPup2Unlocked: boolean;
  sharperClicker3Unlocked: boolean;
  miningPup3Unlocked: boolean;
  onBuyClickUpgrade: () => void;
  onBuyPassiveUpgrade: () => void;
  onBuySharperClicker2Upgrade: () => void;
  onBuyMiningPup2Upgrade: () => void;
  onBuySharperClicker3Upgrade: () => void;
  onBuyMiningPup3Upgrade: () => void;
  onEquipDefaultSkin: () => void;
  onBuyCatcoinSkin: () => void;
  onEquipCatcoinSkin: () => void;
  onBuyMarkSkin: () => void;
  onEquipMarkSkin: () => void;
};

function UpgradeCard({
  name,
  cost,
  ownedLabel,
  note,
  buttonLabel,
  onClick,
  disabled,
}: UpgradeCardProps) {
  return (
    <article className="upgrade-card">
      <p className="upgrade-name">{name}</p>
      <p className="upgrade-cost">Cost: {cost.toFixed(2)} DOGE</p>
      <p className="upgrade-owned">{ownedLabel}</p>
      <p className="upgrade-note">{note}</p>
      <button type="button" className="store-button" onClick={onClick} disabled={disabled}>
        {buttonLabel}
      </button>
    </article>
  );
}

export function StoreView({
  currentBalance,
  clickUpgradeCount,
  passiveUpgradeCount,
  sharperClicker2Count,
  miningPup2Count,
  sharperClicker3Count,
  miningPup3Count,
  catcoinSkinOwned,
  markSkinOwned,
  selectedSkin,
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
  onBuyClickUpgrade,
  onBuyPassiveUpgrade,
  onBuySharperClicker2Upgrade,
  onBuyMiningPup2Upgrade,
  onBuySharperClicker3Upgrade,
  onBuyMiningPup3Upgrade,
  onEquipDefaultSkin,
  onBuyCatcoinSkin,
  onEquipCatcoinSkin,
  onBuyMarkSkin,
  onEquipMarkSkin,
}: StoreViewProps) {
  return (
    <section className="store-card">
      <p className="store-label">Doge Store</p>
      <h1 className="store-title">Upgrade your generator</h1>

      <section className="store-section">
        <h2 className="store-section-title">Upgrades</h2>
        <div className="upgrade-grid">
          <UpgradeCard
            name="Sharper Clicker"
            cost={nextClickUpgradeCost}
            ownedLabel={`Owned: ${clickUpgradeCount}`}
            note={`Next bonus: +${nextClickUpgradeGain.toFixed(2)} DOGE/click`}
            buttonLabel="Buy Click Upgrade"
            onClick={onBuyClickUpgrade}
            disabled={currentBalance < nextClickUpgradeCost}
          />
          <UpgradeCard
            name="Mining Pup"
            cost={nextPassiveUpgradeCost}
            ownedLabel={`Owned: ${passiveUpgradeCount}`}
            note={`Next bonus: +${nextPassiveUpgradeGain.toFixed(2)} DOGE/sec`}
            buttonLabel="Buy Passive Upgrade"
            onClick={onBuyPassiveUpgrade}
            disabled={currentBalance < nextPassiveUpgradeCost}
          />
          {sharperClicker2Unlocked ? (
            <UpgradeCard
              name="Sharper Clicker 2"
              cost={nextSharperClicker2Cost}
              ownedLabel={`Owned: ${sharperClicker2Count}`}
              note={`Next bonus: +${nextSharperClicker2Gain.toFixed(2)} DOGE/click`}
              buttonLabel="Buy Sharper Clicker 2"
              onClick={onBuySharperClicker2Upgrade}
              disabled={currentBalance < nextSharperClicker2Cost}
            />
          ) : null}
          {miningPup2Unlocked ? (
            <UpgradeCard
              name="Mining Pup 2"
              cost={nextMiningPup2Cost}
              ownedLabel={`Owned: ${miningPup2Count}`}
              note={`Next bonus: +${nextMiningPup2Gain.toFixed(2)} DOGE/sec`}
              buttonLabel="Buy Mining Pup 2"
              onClick={onBuyMiningPup2Upgrade}
              disabled={currentBalance < nextMiningPup2Cost}
            />
          ) : null}
          {sharperClicker3Unlocked ? (
            <UpgradeCard
              name="Sharper Clicker 3"
              cost={nextSharperClicker3Cost}
              ownedLabel={`Owned: ${sharperClicker3Count}`}
              note={`Next bonus: +${nextSharperClicker3Gain.toFixed(2)} DOGE/click`}
              buttonLabel="Buy Sharper Clicker 3"
              onClick={onBuySharperClicker3Upgrade}
              disabled={currentBalance < nextSharperClicker3Cost}
            />
          ) : null}
          {miningPup3Unlocked ? (
            <UpgradeCard
              name="Mining Pup 3"
              cost={nextMiningPup3Cost}
              ownedLabel={`Owned: ${miningPup3Count}`}
              note={`Next bonus: +${nextMiningPup3Gain.toFixed(2)} DOGE/sec`}
              buttonLabel="Buy Mining Pup 3"
              onClick={onBuyMiningPup3Upgrade}
              disabled={currentBalance < nextMiningPup3Cost}
            />
          ) : null}
        </div>
      </section>

      <section className="store-section">
        <h2 className="store-section-title">Skins</h2>
        <div className="upgrade-grid">
          <UpgradeCard
            name="Default Doge Skin"
            cost={0}
            ownedLabel={`Status: ${selectedSkin === 'doge' ? 'Equipped' : 'Owned'}`}
            note="Use the original spinning Doge logo in the center."
            buttonLabel={selectedSkin === 'doge' ? 'Equipped' : 'Equip Doge Skin'}
            onClick={onEquipDefaultSkin}
            disabled={selectedSkin === 'doge'}
          />
          <UpgradeCard
            name="CatCoin Skin"
            cost={CATCOIN_SKIN_COST}
            ownedLabel={`Status: ${catcoinSkinOwned ? (selectedSkin === 'catcoin' ? 'Equipped' : 'Owned') : 'Locked'}`}
            note="Replace the center spinner with the CatCoin image."
            buttonLabel={catcoinSkinOwned ? (selectedSkin === 'catcoin' ? 'Equipped' : 'Equip CatCoin Skin') : 'Buy CatCoin Skin'}
            onClick={catcoinSkinOwned ? onEquipCatcoinSkin : onBuyCatcoinSkin}
            disabled={catcoinSkinOwned ? selectedSkin === 'catcoin' : currentBalance < CATCOIN_SKIN_COST}
          />
          <UpgradeCard
            name="Mark Skin"
            cost={MARK_SKIN_COST}
            ownedLabel={`Status: ${markSkinOwned ? (selectedSkin === 'mark' ? 'Equipped' : 'Owned') : 'Locked'}`}
            note="Replace the center spinner with the Mark image."
            buttonLabel={markSkinOwned ? (selectedSkin === 'mark' ? 'Equipped' : 'Equip Mark Skin') : 'Buy Mark Skin'}
            onClick={markSkinOwned ? onEquipMarkSkin : onBuyMarkSkin}
            disabled={markSkinOwned ? selectedSkin === 'mark' : currentBalance < MARK_SKIN_COST}
          />
        </div>
      </section>
    </section>
  );
}
