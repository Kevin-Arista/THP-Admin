import { createClient } from "@/lib/supabase/server";

// ── helpers ───────────────────────────────────────────────────────────────────

function StatCard({
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: string | number;
	sub?: string;
	accent?: string;
}) {
	return (
		<div
			style={{
				background: "#16213e",
				border: "1px solid #2a2a4a",
				borderRadius: "12px",
				padding: "1.25rem 1.5rem",
			}}>
			<div style={{ fontSize: "0.75rem", color: "#5a5a7a", marginBottom: "0.4rem" }}>
				{label}
			</div>
			<div
				style={{
					fontSize: "2rem",
					fontWeight: 800,
					color: accent ?? "#f0f0ff",
					lineHeight: 1,
				}}>
				{value}
			</div>
			{sub && (
				<div style={{ fontSize: "0.75rem", color: "#5a5a7a", marginTop: "0.3rem" }}>
					{sub}
				</div>
			)}
		</div>
	);
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
	return (
		<div style={{ margin: "2rem 0 0.6rem" }}>
			<h2
				style={{
					fontSize: "0.7rem",
					fontWeight: 700,
					letterSpacing: "0.1em",
					textTransform: "uppercase",
					color: "#4ecdc4",
					marginBottom: description ? "0.3rem" : 0,
				}}>
				{title}
			</h2>
			{description && (
				<p style={{ fontSize: "0.775rem", color: "#5a5a7a", lineHeight: 1.5 }}>
					{description}
				</p>
			)}
		</div>
	);
}

function Bar({ pct, color }: { pct: number; color: string }) {
	return (
		<div
			style={{
				height: "6px",
				borderRadius: "3px",
				background: "#1e1e3a",
				overflow: "hidden",
				flex: 1,
			}}>
			<div
				style={{
					width: `${pct}%`,
					height: "100%",
					background: color,
					borderRadius: "3px",
				}}
			/>
		</div>
	);
}

function FunnelStep({
	label,
	value,
	pct,
	color,
	isLast,
}: {
	label: string;
	value: number;
	pct: number;
	color: string;
	isLast?: boolean;
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
			<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
				<span style={{ color: "#e0e0f0" }}>{label}</span>
				<span style={{ color, fontWeight: 700 }}>{value.toLocaleString()}</span>
			</div>
			<div
				style={{
					height: "8px",
					borderRadius: "4px",
					background: "#1e1e3a",
					overflow: "hidden",
				}}>
				<div
					style={{
						width: `${pct}%`,
						height: "100%",
						background: color,
						borderRadius: "4px",
					}}
				/>
			</div>
			{!isLast && (
				<div style={{ textAlign: "center", color: "#3a3a5a", fontSize: "0.7rem" }}>↓</div>
			)}
		</div>
	);
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
	const supabase = await createClient();

	// ── core counts ──────────────────────────────────────────────────────────
	const [
		{ count: userCount },
		{ count: imageCount },
		{ count: captionCount },
		{ count: voteCount },
		{ count: publicImageCount },
		{ count: superadminCount },
	] = await Promise.all([
		supabase.from("profiles").select("*", { count: "exact", head: true }),
		supabase.from("images").select("*", { count: "exact", head: true }),
		supabase.from("captions").select("*", { count: "exact", head: true }),
		supabase.from("caption_votes").select("*", { count: "exact", head: true }),
		supabase
			.from("images")
			.select("*", { count: "exact", head: true })
			.eq("is_public", true),
		supabase
			.from("profiles")
			.select("*", { count: "exact", head: true })
			.eq("is_superadmin", true),
	]);

	// ── all votes ─────────────────────────────────────────────────────────────
	const { data: allVoteRows } = await supabase
		.from("caption_votes")
		.select("caption_id, vote_value, profile_id");

	const upMap: Record<string, number> = {};
	const downMap: Record<string, number> = {};
	const voterCounts: Record<string, number> = {};

	(allVoteRows ?? []).forEach((v) => {
		const id = v.caption_id;
		if (v.vote_value > 0) upMap[id] = (upMap[id] ?? 0) + 1;
		else downMap[id] = (downMap[id] ?? 0) + 1;
		voterCounts[v.profile_id] = (voterCounts[v.profile_id] ?? 0) + 1;
	});

	const upvotes = Object.values(upMap).reduce((s, n) => s + n, 0);
	const downvotes = Object.values(downMap).reduce((s, n) => s + n, 0);
	const totalVotes = upvotes + downvotes;
	const upPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

	// ── all captions ─────────────────────────────────────────────────────────
	const { data: allCaptions } = await supabase
		.from("captions")
		.select("id, content, image_id")
		.not("content", "is", null);

	const avgLen =
		allCaptions && allCaptions.length > 0
			? Math.round(
					allCaptions.reduce((s, c) => s + (c.content?.length ?? 0), 0) /
						allCaptions.length,
				)
			: 0;

	// captions that have received at least one vote
	const votedCaptionIds = new Set([
		...Object.keys(upMap),
		...Object.keys(downMap),
	]);
	const engagedCaptionCount = allCaptions
		? allCaptions.filter((c) => votedCaptionIds.has(c.id)).length
		: 0;
	const engagementRate =
		allCaptions && allCaptions.length > 0
			? Math.round((engagedCaptionCount / allCaptions.length) * 100)
			: 0;

	// images without any captions (content gaps)
	const captionedImageIds = new Set(
		(allCaptions ?? []).map((c) => c.image_id).filter(Boolean),
	);
	const { data: allImages } = await supabase.from("images").select("id");
	const orphanedImageCount = (allImages ?? []).filter(
		(img) => !captionedImageIds.has(img.id),
	).length;

	// avg votes per captioned caption
	const avgVotesPerCaption =
		captionCount && captionCount > 0
			? (totalVotes / captionCount).toFixed(1)
			: "0";

	// ── controversy score ─────────────────────────────────────────────────────
	const allIds = [...new Set([...Object.keys(upMap), ...Object.keys(downMap)])];
	const controversial = allIds
		.map((id) => {
			const u = upMap[id] ?? 0;
			const d = downMap[id] ?? 0;
			const score = Math.min(u, d) / Math.max(u, d, 1);
			return { id, u, d, score, total: u + d };
		})
		.filter((x) => x.total >= 3)
		.sort((a, b) => b.score - a.score || b.total - a.total)
		.slice(0, 5);

	// ── most loved ────────────────────────────────────────────────────────────
	const topLovedIds = Object.entries(upMap)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([id]) => id);

	// ── caption length distribution ───────────────────────────────────────────
	// short < 60, medium 60-120, long > 120
	const lenBuckets = { short: 0, medium: 0, long: 0 };
	(allCaptions ?? []).forEach((c) => {
		const len = c.content?.length ?? 0;
		if (len < 60) lenBuckets.short++;
		else if (len <= 120) lenBuckets.medium++;
		else lenBuckets.long++;
	});
	const totalCaptions = (allCaptions ?? []).length || 1;

	// ── fetch caption text ────────────────────────────────────────────────────
	const fetchIds = [
		...new Set([...topLovedIds, ...controversial.map((c) => c.id)]),
	];
	const { data: captionRows } = fetchIds.length
		? await supabase.from("captions").select("id, content").in("id", fetchIds)
		: { data: [] };

	const captionMap: Record<string, string> = {};
	(captionRows ?? []).forEach((c) => {
		captionMap[c.id] = c.content ?? "(no content)";
	});

	// ── top voters ────────────────────────────────────────────────────────────
	const topVoterIds = Object.entries(voterCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const { data: profileRows } = topVoterIds.length
		? await supabase
				.from("profiles")
				.select("id, first_name, last_name, email")
				.in(
					"id",
					topVoterIds.map(([id]) => id),
				)
		: { data: [] };

	const profileMap: Record<string, string> = {};
	(profileRows ?? []).forEach((p) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const row = p as any;
		const first = row.first_name?.trim() || null;
		const last = row.last_name?.trim() || null;
		profileMap[row.id] =
			first && last
				? `${first} ${last}`
				: first ?? last ?? row.email ?? `User …${row.id.slice(-6)}`;
	});

	// ── batting averages (top-voted captions' positivity rate) ────────────────
	const battingAverages = Object.entries(upMap)
		.map(([id, u]) => {
			const d = downMap[id] ?? 0;
			const total = u + d;
			return { id, u, d, total, pct: Math.round((u / total) * 100) };
		})
		.filter((x) => x.total >= 5)
		.sort((a, b) => b.pct - a.pct || b.total - a.total)
		.slice(0, 5);

	const battingIds = battingAverages.map((b) => b.id);
	const { data: battingCaptionRows } = battingIds.length
		? await supabase.from("captions").select("id, content").in("id", battingIds)
		: { data: [] };
	const battingCaptionMap: Record<string, string> = {};
	(battingCaptionRows ?? []).forEach((c) => {
		battingCaptionMap[c.id] = c.content ?? "(no content)";
	});

	const privateImageCount = (imageCount ?? 0) - (publicImageCount ?? 0);
	const maxVoterCount = topVoterIds[0]?.[1] ?? 1;

	// funnel
	const funnelMax = Math.max(userCount ?? 0, imageCount ?? 0, captionCount ?? 0, voteCount ?? 0, 1);

	return (
		<div style={{ maxWidth: "920px" }}>
			<h1
				style={{
					fontSize: "1.4rem",
					fontWeight: 800,
					color: "#f0f0ff",
					marginBottom: "0.25rem",
				}}>
				Dashboard
			</h1>
			<p style={{ color: "#5a5a7a", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
				Live platform stats — pulled fresh from Supabase
			</p>

			{/* ── Overview ─────────────────────────────────────────────── */}
			<SectionHeader
				title="Overview"
				description="High-level platform counts."
			/>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
					gap: "0.75rem",
				}}>
				<StatCard label="Users" value={userCount ?? 0} accent="#4ecdc4" />
				<StatCard
					label="Superadmins"
					value={superadminCount ?? 0}
					accent="#f59e0b"
				/>
				<StatCard label="Images" value={imageCount ?? 0} />
				<StatCard label="Captions" value={captionCount ?? 0} />
				<StatCard label="Total Votes" value={voteCount ?? 0} />
				<StatCard
					label="Avg Caption Length"
					value={`${avgLen} chars`}
					accent="#a78bfa"
				/>
			</div>

			{/* ── Content Pipeline (Funnel) ────────────────────────────── */}
			<SectionHeader
				title="Content Pipeline"
				description="How content moves from users through images and captions to community votes. Bars show each stage relative to the largest."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.6rem",
				}}>
				<FunnelStep
					label="Registered Users"
					value={userCount ?? 0}
					pct={Math.round(((userCount ?? 0) / funnelMax) * 100)}
					color="#4ecdc4"
				/>
				<FunnelStep
					label="Images"
					value={imageCount ?? 0}
					pct={Math.round(((imageCount ?? 0) / funnelMax) * 100)}
					color="#a78bfa"
				/>
				<FunnelStep
					label="Captions Generated"
					value={captionCount ?? 0}
					pct={Math.round(((captionCount ?? 0) / funnelMax) * 100)}
					color="#f59e0b"
				/>
				<FunnelStep
					label="Votes Cast"
					value={voteCount ?? 0}
					pct={Math.round(((voteCount ?? 0) / funnelMax) * 100)}
					color="#ff6b6b"
					isLast
				/>
			</div>

			{/* ── Caption Health ───────────────────────────────────────── */}
			<SectionHeader
				title="Caption Health"
				description="How well the community is engaging with captions. Engagement rate = % of captions with at least one vote."
			/>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
					gap: "0.75rem",
				}}>
				<StatCard
					label="Engagement Rate"
					value={`${engagementRate}%`}
					sub={`${engagedCaptionCount} of ${captionCount ?? 0} voted`}
					accent={engagementRate >= 50 ? "#4ecdc4" : "#f59e0b"}
				/>
				<StatCard
					label="Avg Votes / Caption"
					value={avgVotesPerCaption}
					accent="#a78bfa"
				/>
				<StatCard
					label="Images Without Captions"
					value={orphanedImageCount}
					sub="content gaps"
					accent={orphanedImageCount > 0 ? "#ff6b6b" : "#4ecdc4"}
				/>
				<StatCard
					label="Awaiting Votes"
					value={(captionCount ?? 0) - engagedCaptionCount}
					sub="captions not yet seen"
					accent="#5a5a7a"
				/>
			</div>

			{/* ── Caption Length Distribution ──────────────────────────── */}
			<SectionHeader
				title="Caption Length Distribution"
				description="Short < 60 chars · Medium 60–120 · Long > 120. Shows whether AI tends to write brief quips or elaborate captions."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.25rem 1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
				}}>
				{(
					[
						{ label: "Short  (< 60 chars)", count: lenBuckets.short, color: "#4ecdc4" },
						{ label: "Medium (60–120 chars)", count: lenBuckets.medium, color: "#a78bfa" },
						{ label: "Long   (> 120 chars)", count: lenBuckets.long, color: "#f59e0b" },
					] as const
				).map(({ label, count, color }) => (
					<div
						key={label}
						style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<span
							style={{
								fontSize: "0.78rem",
								color: "#8888aa",
								minWidth: "160px",
								fontVariantNumeric: "tabular-nums",
							}}>
							{label}
						</span>
						<Bar
							pct={Math.round((count / totalCaptions) * 100)}
							color={color}
						/>
						<span
							style={{
								fontSize: "0.78rem",
								color,
								minWidth: "60px",
								textAlign: "right",
							}}>
							{count} ({Math.round((count / totalCaptions) * 100)}%)
						</span>
					</div>
				))}
			</div>

			{/* ── Vote Sentiment ───────────────────────────────────────── */}
			<SectionHeader
				title="Vote Sentiment"
				description="Swipe right = upvote (+1), swipe left = downvote (−1). Overall community mood across every vote ever cast."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.25rem 1.5rem",
				}}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "1rem",
						marginBottom: "0.75rem",
					}}>
					<span style={{ fontSize: "0.8rem", color: "#4ecdc4", minWidth: "90px" }}>
						👍 {upvotes.toLocaleString()}
					</span>
					<Bar pct={upPct} color="#4ecdc4" />
					<span style={{ fontSize: "0.8rem", color: "#5a5a7a", minWidth: "40px" }}>
						{upPct}%
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
					<span style={{ fontSize: "0.8rem", color: "#ff6b6b", minWidth: "90px" }}>
						👎 {downvotes.toLocaleString()}
					</span>
					<Bar pct={100 - upPct} color="#ff6b6b" />
					<span style={{ fontSize: "0.8rem", color: "#5a5a7a", minWidth: "40px" }}>
						{100 - upPct}%
					</span>
				</div>
			</div>

			{/* ── Image Visibility ─────────────────────────────────────── */}
			<SectionHeader
				title="Image Visibility"
				description="Public images appear in the voting feed. Private images are staged but hidden from users."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.25rem 1.5rem",
					display: "flex",
					gap: "2rem",
					alignItems: "center",
				}}>
				<div style={{ textAlign: "center" }}>
					<div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4ecdc4" }}>
						{publicImageCount ?? 0}
					</div>
					<div style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>Public</div>
				</div>
				<div
					style={{
						flex: 1,
						height: "16px",
						borderRadius: "8px",
						background: "#1e1e3a",
						overflow: "hidden",
					}}>
					<div
						style={{
							width: `${
								(imageCount ?? 0) > 0
									? Math.round(((publicImageCount ?? 0) / (imageCount ?? 1)) * 100)
									: 0
							}%`,
							height: "100%",
							background: "#4ecdc4",
						}}
					/>
				</div>
				<div style={{ textAlign: "center" }}>
					<div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#3a3a5a" }}>
						{privateImageCount}
					</div>
					<div style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>Private</div>
				</div>
			</div>

			{/* ── Caption Batting Averages ─────────────────────────────── */}
			<SectionHeader
				title="Caption Batting Averages"
				description="Among captions with 5+ total votes: which ones have the highest positivity rate (upvotes ÷ total votes)? A 100% average means every voter loved it."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				{battingAverages.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1rem 1.5rem",
							fontSize: "0.85rem",
						}}>
						Need 5+ votes on at least one caption to show batting averages.
					</p>
				) : (
					battingAverages.map((b, i) => (
						<div
							key={b.id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								padding: "0.75rem 1.5rem",
								borderBottom:
									i < battingAverages.length - 1 ? "1px solid #1e1e3a" : "none",
							}}>
							<span
								style={{
									fontSize: "0.75rem",
									fontWeight: 700,
									color:
										b.pct === 100
											? "#4ecdc4"
											: b.pct >= 80
												? "#a78bfa"
												: "#f59e0b",
									minWidth: "44px",
								}}>
								{b.pct}%
							</span>
							<span
								style={{
									fontSize: "0.82rem",
									color: "#e0e0f0",
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}>
								{(battingCaptionMap[b.id] ?? "").slice(0, 90)}
								{(battingCaptionMap[b.id] ?? "").length > 90 ? "…" : ""}
							</span>
							<span style={{ fontSize: "0.75rem", color: "#5a5a7a", whiteSpace: "nowrap" }}>
								<span style={{ color: "#4ecdc4" }}>+{b.u}</span>
								{" / "}
								<span style={{ color: "#ff6b6b" }}>-{b.d}</span>
							</span>
						</div>
					))
				)}
			</div>

			{/* ── Most Loved Captions ──────────────────────────────────── */}
			<SectionHeader
				title="Most Loved Captions"
				description="Top 5 captions by raw upvote count — the crowd's absolute favourite lines."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				{topLovedIds.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1rem 1.5rem",
							fontSize: "0.85rem",
						}}>
						No votes recorded yet.
					</p>
				) : (
					topLovedIds.map((id, i) => (
						<div
							key={id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								padding: "0.75rem 1.5rem",
								borderBottom:
									i < topLovedIds.length - 1 ? "1px solid #1e1e3a" : "none",
							}}>
							<span
								style={{
									fontSize: "0.75rem",
									fontWeight: 700,
									color: "#4ecdc4",
									minWidth: "20px",
								}}>
								#{i + 1}
							</span>
							<span style={{ fontSize: "0.82rem", color: "#e0e0f0", flex: 1 }}>
								{(captionMap[id] ?? "").slice(0, 100)}
								{(captionMap[id] ?? "").length > 100 ? "…" : ""}
							</span>
							<span
								style={{ fontSize: "0.8rem", color: "#4ecdc4", whiteSpace: "nowrap" }}>
								👍 {upMap[id] ?? 0}
							</span>
						</div>
					))
				)}
			</div>

			{/* ── Most Controversial ───────────────────────────────────── */}
			<SectionHeader
				title="Most Controversial Captions"
				description="Scored by how evenly upvotes and downvotes are split (1.0 = perfectly 50/50). Minimum 3 votes to qualify."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				{controversial.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1rem 1.5rem",
							fontSize: "0.85rem",
						}}>
						Not enough votes for controversy analysis yet.
					</p>
				) : (
					controversial.map((c, i) => (
						<div
							key={c.id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								padding: "0.75rem 1.5rem",
								borderBottom:
									i < controversial.length - 1 ? "1px solid #1e1e3a" : "none",
							}}>
							<span
								style={{
									fontSize: "0.75rem",
									fontWeight: 700,
									color: "#f59e0b",
									minWidth: "20px",
								}}>
								#{i + 1}
							</span>
							<span style={{ fontSize: "0.82rem", color: "#e0e0f0", flex: 1 }}>
								{(captionMap[c.id] ?? "").slice(0, 100)}
								{(captionMap[c.id] ?? "").length > 100 ? "…" : ""}
							</span>
							<span
								style={{
									fontSize: "0.75rem",
									color: "#8888aa",
									whiteSpace: "nowrap",
								}}>
								<span style={{ color: "#4ecdc4" }}>+{c.u}</span>
								{" / "}
								<span style={{ color: "#ff6b6b" }}>-{c.d}</span>
							</span>
						</div>
					))
				)}
			</div>

			{/* ── Most Active Voters ───────────────────────────────────── */}
			<SectionHeader
				title="Most Active Voters"
				description="Users who have cast the most total votes (upvotes + downvotes). Bar shows count relative to the top voter."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
					marginBottom: "2rem",
				}}>
				{topVoterIds.length === 0 ? (
					<p
						style={{
							color: "#5a5a7a",
							padding: "1rem 1.5rem",
							fontSize: "0.85rem",
						}}>
						No votes recorded yet.
					</p>
				) : (
					topVoterIds.map(([id, count], i) => {
						const pct = Math.round((count / maxVoterCount) * 100);
						return (
							<div
								key={id}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "1rem",
									padding: "0.65rem 1.5rem",
									borderBottom:
										i < topVoterIds.length - 1 ? "1px solid #1e1e3a" : "none",
								}}>
								<span
									style={{
										fontSize: "0.75rem",
										fontWeight: 700,
										color: "#a78bfa",
										minWidth: "20px",
									}}>
									#{i + 1}
								</span>
								<span
									style={{
										fontSize: "0.82rem",
										color: "#e0e0f0",
										minWidth: "140px",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}>
									{profileMap[id] ?? `…${id.slice(-8)}`}
								</span>
								<Bar pct={pct} color="#a78bfa" />
								<span
									style={{
										fontSize: "0.8rem",
										color: "#a78bfa",
										minWidth: "55px",
										textAlign: "right",
									}}>
									{count} votes
								</span>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
