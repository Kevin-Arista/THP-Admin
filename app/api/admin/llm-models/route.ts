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
	if (!body?.name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
	if (!body?.provider_model_id?.trim()) return NextResponse.json({ error: "provider_model_id is required" }, { status: 400 });

	const admin = createAdminClient();
	const { data, error } = await admin
		.from("llm_models")
		.insert({
			name: body.name.trim(),
			llm_provider_id: body.llm_provider_id ?? null,
			provider_model_id: body.provider_model_id.trim(),
			is_temperature_supported: body.is_temperature_supported ?? true,
			created_by_user_id: user.id,
			modified_by_user_id: user.id,
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data, { status: 201 });
}
