import Link from "next/link";

export default function Pagination({
	page,
	total,
	pageSize,
	basePath,
}: {
	page: number;
	total: number;
	pageSize: number;
	basePath: string;
}) {
	const totalPages = Math.ceil(total / pageSize);
	if (totalPages <= 1) return null;

	const makeHref = (p: number) => `${basePath}?page=${p}`;

	const pageNums: (number | "...")[] = [];
	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i++) pageNums.push(i);
	} else {
		const near = new Set<number>();
		near.add(1);
		near.add(totalPages);
		for (let p = Math.max(1, page - 1); p <= Math.min(totalPages, page + 1); p++) {
			near.add(p);
		}
		const sorted = Array.from(near).sort((a, b) => a - b);
		for (let i = 0; i < sorted.length; i++) {
			if (i > 0 && sorted[i] - sorted[i - 1] > 1) pageNums.push("...");
			pageNums.push(sorted[i]);
		}
	}

	const btn: React.CSSProperties = {
		padding: "6px 12px",
		fontSize: "0.8rem",
		borderRadius: "6px",
		textDecoration: "none",
		display: "inline-block",
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "0.4rem",
				marginTop: "1.5rem",
				flexWrap: "wrap",
			}}>
			<span style={{ fontSize: "0.75rem", color: "#5a5a7a", marginRight: "0.25rem" }}>
				Page {page} of {totalPages} · {total} total
			</span>

			{page > 1 ? (
				<Link href={makeHref(page - 1)} style={{ ...btn, color: "#4ecdc4", border: "1px solid rgba(78,205,196,0.4)" }}>
					← Prev
				</Link>
			) : (
				<span style={{ ...btn, color: "#3a3a5a", border: "1px solid #2a2a4a" }}>← Prev</span>
			)}

			{pageNums.map((p, i) =>
				p === "..." ? (
					<span key={`e-${i}`} style={{ color: "#3a3a5a", fontSize: "0.8rem", padding: "0 2px" }}>…</span>
				) : (
					<Link
						key={p}
						href={makeHref(p)}
						style={{
							...btn,
							padding: "6px 10px",
							minWidth: "32px",
							textAlign: "center",
							color: p === page ? "#0d0d1a" : "#8888aa",
							background: p === page ? "#4ecdc4" : "transparent",
							border: `1px solid ${p === page ? "#4ecdc4" : "#2a2a4a"}`,
							fontWeight: p === page ? 700 : 400,
						}}>
						{p}
					</Link>
				),
			)}

			{page < totalPages ? (
				<Link href={makeHref(page + 1)} style={{ ...btn, color: "#4ecdc4", border: "1px solid rgba(78,205,196,0.4)" }}>
					Next →
				</Link>
			) : (
				<span style={{ ...btn, color: "#3a3a5a", border: "1px solid #2a2a4a" }}>Next →</span>
			)}
		</div>
	);
}
