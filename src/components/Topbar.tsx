import { View } from '../game/types';

type TopbarProps = {
  activeView: View;
  onViewChange: (view: View) => void;
  onDeveloperReward: () => void;
};

export function Topbar({ activeView, onViewChange, onDeveloperReward }: TopbarProps) {
  return (
    <header className="topbar">
      <h3>Doge Menu</h3>
      <ul>
        <li>
          <button
            type="button"
            className={`menu-button ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`menu-button ${activeView === 'store' ? 'active' : ''}`}
            onClick={() => onViewChange('store')}
          >
            Store
          </button>
        </li>
        <li>
          <button
            type="button"
            className="menu-button developer-button"
            onClick={onDeveloperReward}
          >
            Developer +100000
          </button>
        </li>
      </ul>
    </header>
  );
}
