import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Masih dibikin hehe</h1>
      <p>
        Nantinya ceritanya kalo udah ada beberapa sub app bakal dilist di sini, tapi kan sekarang masih cuma satu doang
        ye
      </p>
      <p>
        Buat sekarang bisa cek{" "}
        <Link href="/fret-memorization-exercise" className="text-blue-500 hover:underline">
          Fret Memorization Exercise
        </Link>{" "}
        untuk latihan ngapalin fretboard
      </p>
    </div>
  );
}
