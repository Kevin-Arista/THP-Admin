import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS.
 * ONLY use this in server-side code (API routes, Server Components).
 * Always verify the requesting user is a superadmin before calling this.
 */
export function createAdminClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}
