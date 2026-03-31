import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import TermsClient from "./TermsClient";

export default async function TermsPage() {
	const supabase = await createClient();

	const [{ data: terms, error }, { data: termTypes }] = await Promise.all([
		supabase.from("terms").select("id, term, definition, priority, term_type_id").order("term"),
		supabase.from("term_types").select("id, name"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const typeMap = Object.fromEntries((termTypes ?? []).map((t) => [t.id, t.name]));
	const rows = (terms ?? []).map((t) => ({
		id: t.id,
		term: t.term,
		definition: t.definition,
		priority: t.priority,
		typeName: t.term_type_id ? (typeMap[t.term_type_id] ?? null) : null,
	}));

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
				<div>
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Terms</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{rows.length} terms</p>
				</div>
				<Link href="/admin/terms/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ New Term
				</Link>
			</div>
			<TermsClient terms={rows} />
		</div>
	);
}
