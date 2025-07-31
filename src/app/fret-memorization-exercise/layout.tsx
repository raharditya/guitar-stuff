export const metadata = {
  title: "Fret Memorization Exercise - Raharditya's Guitar Stuff",
  description: "This exercise will help you memorize the notes on the fretboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <body className="antialiased">{children}</body>;
}
