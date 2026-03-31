import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LlmProvidersClient from "./LlmProvidersClient";

export default async function LlmProvidersPage() {
	const supabase = await createClient();
	const { data: providers, error } = await supabase
		.from("llm_providers")
		.select("id, name, created_datetime_utc")
		.order("name");

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
				<div>
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>LLM Providers</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{providers?.length ?? 0} providers</p>
				</div>
				<Link href="/admin/llm-providers/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ New Provider
				</Link>
			</div>
			<LlmProvidersClient providers={providers ?? []} />
		</div>
	);
}
