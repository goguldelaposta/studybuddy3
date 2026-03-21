import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Sparkles, Send, Loader2, Bot, User, Key, Eye, EyeOff,
    BarChart3, Mail, Lightbulb, Code2, RefreshCw, Trash2, Settings
} from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

type Provider = "gemini" | "openai" | "groq";

interface ProviderConfig {
    name: string;
    model: string;
    description: string;
    free: boolean;
    keyPlaceholder: string;
    keyLink: string;
    color: string;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
    gemini: {
        name: "Google Gemini",
        model: "gemini-2.5-flash",
        description: "Gemini 1.5 Flash",
        free: true,
        keyPlaceholder: "AIza...",
        keyLink: "https://aistudio.google.com/app/apikey",
        color: "from-blue-500 to-cyan-500",
    },
    openai: {
        name: "OpenAI",
        model: "gpt-4o-mini",
        description: "GPT-4o Mini",
        free: false,
        keyPlaceholder: "sk-...",
        keyLink: "https://platform.openai.com/api-keys",
        color: "from-emerald-500 to-teal-500",
    },
    groq: {
        name: "Groq",
        model: "llama-3.3-70b-versatile",
        description: "Llama 3.3 70B",
        free: true,
        keyPlaceholder: "gsk_...",
        keyLink: "https://console.groq.com/keys",
        color: "from-orange-500 to-red-500",
    },
};

const SYSTEM_CONTEXT = `Ești un asistent AI pentru administratorul platformei StudyBuddy - o platformă de colaborare academică pentru studenții din România.

Cunoști: React/TypeScript, Vite, Tailwind CSS, Supabase, Resend.
Tabele principale: profiles, groups, group_members, messages, announcements, user_roles, reports, suspensions, universities, faculties, courses, subjects, newsletter_queue, badges, audit_logs, blocked_ips.
Domeniu: studybuddy.ro

Poți ajuta cu: redactare conținut, cod React/TypeScript, statistici site, debugging, sugestii.
Răspunde ÎNTOTDEAUNA în română. Fii concis și practic.`;

const QUICK_ACTIONS = [
    { icon: BarChart3, label: "Statistici", color: "text-blue-500", prompt: "Analizează statisticile curente ale site-ului și dă-mi un rezumat." },
    { icon: Mail, label: "Newsletter", color: "text-green-500", prompt: "Redactează un newsletter atractiv și motivațional pentru studenții înregistrați pe StudyBuddy." },
    { icon: Lightbulb, label: "Idei noi", color: "text-amber-500", prompt: "Propune 5 funcționalități noi utile pentru studenții din România pe StudyBuddy." },
    { icon: Code2, label: "Ajutor cod", color: "text-purple-500", prompt: "Explică-mi cum pot adăuga o nouă componentă React în proiectul StudyBuddy." },
];

export const AIAssistant = () => {
    const { toast } = useToast();
    const [provider, setProvider] = useState<Provider>(() => (localStorage.getItem("ai_provider") as Provider) || "gemini");
    const [messages, setMessages] = useState<Message[]>([{
        role: "assistant",
        content: "Bună! 👋 Sunt asistentul tău AI pentru StudyBuddy.\n\nAleg modelul AI din meniu și introduc API key-ul, apoi sunt gata să te ajut cu conținut, cod, statistici și orice altceva. 🚀",
        timestamp: new Date(),
    }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(`ai_key_${localStorage.getItem("ai_provider") || "gemini"}`) || "");
    const [showKey, setShowKey] = useState(false);
    const [showSettings, setShowSettings] = useState(!localStorage.getItem(`ai_key_${(localStorage.getItem("ai_provider") as Provider) || "gemini"}`));
    const [stats, setStats] = useState<Record<string, number>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        fetchStats();
    }, []);

    const handleProviderChange = (p: Provider) => {
        setProvider(p);
        localStorage.setItem("ai_provider", p);
        setApiKey(localStorage.getItem(`ai_key_${p}`) || "");
    };

    const fetchStats = async () => {
        try {
            const [{ count: users }, { count: groups }, { count: msgs }] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("groups").select("*", { count: "exact", head: true }),
                supabase.from("messages").select("*", { count: "exact", head: true }),
            ]);
            setStats({ users: users || 0, groups: groups || 0, messages: msgs || 0 });
        } catch (_e) { }
    };

    const saveApiKey = () => {
        if (!apiKey.trim()) {
            toast({ title: "API Key gol", variant: "destructive" });
            return;
        }
        localStorage.setItem(`ai_key_${provider}`, apiKey);
        setShowSettings(false);
        toast({ title: `✅ ${PROVIDERS[provider].name} API Key salvat!` });
    };

    const callGemini = async (key: string, history: Message[], userText: string) => {
        const statsCtx = Object.keys(stats).length > 0
            ? `\n\nStatistici live: ${stats.users} useri, ${stats.groups} grupuri, ${stats.messages} mesaje.`
            : "";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_CONTEXT + statsCtx }] },
                    contents: [
                        ...history.slice(1).map(m => ({
                            role: m.role === "assistant" ? "model" : "user",
                            parts: [{ text: m.content }]
                        })),
                        { role: "user", parts: [{ text: userText }] }
                    ],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                })
            }
        );
        if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "Eroare Gemini"); }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Fără răspuns.";
    };

    const callOpenAI = async (key: string, history: Message[], userText: string) => {
        const statsCtx = Object.keys(stats).length > 0
            ? ` Statistici live: ${stats.users} useri, ${stats.groups} grupuri, ${stats.messages} mesaje.`
            : "";
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_CONTEXT + statsCtx },
                    ...history.slice(1).map(m => ({ role: m.role, content: m.content })),
                    { role: "user", content: userText }
                ],
                max_tokens: 2048,
                temperature: 0.7
            })
        });
        if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "Eroare OpenAI"); }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Fără răspuns.";
    };

    const callGroq = async (key: string, history: Message[], userText: string) => {
        const statsCtx = Object.keys(stats).length > 0
            ? ` Statistici live: ${stats.users} useri, ${stats.groups} grupuri, ${stats.messages} mesaje.`
            : "";
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_CONTEXT + statsCtx },
                    ...history.slice(1).map(m => ({ role: m.role, content: m.content })),
                    { role: "user", content: userText }
                ],
                max_tokens: 2048,
                temperature: 0.7
            })
        });
        if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "Eroare Groq"); }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Fără răspuns.";
    };

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        const savedKey = localStorage.getItem(`ai_key_${provider}`);
        if (!savedKey) {
            setShowSettings(true);
            toast({ title: `Lipsă ${PROVIDERS[provider].name} API Key`, variant: "destructive" });
            return;
        }

        const userMsg: Message = { role: "user", content: messageText, timestamp: new Date() };
        const currentMessages = [...messages, userMsg];
        setMessages(currentMessages);
        setInput("");
        setLoading(true);

        try {
            let aiText = "";
            if (provider === "gemini") aiText = await callGemini(savedKey, currentMessages, messageText);
            else if (provider === "openai") aiText = await callOpenAI(savedKey, currentMessages, messageText);
            else aiText = await callGroq(savedKey, currentMessages, messageText);

            setMessages(prev => [...prev, { role: "assistant", content: aiText, timestamp: new Date() }]);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Eroare necunoscută";
            toast({ title: "Eroare AI", description: msg, variant: "destructive" });
            setMessages(prev => [...prev, { role: "assistant", content: `❌ ${msg}`, timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const cfg = PROVIDERS[provider];

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0`}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">AI Assistant</CardTitle>
                            <CardDescription>{cfg.description} · {cfg.free ? "Gratuit ✨" : "Pay-per-use"}</CardDescription>
                        </div>
                        {/* Provider selector */}
                        <Select value={provider} onValueChange={v => handleProviderChange(v as Provider)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini">🔵 Gemini Flash</SelectItem>
                                <SelectItem value="openai">🟢 GPT-4o Mini</SelectItem>
                                <SelectItem value="groq">🟠 Groq Llama 3</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                            {Object.keys(stats).length > 0 && (
                                <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground mr-2">
                                    <span>👥 {stats.users}</span>
                                    <span>📚 {stats.groups}</span>
                                    <span>💬 {stats.messages}</span>
                                </div>
                            )}
                            <Button variant="ghost" size="icon" onClick={fetchStats}><RefreshCw className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}><Settings className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setMessages([{ role: "assistant", content: "Chat șters. 🚀", timestamp: new Date() }])}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </CardHeader>

                {/* API Key settings */}
                {showSettings && (
                    <CardContent className="pt-0">
                        <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
                            <p className="text-xs font-medium">
                                🔑 {cfg.name} API Key —{" "}
                                <a href={cfg.keyLink} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                                    Obține gratuit
                                </a>
                            </p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKey ? "text" : "password"}
                                        placeholder={cfg.keyPlaceholder}
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && saveApiKey()}
                                        className="pr-10 text-sm font-mono"
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowKey(!showKey)}
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <Button onClick={saveApiKey} size="sm"><Key className="w-4 h-4 mr-1" />Salvează</Button>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_ACTIONS.map(action => (
                    <Button
                        key={action.label}
                        variant="outline"
                        className="flex items-center gap-2 h-auto py-3 justify-start"
                        onClick={() => sendMessage(action.prompt)}
                        disabled={loading}
                    >
                        <action.icon className={`w-4 h-4 shrink-0 ${action.color}`} />
                        <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                ))}
            </div>

            {/* Chat */}
            <Card>
                <div className="overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? `bg-gradient-to-br ${cfg.color}` : "bg-primary"
                                }`}>
                                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-primary-foreground" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted rounded-tl-sm"
                                }`}>
                                {msg.content}
                                <p className={`text-xs mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                    {msg.timestamp.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Scrie un mesaj... (Enter = trimite, Shift+Enter = linie nouă)"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            className="min-h-[44px] max-h-[120px] resize-none"
                            rows={1}
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            size="icon"
                            className={`shrink-0 h-11 w-11 bg-gradient-to-br ${cfg.color} hover:opacity-90`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        {cfg.description} · Răspunde în română · Cunoaște contextul StudyBuddy
                    </p>
                </div>
            </Card>
        </div>
    );
};
