import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PIPELINE_BASE = "https://api.almostcrackd.ai";

async function assertSuperadmin() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data: profile } = await supabase
		.from("profiles").select("is_superadmin").eq("id", user.id).single();
	return profile?.is_superadmin ? user : null;
}

async function getAccessToken(): Promise<string | null> {
	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();
	return session?.access_token ?? null;
}

// POST /api/admin/images/upload — upload file via caption pipeline, return CDN URL
export async function POST(request: Request) {
	const user = await assertSuperadmin();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const token = await getAccessToken();
	if (!token) return NextResponse.json({ error: "No active session" }, { status: 401 });

	const formData = await request.formData().catch(() => null);
	const file = formData?.get("file") as File | null;
	if (!file || file.size === 0) {
		return NextResponse.json({ error: "file is required" }, { status: 400 });
	}

	const authHeaders = { Authorization: `Bearer ${token}` };

	// Step 1: Get presigned upload URL
	const presignRes = await fetch(`${PIPELINE_BASE}/pipeline/generate-presigned-url`, {
		method: "POST",
		headers: { ...authHeaders, "Content-Type": "application/json" },
		body: JSON.stringify({ contentType: file.type }),
	});
	if (!presignRes.ok) {
		const body = await presignRes.json().catch(() => ({}));
		return NextResponse.json(
			{ error: body.message ?? "Failed to get presigned URL" },
			{ status: presignRes.status },
		);
	}
	const { presignedUrl, cdnUrl } = await presignRes.json();

	// Step 2: PUT file bytes directly to the presigned URL
	const fileBuffer = await file.arrayBuffer();
	const putRes = await fetch(presignedUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: fileBuffer,
	});
	if (!putRes.ok) {
		return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
	}

	// Step 3: Register the image with the pipeline
	const registerRes = await fetch(`${PIPELINE_BASE}/pipeline/upload-image-from-url`, {
		method: "POST",
		headers: { ...authHeaders, "Content-Type": "application/json" },
		body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
	});
	if (!registerRes.ok) {
		const body = await registerRes.json().catch(() => ({}));
		return NextResponse.json(
			{ error: body.message ?? "Failed to register image" },
			{ status: registerRes.status },
		);
	}

	return NextResponse.json({ url: cdnUrl }, { status: 201 });
}
