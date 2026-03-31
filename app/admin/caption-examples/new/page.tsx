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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
			<label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.05em" }}>{label}</label>
			{children}
		</div>
	);
}

export default function NewCaptionExamplePage() {
	const router = useRouter();
	const [imageDescription, setImageDescription] = useState("");
	const [caption, setCaption] = useState("");
	const [explanation, setExplanation] = useState("");
	const [priority, setPriority] = useState("");
	const [imageId, setImageId] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		const res = await fetch("/api/admin/caption-examples", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ image_description: imageDescription.trim(), caption: caption.trim(), explanation: explanation.trim() || null, priority: priority ? Number(priority) : null, image_id: imageId.trim() || null }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to create.");
			setSaving(false);
			return;
		}
		router.push("/admin/caption-examples");
		router.refresh();
	}

	return (
		<div style={{ maxWidth: "560px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
				<Link href="/admin/caption-examples" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>← Caption Examples</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>New Example</h1>
			</div>
			<form onSubmit={handleSubmit} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{error && <div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>{error}</div>}
				<Field label="Image Description *">
					<textarea value={imageDescription} onChange={(e) => setImageDescription(e.target.value)} required disabled={saving} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
				</Field>
				<Field label="Caption *">
					<textarea value={caption} onChange={(e) => setCaption(e.target.value)} required disabled={saving} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
				</Field>
				<Field label="Explanation">
					<textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} disabled={saving} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
				</Field>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
					<Field label="Priority">
						<input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={saving} style={inputStyle} />
					</Field>
					<Field label="Image ID (optional)">
						<input type="text" value={imageId} onChange={(e) => setImageId(e.target.value)} disabled={saving} placeholder="UUID" style={inputStyle} />
					</Field>
				</div>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button type="submit" disabled={saving} style={{ flex: 1, padding: "0.65rem", fontSize: "0.9rem", fontWeight: 600, color: saving ? "#5a5a7a" : "#0d0d1a", background: saving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer" }}>
						{saving ? "Creating…" : "Create Example"}
					</button>
					<Link href="/admin/caption-examples" style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem", color: "#8888aa", border: "1px solid #2a2a4a", borderRadius: "8px", textAlign: "center" }}>Cancel</Link>
				</div>
			</form>
		</div>
	);
}
