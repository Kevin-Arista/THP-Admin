/**
 * seed-superadmin.ts
 *
 * One-time bootstrap script to grant superadmin access to a user.
 *
 * WHY THIS EXISTS — the chicken-and-egg problem:
 *   The admin panel requires profiles.is_superadmin == true to log in.
 *   But to set that flag you'd normally need to already be inside the panel.
 *   Solution: use the Supabase SERVICE ROLE key (bypasses all RLS) to
 *   directly update the profiles table from outside the app.
 *
 * Usage:
 *   1. Sign in at /login via Google once — this creates your profile row.
 *      You'll hit /login?error=not_superadmin; that's expected.
 *   2. Run (env vars must be available in shell or pass them inline):
 *        npx tsx scripts/seed-superadmin.ts your@email.com
 *      or:
 *        NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *          npx tsx scripts/seed-superadmin.ts your@email.com
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error(
		"❌  Missing env vars. Set in shell or .env.local:\n" +
			"    NEXT_PUBLIC_SUPABASE_URL\n" +
			"    SUPABASE_SERVICE_ROLE_KEY",
	);
	process.exit(1);
}

const targetEmail = process.argv[2];
if (!targetEmail) {
	console.error("❌  Usage: npx tsx scripts/seed-superadmin.ts your@email.com");
	process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
	console.log(`\n🔍  Looking for profile with email: ${targetEmail}\n`);

	// Try matching on a profiles.email column first
	const { data: byEmail, error: emailErr } = await admin
		.from("profiles")
		.select("id, email, is_superadmin")
		.eq("email", targetEmail)
		.maybeSingle();

	if (emailErr) {
		console.error("❌  Query error:", emailErr.message);
		process.exit(1);
	}

	let profileId: string | null = null;

	if (byEmail) {
		profileId = byEmail.id;
		console.log(`✅  Found profile by email column (id: ${profileId})`);
		if (byEmail.is_superadmin) {
			console.log("ℹ️   Already a superadmin — nothing to do.");
			process.exit(0);
		}
	} else {
		// Fall back to auth.users lookup
		console.log("   No email column match. Trying auth.users lookup…");

		const { data: usersData, error: usersErr } =
			await admin.auth.admin.listUsers();
		if (usersErr) {
			console.error("❌  Could not list auth users:", usersErr.message);
			process.exit(1);
		}

		const matchedUser = usersData.users.find(
			(u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
		);

		if (!matchedUser) {
			console.error(
				`❌  No auth user found with email '${targetEmail}'.\n` +
					"    Sign in at /login first to create your profile row.",
			);
			process.exit(1);
		}

		profileId = matchedUser.id;
		console.log(`✅  Found auth user (id: ${profileId})`);

		const { data: profileCheck } = await admin
			.from("profiles")
			.select("id, is_superadmin")
			.eq("id", profileId)
			.maybeSingle();

		if (!profileCheck) {
			console.error(
				`❌  Auth user exists but no profile row found for id '${profileId}'.\n` +
					"    Sign in at /login once, then re-run this script.",
			);
			process.exit(1);
		}

		if (profileCheck.is_superadmin) {
			console.log("ℹ️   Already a superadmin — nothing to do.");
			process.exit(0);
		}
	}

	const { error: updateErr } = await admin
		.from("profiles")
		.update({ is_superadmin: true })
		.eq("id", profileId!);

	if (updateErr) {
		console.error("❌  Update failed:", updateErr.message);
		process.exit(1);
	}

	console.log(`\n🎉  Success! ${targetEmail} is now a superadmin.\n`);
	console.log("    Sign in at http://localhost:3000/login\n");
}

main();
