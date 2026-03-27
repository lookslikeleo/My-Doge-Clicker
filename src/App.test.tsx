import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.useFakeTimers();
  document.cookie = 'doge_balance=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_per_click=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_per_second=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_click_upgrade_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_passive_upgrade_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_sharper_clicker_2_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_mining_pup_2_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_sharper_clicker_3_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_mining_pup_3_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_catcoin_skin_owned=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_mark_skin_owned=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_selected_skin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_auto_clicker_count=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('shows dashboard metrics and no search bar', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /dogecoin generator/i })).toBeInTheDocument();
  expect(screen.getByText(/current balance/i)).toBeInTheDocument();
  expect(screen.getByText(/doge per second/i)).toBeInTheDocument();
  expect(screen.getByText(/doge per click/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /generate dogecoin/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^0 doge$/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /0\.00 doge\/sec/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /1\.00 doge\/click/i })).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/search doge/i)).not.toBeInTheDocument();
});

test('opens store area with the base upgrade options', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByRole('heading', { name: /upgrade your generator/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^upgrades$/i, level: 2 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^skins$/i, level: 2 })).toBeInTheDocument();
  expect(screen.getByText(/sharper clicker/i)).toBeInTheDocument();
  expect(screen.getByText(/mining pup/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 100\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 250\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/^CatCoin Skin$/i)).toBeInTheDocument();
  expect(screen.getByText(/^Mark Skin$/i)).toBeInTheDocument();
  expect(screen.getAllByText(/owned: 0/i)).toHaveLength(2);
  expect(screen.queryByText(/sharper clicker 2/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/mining pup 2/i)).not.toBeInTheDocument();
});

test('buying the catcoin skin equips a new center icon', () => {
  document.cookie = 'doge_balance=10000';

  const { container } = render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy catcoin skin/i }));

  expect(screen.getByText(/status: equipped/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  const centerLogo = container.querySelector('.center-logo');
  expect(centerLogo).toHaveAttribute('src', expect.stringContaining('catcoin.png'));
  expect(screen.getByRole('heading', { name: /5,000 doge/i })).toBeInTheDocument();
});

test('buying the mark skin equips a new center icon', () => {
  document.cookie = 'doge_balance=200000';

  const { container } = render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy mark skin/i }));

  expect(screen.getAllByText(/status: equipped/i)).toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  const centerLogo = container.querySelector('.center-logo');
  expect(centerLogo).toHaveAttribute('src', expect.stringContaining('mark.png'));
  expect(screen.getByRole('heading', { name: /100,000 doge/i })).toBeInTheDocument();
});

test('buying the click upgrade increases doge earned per click', () => {
  document.cookie = 'doge_balance=200';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy click upgrade/i }));

  expect(screen.getByText(/owned: 1/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 125\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+1\.10 doge\/click/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));
  fireEvent.click(screen.getByRole('button', { name: /generate dogecoin/i }), {
    clientX: 240,
    clientY: 360,
  });

  expect(screen.getByText(/\+2\.00 doge/i)).toHaveStyle({
    left: '240px',
    top: '360px',
  });
  expect(screen.getByRole('heading', { name: /102 doge/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /2\.00 doge\/click/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /2\.00 doge\/sec/i })).toBeInTheDocument();
});

test('buying the passive upgrade increases doge per second and adds passive balance', () => {
  document.cookie = 'doge_balance=300';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy passive upgrade/i }));

  expect(screen.getByText(/owned: 1/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 312\.50 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+1\.10 doge\/sec/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  expect(screen.getByRole('heading', { name: /1\.00 doge\/sec/i })).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(screen.getByRole('heading', { name: /51 doge/i })).toBeInTheDocument();
});

test('manual clicking refreshes doge per second immediately', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /generate dogecoin/i }), {
    clientX: 120,
    clientY: 200,
  });

  expect(screen.getByRole('heading', { name: /1\.00 doge\/sec/i })).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1200);
  });

  expect(screen.getByRole('heading', { name: /0\.00 doge\/sec/i })).toBeInTheDocument();
});

test('developer button adds 100000 doge to the balance', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /developer \+100000/i }));

  expect(screen.getByRole('heading', { name: /100,000 doge/i })).toBeInTheDocument();
});

test('deleting cookies while the app is open resets the current balance', () => {
  document.cookie = 'doge_balance=1000';

  render(<App />);

  expect(screen.getByRole('heading', { name: /1,000 doge/i })).toBeInTheDocument();

  document.cookie = 'doge_balance=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

  act(() => {
    jest.advanceTimersByTime(600);
  });

  expect(screen.getByRole('heading', { name: /^0 doge$/i })).toBeInTheDocument();
});

test('loads balance and upgrade stats from browser cookies', () => {
  document.cookie = 'doge_balance=777';
  document.cookie = 'doge_click_upgrade_count=2';
  document.cookie = 'doge_passive_upgrade_count=2';
  document.cookie = 'doge_sharper_clicker_2_count=1';
  document.cookie = 'doge_mining_pup_2_count=1';
  document.cookie = 'doge_sharper_clicker_3_count=1';
  document.cookie = 'doge_mining_pup_3_count=1';

  render(<App />);

  expect(screen.getByRole('heading', { name: /777 doge/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /6\.29 doge\/click/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /4\.26 doge\/sec/i })).toBeInTheDocument();
});

test('owned mining pups render orbiting doge moons around the main logo', () => {
  document.cookie = 'doge_passive_upgrade_count=3';

  const { container } = render(<App />);

  expect(container.querySelectorAll('.moon-orbit')).toHaveLength(3);
});

test('owned mining pup 2 upgrades render orbiting ethereum moons around the main logo', () => {
  document.cookie = 'doge_passive_upgrade_count=10';
  document.cookie = 'doge_mining_pup_2_count=2';

  const { container } = render(<App />);

  expect(container.querySelectorAll('.moon-orbit-tier-two')).toHaveLength(2);
});

test('owned mining pup 3 upgrades render orbiting bitcoin moons around the main logo', () => {
  document.cookie = 'doge_passive_upgrade_count=10';
  document.cookie = 'doge_mining_pup_2_count=10';
  document.cookie = 'doge_mining_pup_3_count=2';

  const { container } = render(<App />);

  expect(container.querySelectorAll('.moon-orbit-tier-three')).toHaveLength(2);
});

test('sharper clicker 2 unlocks after owning 10 sharper clickers', () => {
  document.cookie = 'doge_balance=2000';
  document.cookie = 'doge_click_upgrade_count=10';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByText(/^Sharper Clicker 2$/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 1000\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+5\.93 doge\/click/i)).toBeInTheDocument();
  expect(screen.queryByText(/^Mining Pup 2$/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /buy sharper clicker 2/i }));
  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  expect(screen.getByRole('heading', { name: /22\.86 doge\/click/i })).toBeInTheDocument();
});

test('mining pup 2 unlocks only after owning 10 mining pups', () => {
  document.cookie = 'doge_balance=5000';
  document.cookie = 'doge_passive_upgrade_count=10';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByText(/^Mining Pup 2$/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+5\.58 doge\/sec/i)).toBeInTheDocument();
  expect(screen.queryByText(/^Sharper Clicker 2$/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /buy mining pup 2/i }));
  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  expect(screen.getByRole('heading', { name: /21\.51 doge\/sec/i })).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(screen.getByRole('heading', { name: /4,021\.51 doge/i })).toBeInTheDocument();
});

test('sharper clicker 3 unlocks after owning 10 sharper clicker 2 upgrades', () => {
  document.cookie = 'doge_balance=50000';
  document.cookie = 'doge_click_upgrade_count=10';
  document.cookie = 'doge_sharper_clicker_2_count=10';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByText(/^Sharper Clicker 3$/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 10000\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+38\.10 doge\/click/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /buy sharper clicker 3/i }));
  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  expect(screen.getByRole('heading', { name: /114\.29 doge\/click/i })).toBeInTheDocument();
});

test('mining pup 3 unlocks after owning 10 mining pup 2 upgrades', () => {
  document.cookie = 'doge_balance=50000';
  document.cookie = 'doge_passive_upgrade_count=10';
  document.cookie = 'doge_mining_pup_2_count=10';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByText(/^Mining Pup 3$/i)).toBeInTheDocument();
  expect(screen.getByText(/cost: 10000\.00 doge/i)).toBeInTheDocument();
  expect(screen.getByText(/next bonus: \+35\.85 doge\/sec/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /buy mining pup 3/i }));
  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));

  expect(screen.getByRole('heading', { name: /107\.54 doge\/sec/i })).toBeInTheDocument();
});
