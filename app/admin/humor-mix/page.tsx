import { createClient } from "@/lib/supabase/server";
import HumorMixClient from "./HumorMixClient";

export default async function HumorMixPage() {
	const supabase = await createClient();

	const [{ data: mix, error }, { data: flavors }] = await Promise.all([
		supabase.from("humor_flavor_mix").select("id, humor_flavor_id, caption_count").order("humor_flavor_id"),
		supabase.from("humor_flavors").select("id, slug"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const flavorMap = Object.fromEntries((flavors ?? []).map((f) => [f.id, f.slug]));
	const rows = (mix ?? []).map((m) => ({
		id: m.id,
		caption_count: m.caption_count ?? 0,
		humor_flavor_id: m.humor_flavor_id,
		flavorSlug: flavorMap[m.humor_flavor_id] ?? m.humor_flavor_id?.slice(0, 8) ?? "—",
	}));

	return (
		<div>
			<div style={{ marginBottom: "1.75rem" }}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Humor Mix</h1>
				<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>Configure caption count per humor flavor</p>
			</div>
			<HumorMixClient rows={rows} />
		</div>
	);
}
