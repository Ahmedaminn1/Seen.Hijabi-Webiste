export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-8 h-8 rounded-full border-2 border-[oklch(0.85_0_0)] border-t-[oklch(0.145_0_0)] animate-spin" />
      <span
        className="font-serif text-sm tracking-wider text-[oklch(0.45_0_0)] uppercase"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Seen Hijabi
      </span>
    </div>
  );
}
