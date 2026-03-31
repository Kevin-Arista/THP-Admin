"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Domain = { id: string; apex_domain: string; created_datetime_utc: string };

export default function AllowedDomainsClient({ domains }: { domains: Domain[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string, domain: string) {
		if (!confirm(`Remove domain "${domain}"?`)) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/allowed-domains/${id}`, { method: "DELETE" });
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
					<span>Apex Domain</span>
					<span>Added</span>
					<span></span>
				</div>
				{!domains.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No allowed domains.</div>
				)}
				{domains.map((d, i) => (
					<div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < domains.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", color: "#4ecdc4", fontFamily: "monospace" }}>{d.apex_domain}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(d.created_datetime_utc).toLocaleDateString()}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/allowed-domains/${d.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button onClick={() => handleDelete(d.id, d.apex_domain)} disabled={deleting === d.id} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === d.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === d.id ? "default" : "pointer" }}>
								{deleting === d.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
