"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Image = {
	id: string;
	url: string | null;
	image_description: string | null;
	is_public: boolean | null;
	created_datetime_utc: string | null;
};

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default function ImagesClient({
	images,
	captionCountMap,
}: {
	images: Image[];
	captionCountMap: Record<string, number>;
}) {
	const router = useRouter();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(id: string) {
		if (!confirm("Delete this image? Associated captions will be orphaned.")) return;
		setDeletingId(id);
		setError(null);
		const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setError(body.error ?? "Delete failed");
		} else {
			router.refresh();
		}
		setDeletingId(null);
	}

	return (
		<>
			{error && (
				<div
					style={{
						color: "#ff6b6b",
						background: "rgba(255,107,107,0.1)",
						border: "1px solid rgba(255,107,107,0.3)",
						borderRadius: "8px",
						padding: "0.75rem 1rem",
						marginBottom: "1rem",
						fontSize: "0.85rem",
					}}>
					{error}
				</div>
			)}

			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				{/* Header */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "64px 1fr 130px 60px 80px 110px",
						gap: "1rem",
						padding: "0.6rem 1.25rem",
						background: "#11112a",
						borderBottom: "1px solid #2a2a4a",
						fontSize: "0.7rem",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#5a5a7a",
					}}>
					<span>Preview</span>
					<span>Description</span>
					<span>Added</span>
					<span>Captions</span>
					<span>Visibility</span>
					<span>Actions</span>
				</div>

				{images.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1.5rem 1.25rem",
							fontSize: "0.85rem",
						}}>
						No images yet.{" "}
						<Link href="/admin/images/new" style={{ color: "#4ecdc4" }}>
							Add one
						</Link>
						.
					</p>
				) : (
					images.map((img, i) => (
						<div
							key={img.id}
							style={{
								display: "grid",
								gridTemplateColumns: "64px 1fr 130px 60px 80px 110px",
								gap: "1rem",
								padding: "0.75rem 1.25rem",
								borderBottom:
									i < images.length - 1 ? "1px solid #1e1e3a" : "none",
								alignItems: "center",
								fontSize: "0.83rem",
							}}>
							{/* Thumbnail */}
							<div
								style={{
									width: "64px",
									height: "48px",
									borderRadius: "6px",
									overflow: "hidden",
									background: "#1e1e3a",
									flexShrink: 0,
								}}>
								{img.url && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={img.url}
										alt={img.image_description ?? ""}
										style={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								)}
							</div>

							{/* Description */}
							<span
								style={{
									color: img.image_description ? "#e0e0f0" : "#3a3a5a",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}>
								{img.image_description ?? <em>no description</em>}
							</span>

							{/* Date */}
							<span style={{ color: "#5a5a7a", fontSize: "0.78rem" }}>
								{formatDate(img.created_datetime_utc)}
							</span>

							{/* Caption count */}
							<span
								style={{
									color:
										(captionCountMap[img.id] ?? 0) > 0 ? "#a78bfa" : "#3a3a5a",
									fontWeight: 600,
								}}>
								{captionCountMap[img.id] ?? 0}
							</span>

							{/* Visibility */}
							<span>
								{img.is_public ? (
									<span
										style={{
											fontSize: "0.7rem",
											color: "#4ecdc4",
											background: "rgba(78,205,196,0.1)",
											border: "1px solid rgba(78,205,196,0.3)",
											borderRadius: "4px",
											padding: "2px 6px",
											fontWeight: 600,
										}}>
										Public
									</span>
								) : (
									<span
										style={{
											fontSize: "0.7rem",
											color: "#8888aa",
											background: "rgba(255,255,255,0.03)",
											border: "1px solid #2a2a4a",
											borderRadius: "4px",
											padding: "2px 6px",
										}}>
										Private
									</span>
								)}
							</span>

							{/* Actions */}
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<Link
									href={`/admin/images/${img.id}`}
									style={{
										padding: "4px 10px",
										fontSize: "0.75rem",
										color: "#4ecdc4",
										border: "1px solid rgba(78,205,196,0.4)",
										borderRadius: "6px",
									}}>
									Edit
								</Link>
								<button
									onClick={() => handleDelete(img.id)}
									disabled={deletingId === img.id}
									style={{
										padding: "4px 10px",
										fontSize: "0.75rem",
										color: deletingId === img.id ? "#5a5a7a" : "#ff6b6b",
										border: `1px solid ${
											deletingId === img.id
												? "#2a2a4a"
												: "rgba(255,107,107,0.4)"
										}`,
										borderRadius: "6px",
										background: "transparent",
										cursor: deletingId === img.id ? "default" : "pointer",
									}}>
									{deletingId === img.id ? "…" : "Delete"}
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</>
	);
}
