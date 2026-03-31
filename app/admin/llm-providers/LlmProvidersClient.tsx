"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Provider = { id: string; name: string; created_datetime_utc: string };

export default function LlmProvidersClient({ providers }: { providers: Provider[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Delete provider "${name}"?`)) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/llm-providers/${id}`, { method: "DELETE" });
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
				<div style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Name</span>
					<span>Created</span>
					<span></span>
				</div>
				{!providers.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No providers found.</div>
				)}
				{providers.map((p, i) => (
					<div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < providers.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", color: "#f0f0ff", fontWeight: 500 }}>{p.name}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(p.created_datetime_utc).toLocaleDateString()}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/llm-providers/${p.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === p.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === p.id ? "default" : "pointer" }}>
								{deleting === p.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
