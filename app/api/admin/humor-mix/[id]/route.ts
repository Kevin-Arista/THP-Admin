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
	if (body?.caption_count == null) {
		return NextResponse.json({ error: "caption_count is required" }, { status: 400 });
	}

	const admin = createAdminClient();
	const { data, error } = await admin
		.from("humor_flavor_mix")
		.update({
			caption_count: Number(body.caption_count),
			modified_by_user_id: user.id,
			modified_datetime_utc: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}
