import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	// 1. Verify the user is authenticated
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// 2. Verify the user is a superadmin
	const { data: profile } = await supabase
		.from("profiles")
		.select("is_superadmin")
		.eq("id", user.id)
		.single();

	if (!profile?.is_superadmin) {
		redirect("/login?error=not_superadmin");
	}

	return (
		<div
			style={{
				display: "flex",
				minHeight: "100vh",
				background: "#0d0d1a",
				fontFamily: "system-ui, sans-serif",
			}}>
			<AdminNav userEmail={user.email ?? ""} />
			<main
				style={{
					flex: 1,
					padding: "2rem",
					overflowY: "auto",
					minWidth: 0,
				}}>
				{children}
			</main>
		</div>
	);
}
