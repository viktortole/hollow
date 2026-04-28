import Image from "next/image";
import Link from "next/link";

const GITHUB_RELEASES = "https://github.com/wolverinetole/hollow/releases";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0 text-ink">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-bg-0/90 backdrop-blur-sm">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/hollow-icon.svg"
              alt="Hollow"
              width={22}
              height={22}
              unoptimized
            />
            <span className="font-semibold text-ink tracking-tight">Hollow</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-ink-3 hover:text-ink transition-colors">
              Features
            </a>
            <a href="#screenshots" className="text-sm text-ink-3 hover:text-ink transition-colors">
              Screenshots
            </a>
            <a href="/download" className="text-sm text-ink-3 hover:text-ink transition-colors">
              Download
            </a>
            <a href="/privacy" className="text-sm text-ink-3 hover:text-ink transition-colors">
              Privacy
            </a>
            <a
              href={GITHUB_RELEASES}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-1.5 rounded-sm bg-ember text-bg-0 hover:bg-[#d4824f] transition-colors"
            >
              Download
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline text-xs text-ink-3 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
                Now in public beta
              </div>

              <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-ink leading-[1.05]">
                Fasting as a<br />
                <span className="text-ember">daily practice.</span>
              </h1>

              <p className="text-lg text-ink-2 leading-relaxed max-w-md">
                Hollow is a minimalist fasting widget that lives at the edge of your
                workspace — always visible, never intrusive. Track fasts, watch your
                metabolic stages unfold, earn XP, and unlock achievements.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={GITHUB_RELEASES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ember text-bg-0 font-medium text-sm rounded-sm hover:bg-[#d4824f] transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
                    <polyline points="13,2 13,9 20,9" />
                  </svg>
                  Download for Windows
                </a>
                <a
                  href="/download"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-hairline text-ink text-sm rounded-sm hover:border-ember/40 hover:text-ember transition-colors"
                >
                  All platforms
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              </div>

              <p className="text-xs text-ink-4">
                Free forever. No account required. No telemetry.
              </p>
            </div>

            {/* Right: hero screenshot */}
            <div className="relative">
              <div className="rounded-sm overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(243,234,219,0.06)]">
                <Image
                  src="/screenshots/desktop_polished_195907.png"
                  alt="Hollow fasting widget on desktop"
                  width={600}
                  height={420}
                  className="w-full"
                  priority
                  unoptimized
                />
              </div>
              {/* Floating accent glow */}
              <div
                className="absolute -inset-px rounded-sm pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(238,145,98,0.12) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────── */}
        <section
          id="features"
          className="border-y border-hairline bg-bg-1 py-24"
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-ink tracking-tight mb-4">
                Built for serious practice.
              </h2>
              <p className="text-ink-3 max-w-md mx-auto">
                Not a gamified toy. Not a calorie counter. A quiet, disciplined tool.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="p-5 rounded-sm bg-bg-2 border border-hairline">
                <div className="w-9 h-9 rounded-sm bg-ember/15 flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee9162" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-1.5">Always on top</h3>
                <p className="text-sm text-ink-3 leading-relaxed">
                  Lives at the edge of your workspace. A glance, not a tap.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 rounded-sm bg-bg-2 border border-hairline">
                <div className="w-9 h-9 rounded-sm bg-ember/15 flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee9162" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-1.5">Privacy-first</h3>
                <p className="text-sm text-ink-3 leading-relaxed">
                  Zero telemetry. Zero accounts. Your data never leaves your device.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 rounded-sm bg-bg-2 border border-hairline">
                <div className="w-9 h-9 rounded-sm bg-ember/15 flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee9162" strokeWidth="1.8" aria-hidden="true">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-1.5">Stage detection</h3>
                <p className="text-sm text-ink-3 leading-relaxed">
                  Fed, Fat Burning, Autophagy, Deep Ketosis — metabolic stages in real time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-5 rounded-sm bg-bg-2 border border-hairline">
                <div className="w-9 h-9 rounded-sm bg-ember/15 flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee9162" strokeWidth="1.8" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-ink mb-1.5">Gamified discipline</h3>
                <p className="text-sm text-ink-3 leading-relaxed">
                  XP, levels, streaks, achievements. Quiet motivation, not dopamine traps.
                </p>
              </div>
            </div>

            {/* Secondary features row */}
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-3 p-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#95bf83" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-ink-2">Hydration tracking alongside fasting</span>
              </div>
              <div className="flex items-start gap-3 p-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#95bf83" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-ink-2">Pill mode — shrinks to a floating timer</span>
              </div>
              <div className="flex items-start gap-3 p-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#95bf83" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm text-ink-2">Local JSON backup and restore</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Screenshots ──────────────────────────────────── */}
        <section
          id="screenshots"
          className="py-24 bg-bg-0"
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-ink tracking-tight mb-4">
                Desktop and mobile.
              </h2>
              <p className="text-ink-3">
                One codebase. Every platform.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Desktop */}
              <div className="rounded-sm overflow-hidden border border-hairline bg-bg-2">
                <Image
                  src="/screenshots/pixel7_after_branding.png"
                  alt="Hollow desktop widget — dark warm-graphite theme"
                  width={640}
                  height={420}
                  className="w-full"
                  unoptimized
                />
                <div className="px-5 py-4 border-t border-hairline">
                  <p className="text-sm font-medium text-ink">Desktop widget</p>
                  <p className="text-xs text-ink-3 mt-0.5">Always-on-top, pill mode, system tray</p>
                </div>
              </div>

              {/* Mobile grid */}
              <div className="grid grid-rows-2 gap-4">
                <div className="rounded-sm overflow-hidden border border-hairline bg-bg-2 flex flex-col">
                  <Image
                    src="/screenshots/android_main_195645.png"
                    alt="Hollow Android — main screen"
                    width={320}
                    height={200}
                    className="w-full flex-1 object-cover"
                    unoptimized
                  />
                </div>
                <div className="rounded-sm overflow-hidden border border-hairline bg-bg-2 flex flex-col">
                  <Image
                    src="/screenshots/android_after_tap_195756.png"
                    alt="Hollow Android — fasting in progress"
                    width={320}
                    height={200}
                    className="w-full flex-1 object-cover"
                    unoptimized
                  />
                </div>
                <div className="col-span-2 px-5 py-4 border-t border-hairline bg-bg-2">
                  <p className="text-sm font-medium text-ink">Android app</p>
                  <p className="text-xs text-ink-3 mt-0.5">APK download — no App Store required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Download CTA ──────────────────────────────────── */}
        <section className="border-y border-hairline bg-bg-1 py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-semibold text-ink tracking-tight mb-4">
              Start your practice today.
            </h2>
            <p className="text-ink-3 mb-10">
              Free to download. No account. No telemetry. Your first fast takes 10 seconds to set up.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-ember text-bg-0 font-medium rounded-sm hover:bg-[#d4824f] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
                  <polyline points="13,2 13,9 20,9" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                Download for Windows
              </a>
              <a
                href="/download"
                className="inline-flex items-center gap-2 px-8 py-3 border border-hairline text-ink rounded-sm hover:border-ember/40 transition-colors"
              >
                See all platforms
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-hairline bg-bg-0 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/hollow-icon.svg"
              alt="Hollow"
              width={16}
              height={16}
              unoptimized
            />
            <span className="text-sm text-ink-4">
              Hollow — Built by Viktor Toleski
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wolverinetole/hollow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-4 hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <a href="/privacy" className="text-sm text-ink-4 hover:text-ink transition-colors">
              Privacy
            </a>
            <a href="/download" className="text-sm text-ink-4 hover:text-ink transition-colors">
              Download
            </a>
          </div>
          <span className="text-xs text-ink-4">MIT License</span>
        </div>
      </footer>
    </div>
  );
}
