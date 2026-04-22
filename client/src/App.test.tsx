import { render, screen } from '@testing-library/react';
import { expect, test } from '@jest/globals';
import { App } from './src/App';

test('renders app', () => {
  render(<App />);
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});