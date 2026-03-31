"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Example = {
	id: string;
	image_description: string;
	caption: string;
	priority: number | null;
};

export default function CaptionExamplesClient({ examples }: { examples: Example[] }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string) {
		if (!confirm("Delete this caption example?")) return;
		setDeleting(id);
		setError(null);
		const res = await fetch(`/api/admin/caption-examples/${id}`, { method: "DELETE" });
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
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px 80px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>Image Description</span>
					<span>Caption</span>
					<span>Priority</span>
					<span></span>
				</div>
				{!examples.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No examples found.</div>
				)}
				{examples.map((ex, i) => (
					<div key={ex.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px 80px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < examples.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.85rem", color: "#c0c0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.image_description}</span>
						<span style={{ fontSize: "0.8rem", color: "#8888aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.caption}</span>
						<span style={{ fontSize: "0.8rem", color: "#f59e0b" }}>{ex.priority ?? "—"}</span>
						<span style={{ display: "flex", gap: "0.35rem" }}>
							<Link href={`/admin/caption-examples/${ex.id}`} style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "#4ecdc4", border: "1px solid #2a2a4a", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
							<button
								onClick={() => handleDelete(ex.id)}
								disabled={deleting === ex.id}
								style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: deleting === ex.id ? "#5a5a7a" : "#ff6b6b", background: "transparent", border: "1px solid #2a2a4a", borderRadius: "6px", cursor: deleting === ex.id ? "default" : "pointer" }}>
								{deleting === ex.id ? "…" : "Del"}
							</button>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
