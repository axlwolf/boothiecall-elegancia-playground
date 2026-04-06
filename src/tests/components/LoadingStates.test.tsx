import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { LoadingOverlay } from '../../components/ui/loading-overlay';

describe('LoadingSpinner', () => {
    it('renders correctly', () => {
        render(<LoadingSpinner data-testid="spinner" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toBeInTheDocument();
    });

    it('applies custom class names', () => {
        render(<LoadingSpinner data-testid="spinner" className="custom-class" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner).toHaveClass('custom-class');
    });
});

describe('LoadingOverlay', () => {
    it('does not render when isLoading is false', () => {
        render(<LoadingOverlay isLoading={false} data-testid="overlay" />);
        const overlay = screen.queryByTestId('overlay');
        expect(overlay).not.toBeInTheDocument();
    });

    it('renders when isLoading is true', () => {
        render(<LoadingOverlay isLoading={true} data-testid="overlay" />);
        const overlay = screen.getByTestId('overlay');
        expect(overlay).toBeInTheDocument();
    });

    it('displays the message when provided', () => {
        const message = 'Please wait...';
        render(<LoadingOverlay isLoading={true} message={message} />);
        expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('applies fullScreen class when fullScreen prop is true', () => {
        render(<LoadingOverlay isLoading={true} fullScreen={true} data-testid="overlay" />);
        const overlay = screen.getByTestId('overlay');
        expect(overlay).toHaveClass('fixed');
        expect(overlay).toHaveClass('inset-0');
    });
});
