"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { verifyCode, resendCode } from "./actions";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

    const [isPending, startTransition] = useTransition();
    const [resendPending, startResend] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    // Auto verify if link is clicked
    const [hasAttemptedAutoVerify, setHasAttemptedAutoVerify] = useState(false);

    useEffect(() => {
        if (!hasAttemptedAutoVerify && email && searchParams.get("code") && searchParams.get("auto") === "true") {
            setHasAttemptedAutoVerify(true);
            const code = searchParams.get("code") as string;
            startTransition(async () => {
                const result = await verifyCode(email, code);
                if (result.error) {
                    setError(result.error);
                } else {
                    router.push("/?verified=true");
                }
            });
        }
    }, [email, searchParams, router, hasAttemptedAutoVerify]);

    // Countdown effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = () => {
        setMessage(null);
        setError(null);
        if (!email) return;

        startResend(async () => {
            const result = await resendCode(email);
            if (result.error) {
                setError(result.error);
            } else {
                setMessage("Link verifikasi baru telah dikirim ke email Anda.");
                setCountdown(60); // 60 seconds cooldown
            }
        });
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-destructive">Email tidak valid.</p>
                        <Button variant="link" onClick={() => router.push("/login")}>Kembali ke Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm border-none shadow-lg">
                <CardHeader className="space-y-4 flex flex-col items-center">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <MailCheck className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-primary">Cek Email Anda</CardTitle>
                        <CardDescription className="text-center max-w-[280px] mx-auto">
                            Link verifikasi telah dikirim ke <strong>{email}</strong>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-balance text-muted-foreground">
                        Silahkan klik link yang ada di email untuk memverifikasi akun Anda. Link akan kadaluarsa dalam 30 menit.
                    </p>

                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-md border border-emerald-200">
                            {message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        onClick={handleResend}
                        disabled={resendPending || countdown > 0}
                        className="w-full"
                    >
                        {resendPending ? (
                            <Loader2 className="animate-spin mr-2 h-3 w-3" />
                        ) : countdown > 0 ? (
                            `Kirim Ulang (${countdown}s)`
                        ) : (
                            "Kirim Ulang Link"
                        )}
                    </Button>
                    <Button variant="ghost" onClick={() => router.push("/login")} className="text-muted-foreground w-full">
                        Kembali ke Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
