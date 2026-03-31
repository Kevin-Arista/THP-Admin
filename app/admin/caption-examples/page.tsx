import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CaptionExamplesClient from "./CaptionExamplesClient";

export default async function CaptionExamplesPage() {
	const supabase = await createClient();
	const { data: examples, error } = await supabase
		.from("caption_examples")
		.select("id, image_description, caption, priority")
		.order("priority", { ascending: true, nullsFirst: false })
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
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Caption Examples</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{examples?.length ?? 0} examples</p>
				</div>
				<Link href="/admin/caption-examples/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ New Example
				</Link>
			</div>
			<CaptionExamplesClient examples={examples ?? []} />
		</div>
	);
}
