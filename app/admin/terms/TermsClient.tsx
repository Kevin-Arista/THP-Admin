"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Term = {
	id: string;
	term: string;
	definition: string;
	priority: number | null;
	typeName: string | null;
};

export default function TermsClient({ terms }: { terms: Term[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string, term: string) {
		if (!confirm(`Delete term "${term}"?`)) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/terms/${id}`, { method: "DELETE" });
		setDeleting(null);
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to delete.");
			return;
		}
		router.refresh();
	}

	return (
		<div>
			{error && (
				<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
					{error}
				</div>
			)}
			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "160px 1fr 100px 60px 80px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Term</span>
					<span>Definition</span>
					<span>Type</span>
					<span>Priority</span>
					<span></span>
				</div>
				{!terms.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No terms found.</div>
				)}
				{terms.map((t, i) => (
					<div key={t.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 100px 60px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < terms.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f0f0ff" }}>{t.term}</span>
						<span style={{ fontSize: "0.8rem", color: "#8888aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.definition}</span>
						<span style={{ fontSize: "0.75rem", color: "#a78bfa" }}>{t.typeName ?? "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#f59e0b" }}>{t.priority ?? "—"}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/terms/${t.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button
								onClick={() => handleDelete(t.id, t.term)}
								disabled={deleting === t.id}
								style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === t.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === t.id ? "default" : "pointer" }}>
								{deleting === t.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
