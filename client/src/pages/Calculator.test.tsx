import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Calculator from './Calculator';

describe('Calculator Component', () => {
  it('renders the calculator form elements', () => {
    render(<Calculator />);
    expect(screen.getByText(/Carbon Calculator/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /Transport/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Home Energy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diet/i })).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(<Calculator />);
    
    const energyTab = screen.getByRole('button', { name: /Home Energy/i });
    fireEvent.click(energyTab);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Electricity Usage \(kWh\)/i)).toBeInTheDocument();
    });

    const dietTab = screen.getByRole('button', { name: /Diet/i });
    fireEvent.click(dietTab);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Number of High-Meat Meals/i)).toBeInTheDocument();
    });
  });

  it('submits correctly', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Calculator />);
    
    fireEvent.click(screen.getByRole('button', { name: /Transport/i }));
    
    const input = await screen.findByLabelText(/Distance \(km\)/i);
    fireEvent.change(input, { target: { value: '20' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Log Activity/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Activity logged successfully! (Mock)');
    }, { timeout: 2000 });
  });
});
