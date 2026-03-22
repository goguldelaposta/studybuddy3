import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const ADMIN_EMAIL = "contact@studybuddy.ro";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOOLS = [{
    functionDeclarations: [
        {
            name: "get_site_stats",
            description: "Returnează statisticile curente ale platformei: useri, grupuri, mesaje, rapoarte în așteptare.",
            parameters: { type: "OBJECT", properties: {}, required: [] },
        },
        {
            name: "get_pending_reports",
            description: "Returnează rapoartele de moderare nesoluționate.",
            parameters: { type: "OBJECT", properties: {}, required: [] },
        },
        {
            name: "create_announcement",
            description: "Creează un anunț public vizibil tuturor utilizatorilor.",
            parameters: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING", description: "Titlul anunțului" },
                    content: { type: "STRING", description: "Conținutul anunțului în română" },
                    type: { type: "STRING", description: "Tipul: info, warning, success" },
                },
                required: ["title", "content"],
            },
        },
        {
            name: "send_newsletter",
            description: "Trimite un newsletter tuturor utilizatorilor înregistrați.",
            parameters: {
                type: "OBJECT",
                properties: {
                    subject: { type: "STRING" },
                    message: { type: "STRING" },
                },
                required: ["subject", "message"],
            },
        },
        {
            name: "send_admin_report",
            description: "Trimite raportul zilnic pe emailul adminului.",
            parameters: {
                type: "OBJECT",
                properties: { report: { type: "STRING" } },
                required: ["report"],
            },
        },
        {
            name: "finish",
            description: "Marchează că agentul a terminat toate acțiunile.",
            parameters: {
                type: "OBJECT",
                properties: { summary: { type: "STRING" } },
                required: ["summary"],
            },
        },
    ],
}];

async function executeTool(
    name: string,
    args: Record<string, unknown>,
    supabase: any,
    actionLog: Array<{ action: string; result: string; success: boolean }>
): Promise<unknown> {
    console.log(`Tool: ${name}`, args);

    if (name === "get_site_stats") {
        const [{ count: users }, { count: groups }, { count: messages }, { count: reports }] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("groups").select("*", { count: "exact", head: true }),
            supabase.from("messages").select("*", { count: "exact", head: true }),
            supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        const stats = { users: users || 0, groups: groups || 0, messages: messages || 0, pending_reports: reports || 0 };
        actionLog.push({ action: "get_site_stats", result: JSON.stringify(stats), success: true });
        return stats;
    }

    if (name === "get_pending_reports") {
        const { data } = await supabase.from("reports").select("id, reason, created_at").eq("status", "pending").limit(10);
        actionLog.push({ action: "get_pending_reports", result: `${data?.length || 0} rapoarte`, success: true });
        return data || [];
    }

    if (name === "create_announcement") {
        const { title, content, type = "info" } = args as { title: string; content: string; type?: string };
        const { error } = await supabase.from("announcements").insert({ title, content, type, is_active: true });
        const success = !error;
        const result = success ? `Anunț creat: "${title}"` : `Eroare: ${error?.message}`;
        actionLog.push({ action: "create_announcement", result, success });
        return { success, result };
    }

    if (name === "send_newsletter") {
        const { subject, message } = args as { subject: string; message: string };
        const { data: profiles } = await supabase.from("profiles").select("email").not("email", "is", null);
        const emails = (profiles || []).map((p: { email: string }) => p.email).filter(Boolean);
        let sent = 0;
        for (let i = 0; i < emails.length; i += 50) {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
                body: JSON.stringify({
                    from: "StudyBuddy <contact@studybuddy.ro>",
                    to: emails.slice(i, i + 50),
                    subject,
                    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;"><h1 style="color:#2563eb;">${subject}</h1><p style="line-height:1.7;">${message.replace(/\n/g, "<br>")}</p><p style="color:#9ca3af;font-size:12px;margin-top:24px;">StudyBuddy · studybuddy.ro</p></div>`,
                }),
            });
            if (res.ok) sent += emails.slice(i, i + 50).length;
        }
        actionLog.push({ action: "send_newsletter", result: `Trimis la ${sent} useri`, success: sent > 0 });
        return { success: sent > 0, sent };
    }

    if (name === "send_admin_report") {
        const { report } = args as { report: string };
        const now = new Date().toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
                from: "AI Agent StudyBuddy <contact@studybuddy.ro>",
                to: [ADMIN_EMAIL],
                subject: `🤖 Raport Zilnic AI Agent — ${now}`,
                html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;"><div style="background:linear-gradient(135deg,#2563eb,#0d9488);padding:24px;border-radius:12px;margin-bottom:24px;"><h1 style="color:#fff;margin:0;font-size:20px;">🤖 Raport Zilnic AI Agent</h1><p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">${now}</p></div><div style="background:#f8faff;border:1px solid #e2e8f8;border-radius:12px;padding:20px;line-height:1.7;">${report.replace(/\n/g, "<br>")}</div></div>`,
            }),
        });
        const success = res.ok;
        actionLog.push({ action: "send_admin_report", result: success ? "Raport trimis la admin" : "Eroare email", success });
        return { success };
    }

    if (name === "finish") {
        return { done: true, summary: args.summary };
    }

    return { error: `Tool necunoscut: ${name}` };
}

async function runAgent(supabase: ReturnType<typeof createClient>) {
    const actionLog: Array<{ action: string; result: string; success: boolean }> = [];
    const now = new Date();
    const dayNames = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
    const isMonday = now.getDay() === 1;

    const systemPrompt = `Ești AI Agent autonom pentru StudyBuddy (platformă academică românească).
Astăzi este ${dayNames[now.getDay()]}, ${now.toLocaleDateString("ro-RO")}.

ACȚIUNI OBLIGATORII:
1. Apelează get_site_stats pentru a vedea starea platformei
2. Apelează get_pending_reports pentru a verifica moderarea
3. Dacă pending_reports > 3: creează un anunț că echipa investighează
4. ${isMonday ? "Azi este LUNI: trimite un newsletter motivațional pentru studenți" : "Nu este luni, nu trimite newsletter"}
5. Apelează send_admin_report cu un rezumat complet al acțiunilor
6. Apelează finish

Acționează AUTONOM. Scrie ÎNTOTDEAUNA în română.`;

    const messages: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [
        { role: "user", parts: [{ text: systemPrompt }] },
    ];

    for (let i = 0; i < 10; i++) {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: messages, tools: TOOLS, generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } }),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const content = data.candidates?.[0]?.content;
        if (!content) break;
        messages.push({ role: "model", parts: content.parts });

        const calls = content.parts?.filter((p: Record<string, unknown>) => p.functionCall);
        if (!calls?.length) break;

        const results = [];
        let done = false;
        for (const part of calls) {
            const { name, args } = part.functionCall as { name: string; args: Record<string, unknown> };
            const result = await executeTool(name, args || {}, supabase, actionLog);
            results.push({ functionResponse: { name, response: { result } } });
            if (name === "finish") { done = true; break; }
        }
        messages.push({ role: "user", parts: results });
        if (done) break;
    }

    return actionLog;
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const runId = crypto.randomUUID();
        console.log(`AI Agent run ${runId}`);

        const actionLog = await runAgent(supabase);

        if (actionLog.length > 0) {
            await supabase.from("agent_logs").insert(actionLog.map((a) => ({ ...a, run_id: runId })));
        }

        return new Response(
            JSON.stringify({ success: true, runId, actions: actionLog.length, log: actionLog }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Agent error:", msg);
        return new Response(JSON.stringify({ success: false, error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
