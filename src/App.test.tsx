import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.useFakeTimers();
  document.cookie = 'doge_balance=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_per_click=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'doge_per_second=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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
  expect(screen.getByRole('heading', { name: /^0 doge$/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /0\.00 doge\/sec/i })).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/search doge/i)).not.toBeInTheDocument();
});

test('opens store area with two upgrade options', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));

  expect(screen.getByRole('heading', { name: /upgrade your generator/i })).toBeInTheDocument();
  expect(screen.getByText(/sharper clicker/i)).toBeInTheDocument();
  expect(screen.getByText(/mining pup/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /buy click upgrade/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /buy passive upgrade/i })).toBeInTheDocument();
});

test('buying the click upgrade increases doge earned per click', () => {
  document.cookie = 'doge_balance=200';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy click upgrade/i }));
  fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));
  fireEvent.click(screen.getByRole('button', { name: /generate dogecoin/i }), {
    clientX: 240,
    clientY: 360,
  });

  expect(screen.getByText(/\+2 doge/i)).toHaveStyle({
    left: '240px',
    top: '360px',
  });
  expect(screen.getByRole('heading', { name: /102 doge/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /2 doge\/click/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /2\.00 doge\/sec/i })).toBeInTheDocument();
});

test('buying the passive upgrade increases doge per second and adds passive balance', () => {
  document.cookie = 'doge_balance=300';

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /store/i }));
  fireEvent.click(screen.getByRole('button', { name: /buy passive upgrade/i }));
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

test('loads balance and upgrade stats from browser cookies', () => {
  document.cookie = 'doge_balance=777';
  document.cookie = 'doge_per_click=3';
  document.cookie = 'doge_per_second=2';

  render(<App />);

  expect(screen.getByRole('heading', { name: /777 doge/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /3 doge\/click/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /2\.00 doge\/sec/i })).toBeInTheDocument();
});
