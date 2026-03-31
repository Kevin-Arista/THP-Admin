"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type EmailRow = { id: string; email_address: string; created_datetime_utc: string };

export default function WhitelistEmailsClient({ emails }: { emails: EmailRow[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string, email: string) {
		if (!confirm(`Remove "${email}" from whitelist?`)) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/whitelist-emails/${id}`, { method: "DELETE" });
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
					<span>Email Address</span>
					<span>Added</span>
					<span></span>
				</div>
				{!emails.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No whitelisted emails.</div>
				)}
				{emails.map((e, i) => (
					<div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < emails.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", color: "#f0f0ff" }}>{e.email_address}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(e.created_datetime_utc).toLocaleDateString()}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/whitelist-emails/${e.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button onClick={() => handleDelete(e.id, e.email_address)} disabled={deleting === e.id} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === e.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === e.id ? "default" : "pointer" }}>
								{deleting === e.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
