import { createClient } from "@/lib/supabase/server";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 100;

export default async function CaptionRequestsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const supabase = await createClient();

	const [{ data: requests, error, count }, { data: profiles }, { data: images }] = await Promise.all([
		supabase
			.from("caption_requests")
			.select("id, created_datetime_utc, profile_id, image_id", { count: "exact" })
			.order("created_datetime_utc", { ascending: false })
			.range(from, to),
		supabase.from("profiles").select("id, email, first_name, last_name"),
		supabase.from("images").select("id, image_description, url"),
	]);

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.email ?? `${p.first_name} ${p.last_name}`.trim()]));
	const imageMap = Object.fromEntries((images ?? []).map((img) => [img.id, img.image_description ?? img.url?.slice(0, 40)]));
	const total = count ?? 0;

	return (
		<div>
			<div style={{ marginBottom: "1.75rem" }}>
				<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Caption Requests</h1>
				<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{total} total</p>
			</div>

			<div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: "12px", overflow: "hidden" }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", padding: "0.6rem 1rem", borderBottom: "1px solid #2a2a4a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a7a" }}>
					<span>User</span>
					<span>Image</span>
					<span>Requested</span>
				</div>
				{!requests?.length && (
					<div style={{ padding: "2rem", textAlign: "center", color: "#5a5a7a", fontSize: "0.875rem" }}>No requests found.</div>
				)}
				{requests?.map((r, i) => (
					<div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", padding: "0.75rem 1rem", alignItems: "center", borderBottom: i < requests.length - 1 ? "1px solid #1e1e3a" : "none" }}>
						<span style={{ fontSize: "0.85rem", color: "#c0c0d0" }}>{r.profile_id ? (profileMap[r.profile_id] ?? r.profile_id.slice(0, 8)) : "—"}</span>
						<span style={{ fontSize: "0.8rem", color: "#8888aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.image_id ? (imageMap[r.image_id] ?? r.image_id.slice(0, 8)) : "—"}</span>
						<span style={{ fontSize: "0.75rem", color: "#5a5a7a" }}>{new Date(r.created_datetime_utc).toLocaleDateString()}</span>
					</div>
				))}
			</div>

			<Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/caption-requests" />
		</div>
	);
}
