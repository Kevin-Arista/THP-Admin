"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Model = {
	id: string;
	name: string;
	provider_model_id: string;
	is_temperature_supported: boolean;
	providerName: string | null;
	created_datetime_utc: string;
};

export default function LlmModelsClient({ models }: { models: Model[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Delete model "${name}"?`)) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/llm-models/${id}`, { method: "DELETE" });
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
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 60px 80px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Name</span>
					<span>Provider Model ID</span>
					<span>Provider</span>
					<span>Temp</span>
					<span></span>
				</div>
				{!models.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No models found.</div>
				)}
				{models.map((m, i) => (
					<div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 60px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < models.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.875rem", color: "#f0f0ff", fontWeight: 500 }}>{m.name}</span>
						<span style={{ fontSize: "0.8rem", color: "#8888aa", fontFamily: "monospace" }}>{m.provider_model_id}</span>
						<span style={{ fontSize: "0.8rem", color: "#a78bfa" }}>{m.providerName ?? "—"}</span>
						<span style={{ fontSize: "0.8rem", color: m.is_temperature_supported ? "#4ecdc4" : "#5a5a7a" }}>{m.is_temperature_supported ? "Yes" : "No"}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/llm-models/${m.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button onClick={() => handleDelete(m.id, m.name)} disabled={deleting === m.id} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === m.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === m.id ? "default" : "pointer" }}>
								{deleting === m.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
