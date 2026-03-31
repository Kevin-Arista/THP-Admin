import { createClient } from "@/lib/supabase/server";

export default async function HumorFlavorsPage() {
	const supabase = await createClient();
	const { data: flavors, error } = await supabase
		.from("humor_flavors")
		.select("id, slug, description, created_datetime_utc")
		.order("created_datetime_utc", { ascending: false });

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
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Humor Flavors</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{flavors?.length ?? 0} flavors</p>
				</div>
			</div>

			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 140px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Slug</span>
					<span>Description</span>
					<span>Created</span>
				</div>
				{!flavors?.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No flavors found.</div>
				)}
				{flavors?.map((f, i) => (
					<div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 140px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < flavors.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", color: "#4ecdc4", fontFamily: "monospace" }}>{f.slug}</span>
						<span style={{ fontSize: "0.85rem", color: "#c0c0d0" }}>{f.description ?? "—"}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(f.created_datetime_utc).toLocaleDateString()}</span>
					</div>
				))}
			</div>
		</div>
	);
}
