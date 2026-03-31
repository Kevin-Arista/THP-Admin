"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
			<label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.05em" }}>{label}</label>
			{children}
		</div>
	);
}

export default function NewLlmModelPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [providerModelId, setProviderModelId] = useState("");
	const [providerId, setProviderId] = useState("");
	const [isTemperatureSupported, setIsTemperatureSupported] = useState(true);
	const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		createClient().from("llm_providers").select("id, name").order("name").then(({ data }) => {
			if (data) setProviders(data);
		});
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const res = await fetch("/api/admin/llm-models", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: name.trim(), provider_model_id: providerModelId.trim(), llm_provider_id: providerId || null, is_temperature_supported: isTemperatureSupported }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to create.");
			setSaving(false);
			return;
		}
		router.push("/admin/llm-models");
		router.refresh();
	}

	return (
		<div style={{ maxWidth: "560px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
				<Link href="/admin/llm-models" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>← LLM Models</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>New Model</h1>
			</div>
			<form onSubmit={handleSubmit} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{error && <div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>{error}</div>}
				<Field label="Display Name *">
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} placeholder="e.g. GPT-4o" style={inputStyle} />
				</Field>
				<Field label="Provider Model ID *">
					<input type="text" value={providerModelId} onChange={(e) => setProviderModelId(e.target.value)} required disabled={saving} placeholder="e.g. gpt-4o-2024-11-20" style={inputStyle} />
				</Field>
				<Field label="Provider">
					<select value={providerId} onChange={(e) => setProviderId(e.target.value)} disabled={saving} style={{ ...inputStyle, cursor: "pointer" }}>
						<option value="">— none —</option>
						{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
					</select>
				</Field>
				<label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.875rem", color: "#e0e0f0" }}>
					<input type="checkbox" checked={isTemperatureSupported} onChange={(e) => setIsTemperatureSupported(e.target.checked)} disabled={saving} style={{ width: "16px", height: "16px", accentColor: "#4ecdc4" }} />
					Temperature supported
				</label>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button type="submit" disabled={saving} style={{ flex: 1, padding: "0.65rem", fontSize: "0.9rem", fontWeight: 600, color: saving ? "#5a5a7a" : "#0d0d1a", background: saving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer" }}>
						{saving ? "Creating…" : "Create Model"}
					</button>
					<Link href="/admin/llm-models" style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem", color: "#8888aa", border: "1px solid #2a2a4a", borderRadius: "8px", textAlign: "center" }}>Cancel</Link>
				</div>
			</form>
		</div>
	);
}
