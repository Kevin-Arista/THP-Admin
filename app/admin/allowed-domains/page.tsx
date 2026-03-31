import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AllowedDomainsClient from "./AllowedDomainsClient";

export default async function AllowedDomainsPage() {
	const supabase = await createClient();
	const { data: domains, error } = await supabase
		.from("allowed_signup_domains")
		.select("id, apex_domain, created_datetime_utc")
		.order("apex_domain");

	if (error) {
		return (
			<div style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "1rem" }}>
				Error: {error.message}
			</div>
		);
	}

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
				<div>
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Allowed Signup Domains</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{domains?.length ?? 0} domains</p>
				</div>
				<Link href="/admin/allowed-domains/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ Add Domain
				</Link>
			</div>
			<AllowedDomainsClient domains={domains ?? []} />
		</div>
	);
}
