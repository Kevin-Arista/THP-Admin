import { createClient } from "@/lib/supabase/server";

export default async function HumorFlavorStepsPage() {
	const supabase = await createClient();

	const [{ data: steps, error }, { data: flavors }, { data: models }] = await Promise.all([
		supabase
			.from("humor_flavor_steps")
			.select("id, humor_flavor_id, order_by, description, llm_temperature, llm_model_id, created_datetime_utc")
			.order("humor_flavor_id")
			.order("order_by"),
		supabase.from("humor_flavors").select("id, slug"),
		supabase.from("llm_models").select("id, name"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const flavorMap = Object.fromEntries((flavors ?? []).map((f) => [f.id, f.slug]));
	const modelMap = Object.fromEntries((models ?? []).map((m) => [m.id, m.name]));

	return (
		<div>
			<div style={{ marginBottom: "1.75rem" }}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Humor Flavor Steps</h1>
				<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{steps?.length ?? 0} steps</p>
			</div>

			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "120px 40px 1fr 120px 60px 120px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Flavor</span>
					<span>#</span>
					<span>Description</span>
					<span>Model</span>
					<span>Temp</span>
					<span>Created</span>
				</div>
				{!steps?.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No steps found.</div>
				)}
				{steps?.map((s, i) => (
					<div key={s.id} style={{ display: "grid", gridTemplateColumns: "120px 40px 1fr 120px 60px 120px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < steps.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.8rem", color: "#4ecdc4", fontFamily: "monospace" }}>{flavorMap[s.humor_flavor_id] ?? "—"}</span>
						<span style={{ fontSize: "0.875rem", color: "#8888aa" }}>{s.order_by ?? "—"}</span>
						<span style={{ fontSize: "0.85rem", color: "#c0c0d0" }}>{s.description ?? "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#a78bfa" }}>{s.llm_model_id ? (modelMap[s.llm_model_id] ?? s.llm_model_id.slice(0, 8)) : "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#f59e0b" }}>{s.llm_temperature ?? "—"}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(s.created_datetime_utc).toLocaleDateString()}</span>
					</div>
				))}
			</div>
		</div>
	);
}
