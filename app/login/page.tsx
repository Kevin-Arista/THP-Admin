"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	async function handleSignIn() {
		const supabase = createClient();
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
	}

	return (
		<main
			style={{
				minHeight: "100vh",
				background: "#0d0d1a",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "system-ui, sans-serif",
			}}>
			<div
				style={{
					background: "#16213e",
					border: "1px solid #2a2a4a",
					borderRadius: "16px",
					padding: "2.5rem 3rem",
					textAlign: "center",
					boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
					maxWidth: "400px",
					width: "90%",
				}}>
				<div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>🎭</div>
				<h1
					style={{
						fontSize: "1.6rem",
						fontWeight: 800,
						color: "#f0f0ff",
						marginBottom: "0.4rem",
						textShadow:
							"0 0 7px rgba(78,205,196,0.6), 0 0 30px rgba(78,205,196,0.3)",
					}}>
					THP Admin
				</h1>
				<p
					style={{
						color: "#8888aa",
						fontSize: "0.9rem",
						marginBottom: "2rem",
					}}>
					Superadmin access only
				</p>

				{error === "auth_callback_failed" && (
					<p
						style={{
							color: "#ff6b6b",
							fontSize: "0.85rem",
							marginBottom: "1rem",
							background: "rgba(255,107,107,0.1)",
							border: "1px solid rgba(255,107,107,0.3)",
							borderRadius: "8px",
							padding: "0.6rem 1rem",
						}}>
						Authentication failed. Please try again.
					</p>
				)}
				{error === "not_superadmin" && (
					<p
						style={{
							color: "#ff6b6b",
							fontSize: "0.85rem",
							marginBottom: "1rem",
							background: "rgba(255,107,107,0.1)",
							border: "1px solid rgba(255,107,107,0.3)",
							borderRadius: "8px",
							padding: "0.6rem 1rem",
						}}>
						Your account does not have admin access.
					</p>
				)}

				<button
					onClick={handleSignIn}
					style={{
						width: "100%",
						padding: "0.75rem 1.5rem",
						fontSize: "0.95rem",
						fontWeight: 600,
						backgroundColor: "#4285F4",
						color: "#fff",
						border: "none",
						borderRadius: "8px",
						cursor: "pointer",
						boxShadow: "0 0 15px rgba(66,133,244,0.3)",
						transition: "box-shadow 0.2s, transform 0.1s",
					}}
					onMouseEnter={(e) => {
						(e.target as HTMLButtonElement).style.boxShadow =
							"0 0 25px rgba(66,133,244,0.5)";
					}}
					onMouseLeave={(e) => {
						(e.target as HTMLButtonElement).style.boxShadow =
							"0 0 15px rgba(66,133,244,0.3)";
					}}>
					Sign in with Google
				</button>
			</div>
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}
