import { createClient } from "@/lib/supabase/server";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 100;

export default async function LlmResponsesPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const supabase = await createClient();

	const [{ data: responses, error, count }, { data: models }, { data: flavors }] = await Promise.all([
		supabase
			.from("llm_model_responses")
			.select("id, created_datetime_utc, llm_model_id, humor_flavor_id, processing_time_seconds, llm_temperature", { count: "exact" })
			.order("created_datetime_utc", { ascending: false })
			.range(from, to),
		supabase.from("llm_models").select("id, name"),
		supabase.from("humor_flavors").select("id, slug"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const modelMap = Object.fromEntries((models ?? []).map((m) => [m.id, m.name]));
	const flavorMap = Object.fromEntries((flavors ?? []).map((f) => [f.id, f.slug]));
	const total = count ?? 0;

	return (
		<div>
			<div style={{ marginBottom: "1.75rem" }}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>LLM Responses</h1>
				<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{total} total</p>
			</div>

			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 60px 140px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Model</span>
					<span>Flavor</span>
					<span>Time (s)</span>
					<span>Temp</span>
					<span>Created</span>
				</div>
				{!responses?.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No responses found.</div>
				)}
				{responses?.map((r, i) => (
					<div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 60px 140px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < responses.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.85rem", color: "#a78bfa" }}>{r.llm_model_id ? (modelMap[r.llm_model_id] ?? r.llm_model_id.slice(0, 8)) : "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#4ecdc4", fontFamily: "monospace" }}>{r.humor_flavor_id ? (flavorMap[r.humor_flavor_id] ?? r.humor_flavor_id.slice(0, 8)) : "—"}</span>
						<span style={{ fontSize: "0.85rem", color: r.processing_time_seconds > 10 ? "#ff6b6b" : "#f59e0b" }}>{r.processing_time_seconds != null ? r.processing_time_seconds.toFixed(2) : "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#8888aa" }}>{r.llm_temperature ?? "—"}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(r.created_datetime_utc).toLocaleDateString()}</span>
					</div>
				))}
			</div>

			<Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/llm-responses" />
		</div>
	);
}
