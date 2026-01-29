import { useEffect, useState } from "react";

declare global {
    interface Window {
        snap: any;
    }
}

const useSnap = () => {
    const [snap, setSnap] = useState<any>(null);

    useEffect(() => {
        const midtransScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";

        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

        const scriptId = "midtrans-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement("script");
            script.src = midtransScriptUrl;
            script.id = scriptId;
            script.setAttribute("data-client-key", clientKey);
            script.onload = () => {
                setSnap(window.snap);
            };
            document.body.appendChild(script);
        } else {
            setSnap(window.snap);
        }

        return () => {
            // Cleanup if necessary
        }
    }, []);

    const snapPay = (token: string, callbacks: { onSuccess?: (result: any) => void, onPending?: (result: any) => void, onError?: (result: any) => void, onClose?: () => void }) => {
        if (window.snap) {
            window.snap.pay(token, {
                onSuccess: (result: any) => {
                    callbacks.onSuccess?.(result);
                },
                onPending: (result: any) => {
                    callbacks.onPending?.(result);
                },
                onError: (result: any) => {
                    callbacks.onError?.(result);
                },
                onClose: () => {
                    callbacks.onClose?.();
                }
            });
        }
    };

    return { snapPay };
};

export default useSnap;
