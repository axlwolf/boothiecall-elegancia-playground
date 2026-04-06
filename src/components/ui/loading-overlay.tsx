import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
    isLoading: boolean;
    message?: string;
    fullScreen?: boolean;
}

export const LoadingOverlay = ({
    isLoading,
    message,
    fullScreen = false,
    className,
    ...props
}: LoadingOverlayProps) => {
    if (!isLoading) return null;

    return (
        <div
            className={cn(
                'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200 animate-in fade-in',
                fullScreen && 'fixed',
                className
            )}
            {...props}
        >
            <LoadingSpinner size="lg" className="mb-4" />
            {message && (
                <p className="text-lg font-medium text-muted-foreground animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};
