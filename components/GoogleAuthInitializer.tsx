"use client";

import { useEffect } from "react";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

export function GoogleAuthInitializer() {
    useEffect(() => {
        // alert(`Initializer running. Native? ${Capacitor.isNativePlatform()}`);
        if (Capacitor.isNativePlatform()) {
            // alert('Calling GoogleAuth.initialize()');
            GoogleAuth.initialize();
        }
    }, []);

    return null;
}
