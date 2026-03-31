import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertSuperadmin() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data: profile } = await supabase
		.from("profiles").select("is_superadmin").eq("id", user.id).single();
	return profile?.is_superadmin ? user : null;
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const user = await assertSuperadmin();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const body = await request.json().catch(() => null);
	if (!body?.apex_domain?.trim()) return NextResponse.json({ error: "apex_domain is required" }, { status: 400 });

	const admin = createAdminClient();
	const { data, error } = await admin
		.from("allowed_signup_domains")
		.update({
			apex_domain: body.apex_domain.trim().toLowerCase(),
			modified_by_user_id: user.id,
			modified_datetime_utc: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const user = await assertSuperadmin();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const admin = createAdminClient();
	const { error } = await admin.from("allowed_signup_domains").delete().eq("id", id);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ success: true });
}
