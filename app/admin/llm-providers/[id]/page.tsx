"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

export default function EditLlmProviderPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		createClient().from("llm_providers").select("name").eq("id", id).single().then(({ data }) => {
			if (data) setName(data.name ?? "");
			setLoading(false);
		});
	}, [id]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const res = await fetch(`/api/admin/llm-providers/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: name.trim() }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to save.");
			setSaving(false);
			return;
		}
		router.push("/admin/llm-providers");
		router.refresh();
	}

	async function handleDelete() {
		if (!confirm("Delete this provider?")) return;
		setDeleting(true);
		const res = await fetch(`/api/admin/llm-providers/${id}`, { method: "DELETE" });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to delete.");
			setDeleting(false);
			return;
		}
		router.push("/admin/llm-providers");
		router.refresh();
	}

	if (loading) return <div style={{ color: "#5a5a7a", padding: "2rem" }}>Loading…</div>;

	return (
		<div style={{ maxWidth: "420px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
				<Link href="/admin/llm-providers" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>← LLM Providers</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Edit Provider</h1>
			</div>
			<form onSubmit={handleSubmit} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{error && <div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>{error}</div>}
				<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
					<label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.05em" }}>Name *</label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} style={inputStyle} />
				</div>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button type="submit" disabled={saving || deleting} style={{ flex: 1, padding: "0.65rem", fontSize: "0.9rem", fontWeight: 600, color: saving ? "#5a5a7a" : "#0d0d1a", background: saving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer" }}>
						{saving ? "Saving…" : "Save Changes"}
					</button>
					<Link href="/admin/llm-providers" style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem", color: "#8888aa", border: "1px solid #2a2a4a", borderRadius: "8px", textAlign: "center" }}>Cancel</Link>
				</div>
				<button type="button" onClick={handleDelete} disabled={deleting || saving} style={{ padding: "0.5rem", fontSize: "0.85rem", color: deleting ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", cursor: deleting ? "default" : "pointer" }}>
					{deleting ? "Deleting…" : "Delete Provider"}
				</button>
				<div style={{ fontSize: "0.72rem", color: "#3a3a5a" }}>ID: {id}</div>
			</form>
		</div>
	);
}
