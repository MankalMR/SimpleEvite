/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InlineError } from './inline-error';

describe('InlineError Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('does not render when error is null', () => {
    const { container } = render(<InlineError error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the error message when provided', () => {
    render(<InlineError error="Test error message" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders the dismiss button if onDismiss is provided', () => {
    const handleDismiss = jest.fn();
    render(<InlineError error="Test error message" onDismiss={handleDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /close error message/i });
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the specified timeout', () => {
    const handleDismiss = jest.fn();
    render(<InlineError error="Test error message" onDismiss={handleDismiss} autoDismissMs={8000} />);

    expect(handleDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('cleans up the timer on unmount', () => {
    const handleDismiss = jest.fn();
    const { unmount } = render(<InlineError error="Test error message" onDismiss={handleDismiss} autoDismissMs={8000} />);

    unmount();

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    expect(handleDismiss).not.toHaveBeenCalled();
  });
});
