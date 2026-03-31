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

export async function POST(request: Request) {
	const user = await assertSuperadmin();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json().catch(() => null);
	if (!body?.term?.trim()) return NextResponse.json({ error: "term is required" }, { status: 400 });
	if (!body?.definition?.trim()) return NextResponse.json({ error: "definition is required" }, { status: 400 });

	const admin = createAdminClient();
	const { data, error } = await admin
		.from("terms")
		.insert({
			term: body.term.trim(),
			definition: body.definition.trim(),
			example: body.example?.trim() ?? null,
			priority: body.priority != null ? Number(body.priority) : null,
			term_type_id: body.term_type_id ?? null,
			created_by_user_id: user.id,
			modified_by_user_id: user.id,
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data, { status: 201 });
}
