import { createClient } from "@/lib/supabase/server";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 50;

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const supabase = await createClient();

	const { data: profiles, count, error } = await supabase
		.from("profiles")
		.select("*", { count: "exact" })
		.order("created_datetime_utc", { ascending: false })
		.range(from, to);

	const profileIds = (profiles ?? []).map((p) => p.id);
	const voteMap: Record<string, number> = {};
	if (profileIds.length > 0) {
		const { data: voteCounts } = await supabase
			.from("caption_votes")
			.select("profile_id")
			.in("profile_id", profileIds);
		(voteCounts ?? []).forEach((v) => {
			voteMap[v.profile_id] = (voteMap[v.profile_id] ?? 0) + 1;
		});
	}

	const total = count ?? 0;

	return (
		<div style={{ maxWidth: "1000px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: "1rem",
					marginBottom: "1.5rem",
				}}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>
					Users
				</h1>
				<span style={{ fontSize: "0.8rem", color: "#5a5a7a" }}>
					{total} total · read-only
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
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "40px 1fr 1fr 80px 90px 80px",
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
					<span>#</span>
					<span>Name</span>
					<span>Email / ID</span>
					<span>Votes Cast</span>
					<span>Joined</span>
					<span>Admin</span>
				</div>

				{!profiles || profiles.length === 0 ? (
					<p style={{ color: "#5a5a7a", padding: "1.5rem 1.25rem", fontSize: "0.85rem" }}>
						No profiles found.
					</p>
				) : (
					profiles.map((p, i) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const row = p as any;
						const first = row.first_name?.trim() || null;
						const last = row.last_name?.trim() || null;
						const displayName =
							first && last
								? `${first} ${last}`
								: first ?? last ?? (
										<span style={{ color: "#3a3a5a", fontStyle: "italic" }}>No name</span>
								  );
						const email = row.email ?? row.id;
						const isSuperadmin = !!row.is_superadmin;
						const votes = voteMap[row.id] ?? 0;
						const rowNum = from + i + 1;

						return (
							<div
								key={row.id}
								style={{
									display: "grid",
									gridTemplateColumns: "40px 1fr 1fr 80px 90px 80px",
									gap: "1rem",
									padding: "0.75rem 1.25rem",
									borderBottom: i < profiles.length - 1 ? "1px solid #1e1e3a" : "none",
									alignItems: "center",
									fontSize: "0.83rem",
								}}>
								<span style={{ color: "#3a3a5a", fontSize: "0.75rem" }}>{rowNum}</span>

								<span
									style={{
										color: "#e0e0f0",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}>
									{displayName}
								</span>

								<span
									style={{
										color: "#8888aa",
										fontSize: "0.78rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}>
									{email}
								</span>

								<span style={{ color: votes > 0 ? "#a78bfa" : "#3a3a5a", fontWeight: votes > 0 ? 600 : 400 }}>
									{votes}
								</span>

								<span style={{ color: "#5a5a7a", fontSize: "0.78rem" }}>
									{formatDate(row.created_datetime_utc ?? null)}
								</span>

								<span>
									{isSuperadmin ? (
										<span
											style={{
												fontSize: "0.7rem",
												fontWeight: 700,
												color: "#f59e0b",
												background: "rgba(245,158,11,0.12)",
												border: "1px solid rgba(245,158,11,0.3)",
												borderRadius: "4px",
												padding: "2px 6px",
											}}>
											ADMIN
										</span>
									) : (
										<span style={{ color: "#3a3a5a", fontSize: "0.75rem" }}>—</span>
									)}
								</span>
							</div>
						);
					})
				)}
			</div>

			<Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/users" />
		</div>
	);
}
