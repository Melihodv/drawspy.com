import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'DrawSpy Privacy Policy — learn how we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://www.drawspy.com/privacy',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = 'October 4, 2026';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-slate-900 tracking-tight hover:text-sky-600 transition-colors">
            Draw<span className="text-sky-500">Spy</span>
          </Link>
          <nav className="flex gap-5 text-sm font-semibold text-slate-600">
            <Link href="/terms" className="hover:text-sky-600 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-sky-600 transition-colors">Play Now</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Who We Are</h2>
              <p>
                DrawSpy (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the website{' '}
                <a href="https://www.drawspy.com" className="text-sky-600 hover:underline">
                  www.drawspy.com
                </a>{' '}
                — a free, browser-based multiplayer drawing and social deduction game. You can
                contact us at{' '}
                <a href="mailto:hello@drawspy.com" className="text-sky-600 hover:underline">
                  hello@drawspy.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. What Data We Collect</h2>
              <p>DrawSpy is designed to collect as little data as possible. Specifically:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>
                  <strong>Nickname & Avatar:</strong> The display name and avatar you choose before
                  playing. These are stored only in your browser&apos;s <code>localStorage</code> and
                  are sent to our game server only during an active session. We do not store them
                  permanently on our servers.
                </li>
                <li>
                  <strong>Session Token:</strong> A randomly-generated UUID stored in{' '}
                  <code>localStorage</code> to maintain your game session. It contains no personal
                  information.
                </li>
                <li>
                  <strong>Game Events:</strong> In-game actions (drawing strokes, chat messages,
                  votes) are transmitted in real-time and exist only in memory for the duration of
                  the room. They are not persisted to any database.
                </li>
                <li>
                  <strong>Server Logs:</strong> Our server records standard access logs (IP address,
                  timestamp, HTTP request). These logs are retained for up to 30 days for security
                  and debugging purposes.
                </li>
              </ul>
              <p className="mt-3">
                <strong>We do not require account registration.</strong> We do not collect email
                addresses, passwords, or any other personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>To provide and maintain the game service.</li>
                <li>To display your chosen nickname and avatar to other players in the same room.</li>
                <li>To detect and prevent abuse, cheating, and security threats.</li>
                <li>To analyze aggregated, anonymous usage patterns to improve the game.</li>
              </ul>
              <p className="mt-3">We do not sell, rent, or share your data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Cookies & Local Storage</h2>
              <p>DrawSpy does not use tracking cookies or advertising cookies. We use browser{' '}
                <code>localStorage</code> exclusively to remember:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Your chosen nickname (<code>ds_nickname</code>)</li>
                <li>Your chosen avatar index (<code>ds_avatar</code>)</li>
                <li>Your language preference (<code>ds_lang</code>)</li>
                <li>Your session token (<code>ds_session</code>)</li>
              </ul>
              <p className="mt-3">
                You can clear this data at any time by clearing your browser&apos;s local storage or
                using your browser&apos;s developer tools.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Third-Party Services</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  <strong>Google Fonts:</strong> We load fonts from Google Fonts
                  (fonts.googleapis.com). Google may collect anonymized request data. See{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>.
                </li>
                <li>
                  <strong>Vercel:</strong> Our frontend is hosted on Vercel, which may process
                  request metadata. See{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Vercel&apos;s Privacy Policy
                  </a>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Children&apos;s Privacy</h2>
              <p>
                DrawSpy is suitable for all ages, but we do not knowingly collect personal data from
                children under 13. If you believe a child has provided personal information, please
                contact us at{' '}
                <a href="mailto:hello@drawspy.com" className="text-sky-600 hover:underline">
                  hello@drawspy.com
                </a>{' '}
                and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Your Rights (GDPR / KVKK)</h2>
              <p>
                If you are located in the European Economic Area (EEA) or Turkey, you have the
                following rights under GDPR / KVKK:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Right to access the data we hold about you.</li>
                <li>Right to rectification of inaccurate data.</li>
                <li>Right to erasure (&quot;right to be forgotten&quot;).</li>
                <li>Right to restrict or object to processing.</li>
                <li>Right to data portability.</li>
              </ul>
              <p className="mt-3">
                Since we store almost no personal data, most of these rights can be exercised simply
                by clearing your browser&apos;s local storage. For server-side data (access logs),
                contact us at{' '}
                <a href="mailto:hello@drawspy.com" className="text-sky-600 hover:underline">
                  hello@drawspy.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Data Retention</h2>
              <p>
                In-game data (nickname, avatar, game events) exists only in server memory for the
                duration of an active room and is discarded when the room ends. Server access logs
                are retained for up to 30 days then automatically deleted.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Security</h2>
              <p>
                We implement industry-standard security measures including HTTPS encryption, HTTP
                security headers (HSTS, X-Frame-Options, Content-Security-Policy), and rate
                limiting. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will update the &quot;Last
                updated&quot; date at the top of this page. Continued use of DrawSpy after any
                changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">11. Contact</h2>
              <p>
                For any privacy-related questions or requests, contact us at:{' '}
                <a href="mailto:hello@drawspy.com" className="text-sky-600 hover:underline font-semibold">
                  hello@drawspy.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-500">
        <span>DrawSpy © 2026 &nbsp;·&nbsp; </span>
        <Link href="/terms" className="hover:text-sky-600 transition-colors">Terms of Service</Link>
        <span> &nbsp;·&nbsp; </span>
        <Link href="/" className="hover:text-sky-600 transition-colors">Back to Game</Link>
      </footer>
    </div>
  );
}
