import "./globals.css";

export const metadata = {
  title: "Raharditya's Guitar Stuff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
