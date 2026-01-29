"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, ArrowLeft, Image as ImageIcon, X, Menu, Plus, MessageSquare, History, Trash2, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { API_BASE_URL } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "model";
    content: string;
    image?: string;
};

type ChatSession = {
    id: string;
    title: string;
    createdAt: string;
};

export default function TanyaSyifaPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Auth State
    const [user, setUser] = useState<any>(null);
    const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    useEffect(() => {
        checkAuth();
    }, []);



    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/session`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setAuthStatus("authenticated");
            } else {
                setAuthStatus("unauthenticated");
            }
        } catch (error) {
            setAuthStatus("unauthenticated");
        }
    };


    // History State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-Resume Session
    useEffect(() => {
        const lastSessionId = sessionStorage.getItem("lastActiveSessionId");
        if (lastSessionId) {
            loadSession(lastSessionId);
        }
    }, []);

    // Fetch History on Mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/history`);
            if (res.ok) {
                const data = await res.json();
                if (data.sessions) {
                    setSessions(data.sessions);
                }
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const loadSession = async (sessionId: string) => {
        setIsLoading(true);
        setCurrentSessionId(sessionId);
        setIsSidebarOpen(false); // Close sidebar on mobile

        // Save to storage
        sessionStorage.setItem("lastActiveSessionId", sessionId);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/history?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            toast({ title: "Gagal memuat chat", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentSessionId(null);
        setIsSidebarOpen(false);
        sessionStorage.removeItem("lastActiveSessionId");
    };

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent loading session when clicking delete

        if (!confirm("Hapus percakapan ini?")) return;

        // Optimistic update
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));

        if (currentSessionId === sessionId) {
            handleNewChat(); // This also clears storage
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus");
            }
            toast({ title: "Percakapan dihapus" });
        } catch (error) {
            toast({ title: "Gagal menghapus", variant: "destructive" });
            fetchHistory(); // Revert optimistic update
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File terlalu besar",
                    description: "Maksimal ukuran gambar adalah 5MB",
                    variant: "destructive"
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            image: selectedImage || undefined
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const historyForApi = newMessages
                .filter(m => m.role === 'user' || m.role === 'model')
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            const payload = {
                messages: historyForApi,
                image: userMsg.image,
                sessionId: currentSessionId
            };



            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 401) {
                setAuthStatus("unauthenticated");
                return;
            }

            if (!res.ok) throw new Error(data.error || "Gagal terhubung ke Asisten");

            if (data.sessionId && data.sessionId !== currentSessionId) {
                setCurrentSessionId(data.sessionId);
                sessionStorage.setItem("lastActiveSessionId", data.sessionId); // Save new session ID
                fetchHistory(); // Refresh sidebar to show new session
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: data.reply,
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            toast({
                title: "Error",
                description: "Maaf, pesan gagal terkirim.",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authStatus === "loading") {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (authStatus === "unauthenticated") {
        return (
            <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full mr-2">
                            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-white" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 dark:text-white">Tanya Syifa</h1>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">


                    {/* Clean Icon approach */}
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-lg border-2 border-amber-600/50 flex items-center justify-center">
                            <LogIn className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-xs">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            Login Diperlukan
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Fitur Tanya Syifa hanya dapat diakses oleh pengguna yang telah terdaftar dan login. Silahkan login terlebih dahulu.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/login')}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 font-medium text-base shadow-lg shadow-emerald-900/20"
                    >
                        Login Sekarang
                    </Button>
                </div>

                {/* Bottom Nav Placeholder (optional if needed to match exact screen, but simple version first) */}
                <FloatingBottomNav />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </Button>
                    </Link>

                    {/* Mobile Sidebar Trigger */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full md:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 overflow-hidden relative">
                            <Image
                                src="/images/syifa-avatar.png"
                                alt="Asisten Syifa"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Tanya Syifa (AI)</h1>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                Asisten Majlis Ta'lim
                            </p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <History className="w-4 h-4" /> Riwayat
                    </Button>
                </div>
            </div>

            {/* CUSTOM SIDEBAR OVERLAY & PANEL */}
            {isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div
                className={`absolute top-0 right-0 h-full w-[300px] sm:w-[350px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                        <h2 className="font-bold text-lg">Riwayat Chat</h2>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleNewChat}>
                                <Plus className="w-4 h-4 mr-1" /> Baru
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setIsSidebarOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group w-full text-left p-3 rounded-lg text-sm transition-colors flex items-start gap-3 relative ${currentSessionId === session.id
                                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 font-medium"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                            >
                                <button
                                    className="flex-1 flex items-start gap-3 min-w-0 text-left"
                                    onClick={() => loadSession(session.id)}
                                >
                                    <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div className="truncate min-w-0">
                                        <div className="truncate">{session.title}</div>
                                        <div className="text-[10px] opacity-60 mt-0.5">
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-1 rounded-md absolute right-2 top-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                                    title="Hapus percakapan"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center p-8 text-slate-400 text-sm">
                                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Belum ada riwayat
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center py-20 px-4">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-6 relative overflow-hidden border-2 border-emerald-200">
                            <Image src="/images/syifa-avatar.png" alt="Syifa" fill className="object-cover" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            Assalamu'alaikum!
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Saya Asisten Majlis Ta'lim Daarussyifa. Silakan tanya jadwal kajian, hukum Islam, atau upload gambar untuk saya jelaskan.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "model" && (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex-shrink-0 border border-emerald-200 overflow-hidden relative mb-1">
                                <Image
                                    src="/images/syifa-avatar.png"
                                    alt="Syifa"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm flex flex-col gap-2 ${msg.role === "user"
                                ? "bg-emerald-600 text-white rounded-tr-none"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none"
                                }`}
                        >
                            {msg.image && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-1">
                                    <Image
                                        src={msg.image}
                                        alt="Uploaded content"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            {msg.content && <p>{msg.content}</p>}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-10">
                {selectedImage && (
                    <div className="mb-2 relative inline-block">
                        <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden relative">
                            <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                        </div>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-center max-w-2xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ketik pertanyaan Anda..."
                        className="flex-1 rounded-full border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500"
                        disabled={isLoading}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </Button>

                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                        disabled={isLoading || (!input.trim() && !selectedImage)}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    AI dapat salah. Mohon verifikasi fatwa penting kepada Ustadz.
                </p>
            </div>
        </div>
    );
}
