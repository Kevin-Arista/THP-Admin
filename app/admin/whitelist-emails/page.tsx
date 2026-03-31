import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import WhitelistEmailsClient from "./WhitelistEmailsClient";

export default async function WhitelistEmailsPage() {
	const supabase = await createClient();
	const { data: emails, error } = await supabase
		.from("whitelist_email_addresses")
		.select("id, email_address, created_datetime_utc")
		.order("email_address");

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
					<h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0ff" }}>Whitelisted Emails</h1>
					<p style={{ fontSize: "0.8rem", color: "#5a5a7a", marginTop: "2px" }}>{emails?.length ?? 0} addresses</p>
				</div>
				<Link href="/admin/whitelist-emails/new" style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#0d0d1a", background: "#4ecdc4", borderRadius: "8px", textDecoration: "none" }}>
					+ Add Email
				</Link>
			</div>
			<WhitelistEmailsClient emails={emails ?? []} />
		</div>
	);
}
