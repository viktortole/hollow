import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download Hollow for Windows, Android, and iOS. Free, no account required.",
};

const GITHUB_RELEASES = "https://github.com/wolverinetole/hollow/releases";

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0 text-ink">
      {/* Navbar (minimal) */}
      <header className="border-b border-hairline bg-bg-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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
          <Link href="/" className="text-sm text-ink-3 hover:text-ink transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-semibold text-ink tracking-tight mb-3">
          Download Hollow
        </h1>
        <p className="text-ink-3 mb-12">
          Free forever. No account. No telemetry.
        </p>

        <div className="flex flex-col gap-5">
          {/* Windows */}
          <div className="p-6 rounded-sm bg-bg-2 border border-hairline">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-ember/15 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ee9162" aria-hidden="true">
                    <path d="M3 12V6.75L9 5.43V11.91L3 12M20 3V11.75L10 11.9V5.21L20 3M3 13L9 13.09V19.9L3 18.75M20 13.25V22L10 20.09V13.1L20 13.25Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-ink text-lg">Windows</h2>
                  <p className="text-sm text-ink-3 mt-1">
                    NSIS installer — Windows 10 or later, x64. Installs to AppData, creates Start Menu shortcut.
                  </p>
                  <p className="text-xs text-ink-4 mt-1">
                    v1.0.0 — Requires WebView2 (included in Windows 11; auto-installed on Windows 10).
                  </p>
                </div>
              </div>
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-ember text-bg-0 font-medium text-sm rounded-sm hover:bg-[#d4824f] transition-colors"
              >
                Download .exe
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Android */}
          <div className="p-6 rounded-sm bg-bg-2 border border-hairline">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-ember/15 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ee9162" aria-hidden="true">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.51-.38-.83-.22-.31.16-.43.54-.26.85L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25S6.31 12.75 7 12.75 8.25 13.31 8.25 14 7.69 15.25 7 15.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-ink text-lg">Android</h2>
                  <p className="text-sm text-ink-3 mt-1">
                    Universal APK — install directly, no Play Store required. Works on Android 7.0 (API 24) and above.
                  </p>
                  <p className="text-xs text-ink-4 mt-1">
                    v1.0.0 — APK uploaded to GitHub Releases after first release. Check back soon.
                  </p>
                </div>
              </div>
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-hairline text-ink font-medium text-sm rounded-sm hover:border-ember/40 hover:text-ember transition-colors"
              >
                Coming soon
              </a>
            </div>
          </div>

          {/* iOS */}
          <div className="p-6 rounded-sm bg-bg-2 border border-hairline">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-ember/15 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ee9162" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-ink text-lg">iOS</h2>
                  <p className="text-sm text-ink-3 mt-1">
                    iPhone and iPad — TestFlight beta in progress. App Store release coming.
                  </p>
                  <p className="text-xs text-ink-4 mt-1">
                    Join the waitlist:{" "}
                    <a
                      href="mailto:viktortoleskiwork@gmail.com?subject=Hollow iOS Waitlist"
                      className="text-ember hover:underline"
                    >
                      viktortoleskiwork@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-3 border border-hairline rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-4" />
                Coming soon
              </span>
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="mt-12 pt-8 border-t border-hairline">
          <h3 className="text-sm font-semibold text-ink-2 mb-3">Source code</h3>
          <p className="text-sm text-ink-3">
            Hollow is open source under the{" "}
            <a
              href="https://github.com/wolverinetole/hollow/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:underline"
            >
              MIT License
            </a>
            . Built with Tauri 2, React 19, and TypeScript.
          </p>
          <a
            href="https://github.com/wolverinetole/hollow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm text-ink-3 hover:text-ink transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
