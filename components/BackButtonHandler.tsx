"use client";

import { useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { useRouter, usePathname } from "next/navigation";

const BackButtonHandler = () => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const backButtonListener = CapacitorApp.addListener('backButton', (data) => {
            if (pathname === '/' || pathname === '/home' || pathname === '/login') {
                CapacitorApp.exitApp();
            } else {
                router.back();
            }
        });

        return () => {
            backButtonListener.then(f => f.remove());
        };
    }, [pathname, router]);

    return null;
};

export default BackButtonHandler;
