import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LlmModelsClient from "./LlmModelsClient";

export default async function LlmModelsPage() {
	const supabase = await createClient();

	const [{ data: models, error }, { data: providers }] = await Promise.all([
		supabase.from("llm_models").select("id, name, provider_model_id, is_temperature_supported, llm_provider_id, created_datetime_utc").order("name"),
		supabase.from("llm_providers").select("id, name"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const providerMap = Object.fromEntries((providers ?? []).map((p) => [p.id, p.name]));
	const rows = (models ?? []).map((m) => ({
		id: m.id,
		name: m.name,
		provider_model_id: m.provider_model_id,
		is_temperature_supported: m.is_temperature_supported ?? true,
		providerName: m.llm_provider_id ? (providerMap[m.llm_provider_id] ?? null) : null,
		created_datetime_utc: m.created_datetime_utc,
	}));

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
				<div>
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>LLM Models</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{rows.length} models</p>
				</div>
				<Link href="/admin/llm-models/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ New Model
				</Link>
			</div>
			<LlmModelsClient models={rows} />
		</div>
	);
}
