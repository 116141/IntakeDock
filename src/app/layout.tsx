import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IntakeDock — Client Onboarding & Document Collection Portal',
  description:
    'Self-serve B2B client onboarding and document workflow software. Collect readable client files via no-login links with automated reminders and 1-click ZIP/PDF export.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-950 antialiased">{children}</body>
    </html>
  );
}
