import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from './Dashboard';
import '@testing-library/jest-dom';

describe('Dashboard Component', () => {
  it('renders the Dashboard header perfectly', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
  });

  it('renders the EcoScore widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Sustainability/i)).toBeInTheDocument();
    expect(screen.getByText(/EcoScore/i)).toBeInTheDocument();
  });

  it('displays the AI Recommendations section properly', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Personalized Recommendations/i)).toBeInTheDocument();
  });
});
