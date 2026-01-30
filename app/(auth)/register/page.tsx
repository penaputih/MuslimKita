"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTransition, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { register } from "./actions";
import { API_BASE_URL } from "@/lib/utils";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await register(null, formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    const handleGoogleRegister = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const googleUser = await GoogleAuth.signIn();

                const res = await fetch(`${API_BASE_URL}/api/auth/google/native`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: googleUser.authentication.idToken, intent: 'register' })
                });

                const data = await res.json();

                if (data.success) {
                    if (data.redirect) router.push(data.redirect);
                    else router.push('/');
                    router.refresh();
                } else {
                    console.error("Native Auth API Error:", data.error);
                    setError(data.error || "Registrasi gagal");
                }
            } catch (e: any) {
                console.error("Google Native Register Error", e);
                setError("Gagal daftar dengan Google App");
            }
        } else {
            window.location.href = `${API_BASE_URL}/api/auth/google?intent=register`;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm border-none shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-primary">Daftar Akun</CardTitle>
                    <CardDescription className="text-center">
                        Buat akun untuk mengakses banyak fitur
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button variant="outline" type="button" className="w-full gap-2 font-medium" onClick={handleGoogleRegister}>
                            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Daftar dengan Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Atau daftar dengan</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input name="name" id="name" type="text" placeholder="Fulan bin Fulan" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input name="email" id="email" type="email" placeholder="nama@email.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input name="password" id="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Daftar
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-center w-full text-muted-foreground">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Masuk
                        </Link>
                    </p>
                    <Link href="/" className="w-full">
                        <Button variant="ghost" className="w-full text-muted-foreground">
                            <ArrowLeft className="size-4 mr-2" />
                            Kembali ke Halaman Utama
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
