import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digitas Virtual Office — Live Agent Operations Room',
  description: 'Interactive 3D Virtual Operations Room for PT Digitas Solusi Indonesia & Legalizin Autonomous Agent Workforce: Patih Gajah Mada, Robert, Talia, and Putra.',
  openGraph: {
    title: 'Digitas Virtual Office — Live Agent Operations Room',
    description: 'Interactive 3D Workspace visualizing autonomous AI agents powering Indonesia legal tech.',
    siteName: 'Digitas Solusi Indonesia',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090a10] text-white">
        {children}
      </body>
    </html>
  );
}
