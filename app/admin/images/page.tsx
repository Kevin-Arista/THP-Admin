import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImagesClient from "./ImagesClient";

export default async function ImagesPage() {
	const supabase = await createClient();

	const { data: images, error } = await supabase
		.from("images")
		.select("id, url, image_description, is_public, created_datetime_utc")
		.order("created_datetime_utc", { ascending: false });

	const { data: captionRows } = await supabase
		.from("captions")
		.select("image_id");

	const captionCountMap: Record<string, number> = {};
	(captionRows ?? []).forEach((c) => {
		captionCountMap[c.image_id] = (captionCountMap[c.image_id] ?? 0) + 1;
	});

	return (
		<div style={{ maxWidth: "1000px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "1.5rem",
					gap: "1rem",
					flexWrap: "wrap",
				}}>
				<div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>
						Images
					</h1>
					<span style={{ fontSize: "0.8rem", color: "#5a5a7a" }}>
						{images?.length ?? 0} total
					</span>
				</div>
				<Link
					href="/admin/images/new"
					style={{
						padding: "0.5rem 1.25rem",
						fontSize: "0.85rem",
						fontWeight: 600,
						color: "#0d0d1a",
						background: "#4ecdc4",
						borderRadius: "8px",
						boxShadow: "0 0 12px rgba(78,205,196,0.3)",
					}}>
					+ New Image
				</Link>
			</div>

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
					{error.message}
				</div>
			)}

			<ImagesClient images={images ?? []} captionCountMap={captionCountMap} />
		</div>
	);
}
