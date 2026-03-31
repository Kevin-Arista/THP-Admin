"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function NewImagePage() {
	const router = useRouter();
	const [mode, setMode] = useState<"url" | "upload">("url");
	const [url, setUrl] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0] ?? null;
		setFile(f);
		if (f) {
			const reader = new FileReader();
			reader.onload = (ev) => setFilePreview(ev.target?.result as string);
			reader.readAsDataURL(f);
		} else {
			setFilePreview(null);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);

		let finalUrl = url.trim();

		if (mode === "upload") {
			if (!file) {
				setError("Please select a file to upload.");
				setSaving(false);
				return;
			}
			const fd = new FormData();
			fd.append("file", file);
			const uploadRes = await fetch("/api/admin/images/upload", { method: "POST", body: fd });
			if (!uploadRes.ok) {
				const body = await uploadRes.json().catch(() => ({}));
				setError(body.error ?? "Upload failed.");
				setSaving(false);
				return;
			}
			const { url: uploadedUrl } = await uploadRes.json();
			finalUrl = uploadedUrl;
		}

		if (!finalUrl) {
			setError("URL is required.");
			setSaving(false);
			return;
		}

		const res = await fetch("/api/admin/images", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				url: finalUrl,
				image_description: description.trim() || null,
				is_public: isPublic,
			}),
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Failed to create image.");
			setSaving(false);
			return;
		}

		router.push("/admin/images");
		router.refresh();
	}

	const previewSrc = mode === "upload" ? filePreview : url;

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
					New Image
				</h1>
			</div>

			<form
				onSubmit={handleSubmit}
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

				{/* Mode toggle */}
				<div style={{ display: "flex", gap: "0.5rem" }}>
					{(["url", "upload"] as const).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setMode(m)}
							style={{
								padding: "0.4rem 0.9rem",
								fontSize: "0.8rem",
								fontWeight: 600,
								color: mode === m ? "#0d0d1a" : "#8888aa",
								background: mode === m ? "#4ecdc4" : "transparent",
								border: `1px solid ${mode === m ? "#4ecdc4" : "#2a2a4a"}`,
								borderRadius: "6px",
								cursor: "pointer",
							}}>
							{m === "url" ? "URL" : "Upload File"}
						</button>
					))}
				</div>

				{mode === "url" ? (
					<FormField label="Image URL *">
						<input
							type="url"
							value={url ?? ""}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/image.jpg"
							required
							disabled={saving}
							style={inputStyle}
						/>
					</FormField>
				) : (
					<FormField label="Image File *">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							disabled={saving}
							style={{ ...inputStyle, padding: "0.4rem 0.75rem", cursor: "pointer" }}
						/>
					</FormField>
				)}

				{previewSrc && (
					<div
						style={{
							borderRadius: "8px",
							overflow: "hidden",
							background: "#1e1e3a",
							maxHeight: "200px",
						}}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={previewSrc}
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
						disabled={saving}
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
							disabled={saving}
							style={{ width: "16px", height: "16px", accentColor: "#4ecdc4" }}
						/>
						Make image public
					</label>
				</FormField>

				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button
						type="submit"
						disabled={saving}
						style={{
							flex: 1,
							padding: "0.65rem",
							fontSize: "0.9rem",
							fontWeight: 600,
							color: saving ? "#5a5a7a" : "#0d0d1a",
							background: saving ? "#2a2a4a" : "#4ecdc4",
							border: "none",
							borderRadius: "8px",
							cursor: saving ? "default" : "pointer",
							transition: "background 0.2s",
						}}>
						{saving ? (mode === "upload" ? "Uploading…" : "Creating…") : "Create Image"}
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
			</form>
		</div>
	);
}
