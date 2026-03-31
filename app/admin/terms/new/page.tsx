"use client";

import { useState, useEffect } from "react";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
			<label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.05em" }}>{label}</label>
			{children}
		</div>
	);
}

export default function NewTermPage() {
	const router = useRouter();
	const [term, setTerm] = useState("");
	const [definition, setDefinition] = useState("");
	const [example, setExample] = useState("");
	const [priority, setPriority] = useState("");
	const [termTypeId, setTermTypeId] = useState("");
	const [termTypes, setTermTypes] = useState<{ id: string; name: string }[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		import("@/lib/supabase/client").then(({ createClient }) => {
			createClient().from("term_types").select("id, name").order("name").then(({ data }) => {
				if (data) setTermTypes(data);
			});
		});
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const res = await fetch("/api/admin/terms", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ term: term.trim(), definition: definition.trim(), example: example.trim() || null, priority: priority ? Number(priority) : null, term_type_id: termTypeId || null }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to create.");
			setSaving(false);
			return;
		}
		router.push("/admin/terms");
		router.refresh();
	}

	return (
		<div style={{ maxWidth: "560px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
				<Link href="/admin/terms" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>← Terms</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>New Term</h1>
			</div>
			<form onSubmit={handleSubmit} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{error && <div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>{error}</div>}
				<Field label="Term *">
					<input type="text" value={term} onChange={(e) => setTerm(e.target.value)} required disabled={saving} style={inputStyle} />
				</Field>
				<Field label="Definition *">
					<textarea value={definition} onChange={(e) => setDefinition(e.target.value)} required disabled={saving} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
				</Field>
				<Field label="Example">
					<textarea value={example} onChange={(e) => setExample(e.target.value)} disabled={saving} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
				</Field>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
					<Field label="Priority">
						<input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={saving} style={inputStyle} />
					</Field>
					<Field label="Type">
						<select value={termTypeId} onChange={(e) => setTermTypeId(e.target.value)} disabled={saving} style={{ ...inputStyle, cursor: "pointer" }}>
							<option value="">— none —</option>
							{termTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
						</select>
					</Field>
				</div>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button type="submit" disabled={saving} style={{ flex: 1, padding: "0.65rem", fontSize: "0.9rem", fontWeight: 600, color: saving ? "#5a5a7a" : "#0d0d1a", background: saving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer" }}>
						{saving ? "Creating…" : "Create Term"}
					</button>
					<Link href="/admin/terms" style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem", color: "#8888aa", border: "1px solid #2a2a4a", borderRadius: "8px", textAlign: "center" }}>Cancel</Link>
				</div>
			</form>
		</div>
	);
}
