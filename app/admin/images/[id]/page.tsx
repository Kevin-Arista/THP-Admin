"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ImageRow = {
	id: string;
	url: string | null;
	image_description: string | null;
	is_public: boolean | null;
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
			<label
				style={{
					fontSize: "0.75rem",
					fontWeight: 600,
					color: "#8888aa",
					letterSpacing: "0.05em",
				}}>
				{label}
			</label>
			{children}
		</div>
	);
}

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

export default function EditImagePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [image, setImage] = useState<ImageRow | null>(null);
	const [url, setUrl] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			const supabase = createClient();
			const { data, error } = await supabase
				.from("images")
				.select("id, url, image_description, is_public")
				.eq("id", params.id)
				.single();

			if (error || !data) {
				setError("Image not found.");
				setLoading(false);
				return;
			}

			const row = data as ImageRow;
			setImage(row);
			setUrl(row.url ?? "");
			setDescription(row.image_description ?? "");
			setIsPublic(row.is_public ?? false);
			setLoading(false);
		}
		load();
	}, [params.id]);

	async function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (!url.trim()) {
			setError("URL is required.");
			return;
		}
		setSaving(true);
		setError(null);

		const res = await fetch(`/api/admin/images/${params.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				url: url.trim(),
				image_description: description.trim() || null,
				is_public: isPublic,
			}),
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Save failed.");
			setSaving(false);
			return;
		}

		router.push("/admin/images");
		router.refresh();
	}

	async function handleDelete() {
		if (!confirm("Permanently delete this image?")) return;
		setDeleting(true);
		setError(null);

		const res = await fetch(`/api/admin/images/${params.id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Delete failed.");
			setDeleting(false);
			return;
		}

		router.push("/admin/images");
		router.refresh();
	}

	if (loading) {
		return <p style={{ color: "#5a5a7a", fontSize: "0.9rem" }}>Loading…</p>;
	}

	return (
		<div style={{ maxWidth: "560px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.75rem",
					marginBottom: "1.75rem",
				}}>
				<Link href="/admin/images" style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>
					← Images
				</Link>
				<span style={{ color: "#2a2a4a" }}>/</span>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>
					Edit Image
				</h1>
			</div>

			<form
				onSubmit={handleSave}
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.75rem",
					display: "flex",
					flexDirection: "column",
					gap: "1.25rem",
				}}>
				{error && (
					<div
						style={{
							color: "#ff6b6b",
							background: "rgba(255,107,107,0.1)",
							border: "1px solid rgba(255,107,107,0.3)",
							borderRadius: "8px",
							padding: "0.6rem 0.9rem",
							fontSize: "0.85rem",
						}}>
						{error}
					</div>
				)}

				<FormField label="Image URL *">
					<input
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://example.com/image.jpg"
						required
						style={inputStyle}
					/>
				</FormField>

				{url && (
					<div
						style={{
							borderRadius: "8px",
							overflow: "hidden",
							background: "#1e1e3a",
							maxHeight: "200px",
						}}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={url}
							alt="Preview"
							style={{
								width: "100%",
								maxHeight: "200px",
								objectFit: "cover",
								display: "block",
							}}
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					</div>
				)}

				<FormField label="Description">
					<input
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="A brief description of this image"
						style={inputStyle}
					/>
				</FormField>

				<FormField label="Visibility">
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.6rem",
							cursor: "pointer",
							fontSize: "0.875rem",
							color: "#e0e0f0",
						}}>
						<input
							type="checkbox"
							checked={isPublic}
							onChange={(e) => setIsPublic(e.target.checked)}
							style={{ width: "16px", height: "16px", accentColor: "#4ecdc4" }}
						/>
						Make image public
					</label>
				</FormField>

				<div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
					<button
						type="submit"
						disabled={saving || deleting}
						style={{
							flex: 1,
							padding: "0.65rem",
							fontSize: "0.9rem",
							fontWeight: 600,
							color: saving ? "#5a5a7a" : "#0d0d1a",
							background: saving ? "#2a2a4a" : "#4ecdc4",
							border: "none",
							borderRadius: "8px",
							cursor: saving || deleting ? "default" : "pointer",
							transition: "background 0.2s",
						}}>
						{saving ? "Saving…" : "Save Changes"}
					</button>

					<button
						type="button"
						onClick={handleDelete}
						disabled={deleting || saving}
						style={{
							padding: "0.65rem 1.25rem",
							fontSize: "0.9rem",
							fontWeight: 600,
							color: deleting ? "#5a5a7a" : "#ff6b6b",
							background: "transparent",
							border: `1px solid ${deleting ? "#2a2a4a" : "rgba(255,107,107,0.4)"}`,
							borderRadius: "8px",
							cursor: deleting || saving ? "default" : "pointer",
						}}>
						{deleting ? "Deleting…" : "Delete"}
					</button>

					<Link
						href="/admin/images"
						style={{
							padding: "0.65rem 1.25rem",
							fontSize: "0.9rem",
							color: "#8888aa",
							border: "1px solid #2a2a4a",
							borderRadius: "8px",
							textAlign: "center",
						}}>
						Cancel
					</Link>
				</div>

				{image && (
					<p style={{ fontSize: "0.7rem", color: "#3a3a5a", marginTop: "0.5rem" }}>
						ID: {image.id}
					</p>
				)}
			</form>
		</div>
	);
}
