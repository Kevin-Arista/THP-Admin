"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MixRow = {
	id: string;
	caption_count: number;
	humor_flavor_id: string;
	flavorSlug: string;
};

export default function HumorMixClient({ rows }: { rows: MixRow[] }) {
	const router = useRouter();
	const [editing, setEditing] = useState<Record<string, number>>({});
	const [saving, setSaving] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	function startEdit(id: string, current: number) {
		setEditing((prev) => ({ ...prev, [id]: current }));
	}

	async function saveEdit(id: string) {
		setSaving(id);
		setError(null);
		const res = await fetch(`/api/admin/humor-mix/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ caption_count: editing[id] }),
		});
		setSaving(null);
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to save.");
			return;
		}
		setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
		router.refresh();
	}

	const inputStyle: React.CSSProperties = {
		width: "80px",
		padding: "0.3rem 0.5rem",
		fontSize: "0.875rem",
		color: "#e0e0f0",
		background: "#11112a",
		border: "1px solid #4ecdc4",
		borderRadius: "6px",
		outline: "none",
	};

	return (
		<div>
			{error && (
				<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
					{error}
				</div>
			)}
			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Flavor</span>
					<span>Caption Count</span>
					<span></span>
				</div>
				{!rows.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No records found.</div>
				)}
				{rows.map((row, i) => {
					const isEditing = row.id in editing;
					const isSaving = saving === row.id;
					return (
						<div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < rows.length - 1 ? "1px solid #1e1e3a" : "none" }}>
							<span style={{ fontSize: "0.875rem", color: "#4ecdc4", fontFamily: "monospace" }}>{row.flavorSlug}</span>
							<span>
								{isEditing ? (
									<input
										type="number"
										value={editing[row.id]}
										onChange={(e) => setEditing((prev) => ({ ...prev, [row.id]: Number(e.target.value) }))}
										style={inputStyle}
										min={0}
									/>
								) : (
									<span style={{ fontSize: "0.875rem", color: "#f0f0ff" }}>{row.caption_count}</span>
								)}
							</span>
							<span style={{ display: "flex", gap: "0.4rem" }}>
								{isEditing ? (
									<>
										<button
											onClick={() => saveEdit(row.id)}
											disabled={isSaving}
											style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", fontWeight: 600, color: "#0d0d1a", background: isSaving ? "#2a2a4a" : "#4ecdc4", border: "none", borderRadius: "6px", cursor: isSaving ? "default" : "pointer" }}>
											{isSaving ? "…" : "Save"}
										</button>
										<button
											onClick={() => setEditing((prev) => { const n = { ...prev }; delete n[row.id]; return n; })}
											style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "#8888aa", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: "pointer" }}>
											✕
										</button>
									</>
								) : (
									<button
										onClick={() => startEdit(row.id, row.caption_count)}
										style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "#8888aa", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: "pointer" }}>
										Edit
									</button>
								)}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
