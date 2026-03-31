import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "THP Admin",
	description: "Admin panel for The Humor Project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
