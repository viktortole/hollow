import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Hollow's privacy promise. No accounts, no telemetry, no cloud sync. Your data stays on your device.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-0 text-ink">
      {/* Navbar */}
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
        <h1 className="text-4xl font-semibold text-ink tracking-tight mb-2">
          Privacy
        </h1>
        <p className="text-sm text-ink-4 mb-12">Last updated: 2026-04-26</p>

        <div className="space-y-10">
          {/* The short version */}
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              The short version
            </h2>
            <p className="text-ink-2 leading-relaxed">
              Hollow stores your fasts, achievements, hydration, and preferences{" "}
              <strong className="text-ink font-medium">on your device only</strong>. Nothing
              is sent anywhere. There is no account, no login, no telemetry, no
              analytics, no crash reporter, and no third-party SDK that phones home.
            </p>
            <p className="text-ink-2 leading-relaxed mt-3">
              Your data is yours. Hollow can read it because it lives in a JSON file you
              can open with any text editor, and you can export or delete it at any time
              from Settings → Data.
            </p>
          </section>

          {/* What we store */}
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              What Hollow stores, and where
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="pb-2 text-ink-3 font-medium">Data</th>
                    <th className="pb-2 text-ink-3 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr className="border-b border-hairline/50">
                    <td className="py-2">Fasting history</td>
                    <td className="py-2 font-mono text-xs">hollow-data.json</td>
                  </tr>
                  <tr className="border-b border-hairline/50">
                    <td className="py-2">XP, level, rank, streak, achievements</td>
                    <td className="py-2 font-mono text-xs">hollow-data.json</td>
                  </tr>
                  <tr className="border-b border-hairline/50">
                    <td className="py-2">Hydration log</td>
                    <td className="py-2 font-mono text-xs">hollow-data.json</td>
                  </tr>
                  <tr className="border-b border-hairline/50">
                    <td className="py-2">Preferences</td>
                    <td className="py-2 font-mono text-xs">hollow-data.json</td>
                  </tr>
                  <tr>
                    <td className="py-2">Window position (desktop)</td>
                    <td className="py-2 font-mono text-xs">hollow-data.json</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-sm bg-bg-2 border border-hairline">
              <p className="text-sm text-ink-3 font-medium mb-2">Data file locations</p>
              <ul className="space-y-1 text-sm text-ink-2">
                <li><span className="text-ink-4">Windows:</span> <code className="text-xs text-ember font-mono">%APPDATA%\com.hollow.fasting-widget\</code></li>
                <li><span className="text-ink-4">macOS:</span> <code className="text-xs text-ember font-mono">~/Library/Application Support/com.hollow.fasting-widget/</code></li>
                <li><span className="text-ink-4">Linux:</span> <code className="text-xs text-ember font-mono">~/.local/share/com.hollow.fasting-widget/</code></li>
                <li><span className="text-ink-4">Android:</span> App-private sandbox (only Hollow can read it)</li>
                <li><span className="text-ink-4">iOS:</span> App sandbox (only Hollow can read it)</li>
              </ul>
            </div>
          </section>

          {/* What we don't do */}
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              What Hollow does not do
            </h2>
            <ul className="space-y-2">
              {[
                "No accounts. There is nothing to sign up for.",
                "No cloud sync. Your data does not leave your device.",
                "No analytics. We don't know how often you fast.",
                "No crash reporting. If Hollow crashes, only you see it.",
                "No third-party SDKs. No Sentry, Mixpanel, Firebase, Google Analytics.",
                "No advertising. Hollow does not show ads.",
                "No A/B testing. Every install runs the same code.",
                "No background data collection. The app does nothing when closed.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#95bf83"
                    strokeWidth="2.5"
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Network */}
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Network access
            </h2>
            <p className="text-ink-2 leading-relaxed">
              <strong className="text-ink font-medium">Zero outbound requests during normal operation.</strong>{" "}
              Geist Sans and Geist Mono are bundled with the app via{" "}
              <code className="text-xs bg-bg-2 px-1 py-0.5 rounded-sm font-mono">@fontsource/geist*</code> —
              no Google Fonts CDN, no <code className="text-xs bg-bg-2 px-1 py-0.5 rounded-sm font-mono">fonts.googleapis.com</code>{" "}
              request at any point.
            </p>
            <p className="text-ink-3 text-sm mt-3 leading-relaxed">
              The only future exception will be the Tauri auto-updater (not yet configured),
              which makes a single request on launch to check for new versions — and can be
              disabled entirely.
            </p>
          </section>

          {/* Your data, your control */}
          <section>
            <h2 className="text-xl font-semibold text-ink mb-3">
              Your data, your control
            </h2>
            <p className="text-ink-2 leading-relaxed">
              In Settings → Data you can export a JSON backup, import a previous export,
              or permanently wipe all data. Uninstalling the app removes its sandboxed data
              automatically on Android and iOS. On desktop, delete the data directory
              manually if you want a clean slate.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-hairline">
            <p className="text-ink-3 text-sm leading-relaxed">
              If you find something in the app that contradicts this document, open a{" "}
              <a
                href="https://github.com/wolverinetole/hollow/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember hover:underline"
              >
                GitHub issue
              </a>
              . The discrepancy is the bug; this page is the spec.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
