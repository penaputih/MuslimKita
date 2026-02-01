"use client";

import { useEffect } from 'react';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Only run on native platforms (Android/iOS)
        if (Capacitor.getPlatform() === 'web') return;

        const trackScreen = async () => {
            try {
                await FirebaseAnalytics.setCurrentScreen({
                    screenName: pathname || 'home',
                    screenClassOverride: pathname || 'home',
                });
            } catch (e) {
                console.error('Analytics error:', e);
            }
        };

        trackScreen();
    }, [pathname]);

    return null;
}
