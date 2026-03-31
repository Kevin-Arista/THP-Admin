import { createClient } from "@/lib/supabase/server";

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default async function CaptionsPage() {
	const supabase = await createClient();

	const { data: captions, error } = await supabase
		.from("captions")
		.select(
			`id, content, created_datetime_utc, like_count, image_id,
			images (id, url, image_description)`,
		)
		.order("created_datetime_utc", { ascending: false });

	const { data: allVotes } = await supabase
		.from("caption_votes")
		.select("caption_id, vote_value");

	const upMap: Record<string, number> = {};
	const downMap: Record<string, number> = {};
	(allVotes ?? []).forEach((v) => {
		if (v.vote_value > 0) upMap[v.caption_id] = (upMap[v.caption_id] ?? 0) + 1;
		else downMap[v.caption_id] = (downMap[v.caption_id] ?? 0) + 1;
	});

	return (
		<div style={{ maxWidth: "1100px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: "1rem",
					marginBottom: "1.5rem",
				}}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>
					Captions
				</h1>
				<span style={{ fontSize: "0.8rem", color: "#5a5a7a" }}>
					{captions?.length ?? 0} total · read-only
				</span>
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
						gridTemplateColumns: "48px 1fr 120px 110px 100px",
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
					<span>Img</span>
					<span>Caption</span>
					<span>Image</span>
					<span>Votes ↑ / ↓</span>
					<span>Created</span>
				</div>

				{!captions || captions.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1.5rem 1.25rem",
							fontSize: "0.85rem",
						}}>
						No captions found.
					</p>
				) : (
					captions.map((c, i) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const img = (c as any).images as
							| { url: string; image_description: string | null }
							| null;
						const up = upMap[c.id] ?? 0;
						const down = downMap[c.id] ?? 0;
						const net = up - down;

						return (
							<div
								key={c.id}
								style={{
									display: "grid",
									gridTemplateColumns: "48px 1fr 120px 110px 100px",
									gap: "1rem",
									padding: "0.75rem 1.25rem",
									borderBottom:
										i < captions.length - 1 ? "1px solid #1e1e3a" : "none",
									alignItems: "center",
									fontSize: "0.83rem",
								}}>
								{/* Thumbnail */}
								<div
									style={{
										width: "48px",
										height: "36px",
										borderRadius: "6px",
										overflow: "hidden",
										background: "#1e1e3a",
										flexShrink: 0,
									}}>
									{img?.url && (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={img.url}
											alt={img.image_description ?? ""}
											style={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									)}
								</div>

								{/* Caption text */}
								<span style={{ color: "#e0e0f0", lineHeight: 1.4, fontSize: "0.82rem" }}>
									{c.content ?? <span style={{ color: "#3a3a5a" }}>—</span>}
								</span>

								{/* Image description */}
								<span
									style={{
										color: "#5a5a7a",
										fontSize: "0.75rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}>
									{img?.image_description ?? "—"}
								</span>

								{/* Votes */}
								<span style={{ fontSize: "0.8rem" }}>
									<span style={{ color: "#4ecdc4" }}>+{up}</span>
									<span style={{ color: "#3a3a5a", margin: "0 3px" }}>/</span>
									<span style={{ color: "#ff6b6b" }}>-{down}</span>{" "}
									<span
										style={{
											color:
												net > 0 ? "#4ecdc4" : net < 0 ? "#ff6b6b" : "#5a5a7a",
											fontSize: "0.72rem",
										}}>
										({net > 0 ? "+" : ""}
										{net})
									</span>
								</span>

								{/* Date */}
								<span style={{ color: "#5a5a7a", fontSize: "0.78rem" }}>
									{formatDate(c.created_datetime_utc ?? null)}
								</span>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
