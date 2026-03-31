"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "0.6rem 0.75rem",
	fontSize: "0.875rem",
	color: "#e0e0f0",
	background: "#11112a",
	border: "1px solid #2a2a4a",
	borderRadius: "8px",
	outline: "none",
};

export default function NewAllowedDomainPage() {
	const router = useRouter();
	const [apexDomain, setApexDomain] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const res = await fetch("/api/admin/allowed-domains", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ apex_domain: apexDomain.trim() }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to add domain.");
			setSaving(false);
			return;
		}
		router.push("/admin/allowed-domains");
		router.refresh();
	}

	return (
		<div style={{ maxWidth: "420px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
				<Link href="/admin/allowed-domains" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>← Allowed Domains</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Add Domain</h1>
			</div>
			<form onSubmit={handleSubmit} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{error && <div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>{error}</div>}
				<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
					<label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.05em" }}>Apex Domain *</label>
					<input type="text" value={apexDomain} onChange={(e) => setApexDomain(e.target.value)} required disabled={saving} placeholder="e.g. university.edu" style={inputStyle} />
					<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>Enter the apex domain (no @ or subdomain)</span>
				</div>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button type="submit" disabled={saving} style={{ flex: 1, padding: "0.65rem", fontSize: "0.9rem", fontWeight: 600, color: saving ? "#5a5a7a" : "#0d0d1a", background: saving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer" }}>
						{saving ? "Adding…" : "Add Domain"}
					</button>
					<Link href="/admin/allowed-domains" style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem", color: "#8888aa", border: "1px solid #2a2a4a", borderRadius: "8px", textAlign: "center" }}>Cancel</Link>
				</div>
			</form>
		</div>
	);
}
