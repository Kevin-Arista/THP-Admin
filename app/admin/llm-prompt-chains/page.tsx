import { createClient } from "@/lib/supabase/server";

export default async function LlmPromptChainsPage() {
	const supabase = await createClient();

	const [{ data: chains, error }, { data: requests }] = await Promise.all([
		supabase
			.from("llm_prompt_chains")
			.select("id, created_datetime_utc, caption_request_id")
			.order("created_datetime_utc", { ascending: false })
			.limit(500),
		supabase.from("caption_requests").select("id, image_id"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const requestMap = Object.fromEntries((requests ?? []).map((r) => [r.id, r.image_id]));

	return (
		<div>
			<div style={{ marginBottom: "1.75rem" }}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>LLM Prompt Chains</h1>
				<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{chains?.length ?? 0} chains (latest 500)</p>
			</div>

			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Chain ID</span>
					<span>Caption Request</span>
					<span>Created</span>
				</div>
				{!chains?.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No chains found.</div>
				)}
				{chains?.map((c, i) => (
					<div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < chains.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.75rem", color: "#4ecdc4", fontFamily: "monospace" }}>{String(c.id).slice(0, 8)}…</span>
						<span style={{ fontSize: "0.75rem", color: "#8888aa", fontFamily: "monospace" }}>{c.caption_request_id ? String(c.caption_request_id).slice(0, 8) + "…" : "—"}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(c.created_datetime_utc).toLocaleDateString()}</span>
					</div>
				))}
			</div>
		</div>
	);
}
