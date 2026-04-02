import { View } from '../game/types';

type TopbarProps = {
  activeView: View;
  onViewChange: (view: View) => void;
};

export function Topbar({ activeView, onViewChange }: TopbarProps) {
  return (
    <header className="topbar">
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
      </ul>
    </header>
  );
}
