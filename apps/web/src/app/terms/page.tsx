import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'DrawSpy Terms of Service — rules, user guidelines, and legal terms for playing DrawSpy.',
  alternates: {
    canonical: 'https://www.drawspy.com/terms',
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
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
            <Link href="/privacy" className="hover:text-sky-600 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-sky-600 transition-colors">Play Now</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using DrawSpy at{' '}
                <a href="https://www.drawspy.com" className="text-sky-600 hover:underline">
                  www.drawspy.com
                </a>
                , you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy.
                If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Description of Service</h2>
              <p>
                DrawSpy is a free, real-time multiplayer browser game combining drawing, guessing, and social deduction.
                Players draw secret words, attempt to guess others&apos; drawings, and identify the hidden Impostor.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. User Code of Conduct</h2>
              <p>
                DrawSpy is intended to be a safe, welcoming, and fun platform for everyone. While playing DrawSpy, you agree NOT to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1.5">
                <li>Draw or type hate speech, racist remarks, offensive slurs, or explicit sexual imagery.</li>
                <li>Harass, threaten, or bully other players in room chat or drawings.</li>
                <li>Use automated bots, scripts, or cheats to gain an unfair advantage or disrupt games.</li>
                <li>Impersonate DrawSpy staff or other players.</li>
                <li>Attempt to bypass security measures, disrupt servers, or flood chat/game rooms with spam.</li>
              </ul>
              <p className="mt-3">
                Room hosts reserve the right to kick players from private rooms, and DrawSpy administrators reserve the right to temporarily or permanently ban players who violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Intellectual Property & User Content</h2>
              <p>
                <strong>Our Content:</strong> The DrawSpy name, logo, design, graphics, software, game mechanics, and code are the exclusive property of DrawSpy.
              </p>
              <p className="mt-2">
                <strong>Your Drawings:</strong> Drawings created during gameplay are temporary ephemeral data transmitted to other room participants. You grant DrawSpy a royalty-free, worldwide license to display these drawings to players within your game session. We do not permanently store or claim ownership of your drawings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Disclaimer of Warranties</h2>
              <p>
                DrawSpy is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted server availability, bug-free gameplay, or zero downtime.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, DrawSpy and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Third-Party Content & Links</h2>
              <p>
                The Service may contain links or embedded elements from third-party services (such as analytics or font delivery networks). We are not responsible for the privacy practices or content of third-party websites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of DrawSpy after modifications constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding these Terms, please contact us at:
              </p>
              <p className="mt-2 font-medium">
                Email: <a href="mailto:hello@drawspy.com" className="text-sky-600 hover:underline">hello@drawspy.com</a>
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DrawSpy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
