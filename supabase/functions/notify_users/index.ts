import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This edge function is triggered by a database webhook when a new row is inserted into "notices"
// It uses Resend (or any email provider) to notify users.

serve(async (req: Request) => {
    try {
        const payload = await req.json();
        const newNotice = payload.record;

        if (!newNotice || payload.type !== "INSERT" || payload.table !== "notices") {
            return new Response("Not a notice insert event", { status: 400 });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Important: Use service role to bypass RLS to read all profiles
        );

        // Fetch all users to notify
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("email, id");

        if (error || !profiles) throw error;

        const emails = profiles.map((p) => p.email);

        // Example: Sending with Resend API
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            console.log("No Resend API Key found. Would be sending to:", emails.length, "users");
            return new Response("Simulated success, emails logged. Add RESEND_API_KEY to actually send.", { status: 200 });
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "SmartNotice <onboarding@resend.dev>",
                to: emails,
                subject: `New Notice: ${newNotice.title}`,
                html: `
                    <h2>${newNotice.title}</h2>
                    <p><strong>Category:</strong> ${newNotice.category}</p>
                    <p><strong>Priority:</strong> <span style="color: ${newNotice.priority === 'urgent' ? 'red' : 'blue'};">${newNotice.priority}</span></p>
                    <p>${newNotice.short_description}</p>
                    <br/>
                    <a href="https://your-app-url.com/category/${encodeURIComponent(newNotice.category)}/notice/${newNotice.id}">
                        View full notice
                    </a>
                `
            }),
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Email provider error: ${errBody}`);
        }

        return new Response("Successfully sent emails", { status: 200 });

    } catch (err: any) {
        console.error("Function error:", err.message);
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});
