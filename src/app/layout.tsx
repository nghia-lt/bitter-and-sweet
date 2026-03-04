import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vòng Quay Tới Số 🎰',
  description: 'Thua là phải chịu. Không chạy đâu được.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="game-container min-h-screen">
        <div className="phone-frame">
          {children}
        </div>
      </body>
    </html>
  );
}
