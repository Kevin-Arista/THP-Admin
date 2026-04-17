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

function CaptionRow({
	rank,
	text,
	up,
	down,
	net,
	total,
	rankColor,
	isLast,
}: {
	rank: number;
	text: string;
	up: number;
	down: number;
	net: number;
	total: number;
	rankColor: string;
	isLast: boolean;
}) {
	const netColor = net > 0 ? "#4ecdc4" : net < 0 ? "#ff6b6b" : "#5a5a7a";
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "28px 1fr 90px 70px",
				gap: "1rem",
				padding: "0.7rem 1.5rem",
				borderBottom: isLast ? "none" : "1px solid #1e1e3a",
				alignItems: "center",
			}}>
			<span style={{ fontSize: "0.75rem", fontWeight: 700, color: rankColor }}>
				#{rank}
			</span>
			<span
				style={{
					fontSize: "0.82rem",
					color: "#e0e0f0",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}>
				{text.slice(0, 110)}
				{text.length > 110 ? "…" : ""}
			</span>
			<span style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
				<span style={{ color: "#4ecdc4" }}>+{up}</span>
				<span style={{ color: "#3a3a5a", margin: "0 3px" }}>/</span>
				<span style={{ color: "#ff6b6b" }}>-{down}</span>
			</span>
			<span
				style={{
					fontSize: "0.8rem",
					fontWeight: 700,
					color: netColor,
					whiteSpace: "nowrap",
				}}>
				{net > 0 ? "+" : ""}
				{net} ({total})
			</span>
		</div>
	);
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function CaptionStatsPage() {
	const supabase = await createClient();

	const [{ data: allVotes }, { count: totalCaptions }] = await Promise.all([
		supabase.from("caption_votes").select("caption_id, vote_value"),
		supabase.from("captions").select("*", { count: "exact", head: true }),
	]);

	// ── aggregate per-caption ─────────────────────────────────────────────────
	const upMap: Record<string, number> = {};
	const downMap: Record<string, number> = {};

	(allVotes ?? []).forEach((v) => {
		if (v.vote_value > 0) upMap[v.caption_id] = (upMap[v.caption_id] ?? 0) + 1;
		else downMap[v.caption_id] = (downMap[v.caption_id] ?? 0) + 1;
	});

	const allVotedIds = [...new Set([...Object.keys(upMap), ...Object.keys(downMap)])];

	type CaptionStat = { id: string; up: number; down: number; net: number; total: number };
	const captionStats: CaptionStat[] = allVotedIds.map((id) => {
		const up = upMap[id] ?? 0;
		const down = downMap[id] ?? 0;
		return { id, up, down, net: up - down, total: up + down };
	});

	// ── overview ──────────────────────────────────────────────────────────────
	const totalVotes = (allVotes ?? []).length;
	const upvotes = Object.values(upMap).reduce((s, n) => s + n, 0);
	const downvotes = Object.values(downMap).reduce((s, n) => s + n, 0);
	const upPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
	const ratedCount = allVotedIds.length;
	const unratedCount = (totalCaptions ?? 0) - ratedCount;
	const avgNetScore =
		captionStats.length > 0
			? (captionStats.reduce((s, c) => s + c.net, 0) / captionStats.length).toFixed(1)
			: "0";
	const positiveCount = captionStats.filter((c) => c.net > 0).length;
	const positivePct =
		ratedCount > 0 ? Math.round((positiveCount / ratedCount) * 100) : 0;

	// ── score distribution ─────────────────────────────────────────────────────
	const scoreBuckets = [
		{ label: "Loved  (net ≥ +5)", count: captionStats.filter((c) => c.net >= 5).length, color: "#4ecdc4" },
		{ label: "Good   (net +1 to +4)", count: captionStats.filter((c) => c.net >= 1 && c.net <= 4).length, color: "#a78bfa" },
		{ label: "Neutral (net = 0)", count: captionStats.filter((c) => c.net === 0).length, color: "#5a5a7a" },
		{ label: "Mixed  (net -4 to -1)", count: captionStats.filter((c) => c.net >= -4 && c.net <= -1).length, color: "#f59e0b" },
		{ label: "Disliked (net ≤ -5)", count: captionStats.filter((c) => c.net <= -5).length, color: "#ff6b6b" },
	];
	const bucketMax = Math.max(...scoreBuckets.map((b) => b.count), 1);

	// ── vote volume tiers ─────────────────────────────────────────────────────
	const volumeTiers = [
		{ label: "Not yet rated  (0 votes)", count: unratedCount, color: "#3a3a5a" },
		{ label: "Light          (1–2 votes)", count: captionStats.filter((c) => c.total <= 2).length, color: "#5a5a7a" },
		{ label: "Active         (3–9 votes)", count: captionStats.filter((c) => c.total >= 3 && c.total <= 9).length, color: "#a78bfa" },
		{ label: "Highly voted   (10+ votes)", count: captionStats.filter((c) => c.total >= 10).length, color: "#4ecdc4" },
	];
	const volumeMax = Math.max(...volumeTiers.map((t) => t.count), 1);

	// ── ranked lists ──────────────────────────────────────────────────────────
	const topRated = [...captionStats]
		.sort((a, b) => b.net - a.net || b.total - a.total)
		.slice(0, 15);

	const lowestRated = [...captionStats]
		.sort((a, b) => a.net - b.net || b.total - a.total)
		.slice(0, 10);

	const mostVoted = [...captionStats]
		.sort((a, b) => b.total - a.total)
		.slice(0, 10);

	// ── fetch caption text ────────────────────────────────────────────────────
	const idsToFetch = [
		...new Set([
			...topRated.map((c) => c.id),
			...lowestRated.map((c) => c.id),
			...mostVoted.map((c) => c.id),
		]),
	];
	const { data: captionRows } = idsToFetch.length
		? await supabase.from("captions").select("id, content").in("id", idsToFetch)
		: { data: [] };
	const captionMap: Record<string, string> = {};
	(captionRows ?? []).forEach((c) => {
		captionMap[c.id] = c.content ?? "(no content)";
	});

	return (
		<div style={{ maxWidth: "920px" }}>
			<h1
				style={{
					fontSize: "1.4rem",
					fontWeight: 800,
					color: "#f0f0ff",
					marginBottom: "0.25rem",
				}}>
				Caption Rating Statistics
			</h1>
			<p style={{ color: "#5a5a7a", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
				Per-caption vote analysis — pulled fresh from Supabase
			</p>

			{/* ── Overview ─────────────────────────────────────────────── */}
			<SectionHeader title="Overview" />
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
					gap: "0.75rem",
				}}>
				<StatCard label="Total Captions" value={totalCaptions ?? 0} />
				<StatCard label="Total Votes" value={totalVotes.toLocaleString()} accent="#4ecdc4" />
				<StatCard
					label="Captions Rated"
					value={ratedCount}
					sub={`${unratedCount} not yet seen`}
					accent="#a78bfa"
				/>
				<StatCard
					label="Avg Net Score"
					value={avgNetScore}
					sub="per rated caption"
					accent={parseFloat(avgNetScore) >= 0 ? "#4ecdc4" : "#ff6b6b"}
				/>
				<StatCard
					label="Positive Captions"
					value={`${positivePct}%`}
					sub={`${positiveCount} of ${ratedCount} rated`}
					accent={positivePct >= 50 ? "#4ecdc4" : "#f59e0b"}
				/>
				<StatCard
					label="Overall Up %"
					value={`${upPct}%`}
					sub={`${upvotes.toLocaleString()} up · ${downvotes.toLocaleString()} down`}
					accent={upPct >= 50 ? "#4ecdc4" : "#ff6b6b"}
				/>
			</div>

			{/* ── Score Distribution ───────────────────────────────────── */}
			<SectionHeader
				title="Score Distribution"
				description="How captions are distributed by net score (upvotes − downvotes). Only rated captions are counted."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.25rem 1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.8rem",
				}}>
				{scoreBuckets.map(({ label, count, color }) => (
					<div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<span
							style={{
								fontSize: "0.78rem",
								color: "#8888aa",
								minWidth: "180px",
								fontVariantNumeric: "tabular-nums",
							}}>
							{label}
						</span>
						<Bar pct={Math.round((count / bucketMax) * 100)} color={color} />
						<span
							style={{
								fontSize: "0.78rem",
								color,
								minWidth: "70px",
								textAlign: "right",
								whiteSpace: "nowrap",
							}}>
							{count} caption{count !== 1 ? "s" : ""}
						</span>
					</div>
				))}
			</div>

			{/* ── Vote Volume ──────────────────────────────────────────── */}
			<SectionHeader
				title="Vote Volume"
				description="How many captions fall into each engagement tier by total vote count."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					padding: "1.25rem 1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.8rem",
				}}>
				{volumeTiers.map(({ label, count, color }) => (
					<div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<span
							style={{
								fontSize: "0.78rem",
								color: "#8888aa",
								minWidth: "180px",
								fontVariantNumeric: "tabular-nums",
							}}>
							{label}
						</span>
						<Bar pct={Math.round((count / volumeMax) * 100)} color={color} />
						<span
							style={{
								fontSize: "0.78rem",
								color,
								minWidth: "70px",
								textAlign: "right",
								whiteSpace: "nowrap",
							}}>
							{count} caption{count !== 1 ? "s" : ""}
						</span>
					</div>
				))}
			</div>

			{/* ── Top Rated ───────────────────────────────────────────── */}
			<SectionHeader
				title="Top Rated Captions"
				description="Highest net score (upvotes − downvotes). Ties broken by total votes."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "28px 1fr 90px 70px",
						gap: "1rem",
						padding: "0.5rem 1.5rem",
						background: "#11112a",
						borderBottom: "1px solid #2a2a4a",
						fontSize: "0.68rem",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#5a5a7a",
					}}>
					<span>#</span>
					<span>Caption</span>
					<span>Up / Down</span>
					<span>Net (total)</span>
				</div>
				{topRated.length === 0 ? (
					<p style={{ color: "#5a5a7a", padding: "1rem 1.5rem", fontSize: "0.85rem" }}>
						No votes recorded yet.
					</p>
				) : (
					topRated.map((c, i) => (
						<CaptionRow
							key={c.id}
							rank={i + 1}
							text={captionMap[c.id] ?? ""}
							up={c.up}
							down={c.down}
							net={c.net}
							total={c.total}
							rankColor="#4ecdc4"
							isLast={i === topRated.length - 1}
						/>
					))
				)}
			</div>

			{/* ── Lowest Rated ─────────────────────────────────────────── */}
			<SectionHeader
				title="Lowest Rated Captions"
				description="Lowest net score. These are the captions users dislike most."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
				}}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "28px 1fr 90px 70px",
						gap: "1rem",
						padding: "0.5rem 1.5rem",
						background: "#11112a",
						borderBottom: "1px solid #2a2a4a",
						fontSize: "0.68rem",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#5a5a7a",
					}}>
					<span>#</span>
					<span>Caption</span>
					<span>Up / Down</span>
					<span>Net (total)</span>
				</div>
				{lowestRated.length === 0 ? (
					<p style={{ color: "#5a5a7a", padding: "1rem 1.5rem", fontSize: "0.85rem" }}>
						No votes recorded yet.
					</p>
				) : (
					lowestRated.map((c, i) => (
						<CaptionRow
							key={c.id}
							rank={i + 1}
							text={captionMap[c.id] ?? ""}
							up={c.up}
							down={c.down}
							net={c.net}
							total={c.total}
							rankColor="#ff6b6b"
							isLast={i === lowestRated.length - 1}
						/>
					))
				)}
			</div>

			{/* ── Most Voted ───────────────────────────────────────────── */}
			<SectionHeader
				title="Most Voted Captions"
				description="Captions with the highest total vote count, regardless of sentiment — the most discussed."
			/>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "12px",
					overflow: "hidden",
					marginBottom: "2rem",
				}}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "28px 1fr 90px 70px",
						gap: "1rem",
						padding: "0.5rem 1.5rem",
						background: "#11112a",
						borderBottom: "1px solid #2a2a4a",
						fontSize: "0.68rem",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#5a5a7a",
					}}>
					<span>#</span>
					<span>Caption</span>
					<span>Up / Down</span>
					<span>Net (total)</span>
				</div>
				{mostVoted.length === 0 ? (
					<p style={{ color: "#5a5a7a", padding: "1rem 1.5rem", fontSize: "0.85rem" }}>
						No votes recorded yet.
					</p>
				) : (
					mostVoted.map((c, i) => (
						<CaptionRow
							key={c.id}
							rank={i + 1}
							text={captionMap[c.id] ?? ""}
							up={c.up}
							down={c.down}
							net={c.net}
							total={c.total}
							rankColor="#a78bfa"
							isLast={i === mostVoted.length - 1}
						/>
					))
				)}
			</div>
		</div>
	);
}
