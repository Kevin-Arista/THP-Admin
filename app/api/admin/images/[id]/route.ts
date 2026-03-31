import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertSuperadmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	const { data: profile } = await supabase
		.from("profiles")
		.select("is_superadmin")
		.eq("id", user.id)
		.single();

	return profile?.is_superadmin ? user : null;
}

// PUT /api/admin/images/[id] — update an image
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await assertSuperadmin();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const body = await request.json().catch(() => null);
	if (!body?.url) {
		return NextResponse.json({ error: "url is required" }, { status: 400 });
	}

	const admin = createAdminClient();
	const { data, error } = await admin
		.from("images")
		.update({
			url: body.url,
			image_description: body.image_description ?? null,
			is_public: body.is_public ?? false,
			modified_by_user_id: user.id,
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}

// DELETE /api/admin/images/[id] — delete an image
export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await assertSuperadmin();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const admin = createAdminClient();
	const { error } = await admin.from("images").delete().eq("id", id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
