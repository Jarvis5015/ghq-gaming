// src/pages/PrivacyPolicy.jsx
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-10 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <div className="font-mono text-[10px] text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Legal</div>
          <h1 className="font-display font-bold text-5xl text-white">PRIVACY POLICY</h1>
          <p className="font-body text-[#4a5568] mt-3">Last updated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>

        <div className="space-y-8 font-body text-[#e8eaf6]/80 leading-relaxed">

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">1. Introduction</h2>
            <p>GamerHeadQuarter ("GHQ", "we", "our", or "us") operates the website and gaming tournament platform at this domain. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Account Information:</strong> Username, email address, and encrypted password when you register.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Game Profiles:</strong> In-game usernames and game IDs you voluntarily add to your profile.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Payment Information:</strong> UPI IDs submitted for Gollar top-ups and withdrawals. We do not store full payment card details.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Usage Data:</strong> Tournament participation, match history, and activity on the platform.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Device Information:</strong> Browser type, IP address, and device identifiers for security purposes.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To provide and operate the GHQ tournament platform</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To process Gollar purchases and withdrawals</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To display tournament results and leaderboards</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To communicate important platform updates</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To detect and prevent fraud or abuse</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>To improve our services based on usage patterns</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">4. Google AdSense & Advertising</h2>
            <p className="mb-3">We use Google AdSense to display advertisements on our platform. Google AdSense may use cookies and similar technologies to show you relevant ads based on your browsing history.</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Google may collect data about your visits to this and other websites to show personalized ads.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:text-white transition-colors">Google Ads Settings</a>.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>For more information about Google's privacy practices, visit the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:text-white transition-colors">Google Privacy Policy</a>.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Free tournament entry may require viewing advertisements. Ad viewing is tracked only to verify completion — no personal browsing data is shared with us from this process.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">5. Cookies</h2>
            <p className="mb-3">We and our advertising partners use cookies to:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Keep you logged in to your GHQ account</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Remember your preferences</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Display relevant advertisements (via Google AdSense)</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Analyse site traffic and usage</span></li>
            </ul>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect some platform features.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">6. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Google:</strong> For advertising services via AdSense (see Section 4)</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Payment processors:</strong> UPI details shared only to process your requested transactions</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span><strong className="text-white">Legal requirements:</strong> If required by law or to protect the rights of GHQ</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">7. Data Security</h2>
            <p>We use industry-standard security measures including password hashing (bcrypt), JWT authentication tokens, and HTTPS encryption. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Access the personal data we hold about you</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Request correction of inaccurate data</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Request deletion of your account and associated data</span></li>
              <li className="flex items-start gap-2"><span className="text-[#00f5ff] mt-1">•</span><span>Withdraw consent for data processing at any time</span></li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">9. Children's Privacy</h2>
            <p>GHQ is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email or via a notice on the platform. Continued use of GHQ after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white mb-3">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
            <div className="mt-3 p-4 border border-[#1a2545] bg-[#0a0f1e]">
              <div className="font-display font-bold text-white">GamerHeadQuarter (GHQ)</div>
              <div className="font-mono text-sm text-[#00f5ff] mt-1">contact@ghq.gg</div>
              <div className="font-mono text-xs text-[#4a5568] mt-1">India</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
