import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current screen width is considered mobile.
 * @param mobileBreakpoint The maximum width (in pixels) for a device to be considered mobile. Defaults to 768px.
 * @returns A boolean indicating whether the device is mobile.
 */
export function useIsMobile(mobileBreakpoint: number = MOBILE_BREAKPOINT): boolean {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // Define the media query based on the provided breakpoint
        const mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

        // Handler function to update the state when the media query changes
        const handleChange = () => {
            setIsMobile(mediaQuery.matches);
        };

        // Add event listener for changes in the media query
        mediaQuery.addEventListener('change', handleChange);

        // Set initial state based on the current media query match
        setIsMobile(mediaQuery.matches);

        // Cleanup function to remove the event listener on unmount
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [mobileBreakpoint]); // Re-run effect if the breakpoint changes

    // Return the boolean value, ensuring it's always a boolean (e.g., handling initial undefined state)
    return !!isMobile;
}
