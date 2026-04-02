import catcoinLogo from '../assets/images/catcoin.png';
import bitcoinLogo from '../assets/images/bitcoin.png';
import etheruemLogo from '../assets/images/etheruem.png';
import logo from '../assets/images/logo.svg';
import markLogo from '../assets/images/mark.png';
import { CATCOIN_SKIN_COST, MARK_SKIN_COST } from '../game/constants';
import { CenterSkin } from '../game/types';

type UpgradeCardProps = {
  name: string;
  cost: number;
  ownedLabel: string;
  note: string;
  onClick: () => void;
  disabled: boolean;
  iconSrc?: string;
  iconAlt?: string;
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
  onClick,
  disabled,
  iconSrc,
  iconAlt,
}: UpgradeCardProps) {
  return (
    <button
      type="button"
      className="upgrade-card"
      onClick={onClick}
      disabled={disabled}
      aria-label={name}
    >
      <div className="upgrade-header">
        <p className="upgrade-name">{name}</p>
        {iconSrc ? <img className="upgrade-icon" src={iconSrc} alt={iconAlt ?? ''} /> : null}
      </div>
      <p className="upgrade-cost">Cost: {cost.toFixed(2)} DOGE</p>
      <p className="upgrade-owned">{ownedLabel}</p>
      <p className="upgrade-note">{note}</p>
    </button>
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
            name="Turbo Paw"
            cost={nextClickUpgradeCost}
            ownedLabel={`Owned: ${clickUpgradeCount}`}
            note={`Next bonus: +${nextClickUpgradeGain.toFixed(2)} DOGE/click`}
            onClick={onBuyClickUpgrade}
            disabled={currentBalance < nextClickUpgradeCost}
            iconSrc="https://upload.wikimedia.org/wikipedia/commons/c/c0/Dog_Paw_Print.png"
            iconAlt="Dog paw print"
          />
          <UpgradeCard
            name="Doge Den"
            cost={nextPassiveUpgradeCost}
            ownedLabel={`Owned: ${passiveUpgradeCount}`}
            note={`Next bonus: +${nextPassiveUpgradeGain.toFixed(2)} DOGE/sec`}
            onClick={onBuyPassiveUpgrade}
            disabled={currentBalance < nextPassiveUpgradeCost}
            iconSrc={logo}
            iconAlt="Doge logo"
          />
          {sharperClicker2Unlocked ? (
            <UpgradeCard
              name="Bark Booster"
              cost={nextSharperClicker2Cost}
              ownedLabel={`Owned: ${sharperClicker2Count}`}
              note={`Next bonus: +${nextSharperClicker2Gain.toFixed(2)} DOGE/click`}
              onClick={onBuySharperClicker2Upgrade}
              disabled={currentBalance < nextSharperClicker2Cost}
              iconSrc="https://cdn-icons-png.flaticon.com/512/5869/5869167.png"
              iconAlt="Bark icon"
            />
          ) : null}
          {miningPup2Unlocked ? (
            <UpgradeCard
              name="Kennel Crew"
              cost={nextMiningPup2Cost}
              ownedLabel={`Owned: ${miningPup2Count}`}
              note={`Next bonus: +${nextMiningPup2Gain.toFixed(2)} DOGE/sec`}
              onClick={onBuyMiningPup2Upgrade}
              disabled={currentBalance < nextMiningPup2Cost}
              iconSrc={etheruemLogo}
              iconAlt="Ethereum icon"
            />
          ) : null}
          {sharperClicker3Unlocked ? (
            <UpgradeCard
              name="Zoomies Engine"
              cost={nextSharperClicker3Cost}
              ownedLabel={`Owned: ${sharperClicker3Count}`}
              note={`Next bonus: +${nextSharperClicker3Gain.toFixed(2)} DOGE/click`}
              onClick={onBuySharperClicker3Upgrade}
              disabled={currentBalance < nextSharperClicker3Cost}
              iconSrc="https://cdn-icons-png.flaticon.com/512/91/91531.png"
              iconAlt="Running dog icon"
            />
          ) : null}
          {miningPup3Unlocked ? (
            <UpgradeCard
              name="Moonpack Alpha"
              cost={nextMiningPup3Cost}
              ownedLabel={`Owned: ${miningPup3Count}`}
              note={`Next bonus: +${nextMiningPup3Gain.toFixed(2)} DOGE/sec`}
              onClick={onBuyMiningPup3Upgrade}
              disabled={currentBalance < nextMiningPup3Cost}
              iconSrc={bitcoinLogo}
              iconAlt="Bitcoin icon"
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
            onClick={onEquipDefaultSkin}
            disabled={selectedSkin === 'doge'}
            iconSrc={logo}
            iconAlt="Doge skin preview"
          />
          <UpgradeCard
            name="CatCoin Skin"
            cost={CATCOIN_SKIN_COST}
            ownedLabel={`Status: ${catcoinSkinOwned ? (selectedSkin === 'catcoin' ? 'Equipped' : 'Owned') : 'Locked'}`}
            note="Replace the center spinner with the CatCoin image."
            onClick={catcoinSkinOwned ? onEquipCatcoinSkin : onBuyCatcoinSkin}
            disabled={catcoinSkinOwned ? selectedSkin === 'catcoin' : currentBalance < CATCOIN_SKIN_COST}
            iconSrc={catcoinLogo}
            iconAlt="CatCoin skin preview"
          />
          <UpgradeCard
            name="Mark Skin"
            cost={MARK_SKIN_COST}
            ownedLabel={`Status: ${markSkinOwned ? (selectedSkin === 'mark' ? 'Equipped' : 'Owned') : 'Locked'}`}
            note="Replace the center spinner with the Mark image."
            onClick={markSkinOwned ? onEquipMarkSkin : onBuyMarkSkin}
            disabled={markSkinOwned ? selectedSkin === 'mark' : currentBalance < MARK_SKIN_COST}
            iconSrc={markLogo}
            iconAlt="Mark skin preview"
          />
        </div>
      </section>
    </section>
  );
}
