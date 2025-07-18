
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <div>
              <p><strong>Effective Date:</strong> July 7, 2025</p>
              <p><strong>Last Updated:</strong> July 7, 2025</p>
            </div>

            <p className="text-foreground">
              GLO is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you interact with our platform, website, or services.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <p>We may collect the following information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal details (e.g., name, age, gender, and location)</li>
                <li>Contact details (e.g., email address and phone number)</li>
                <li>Service preferences and support needs (e.g., shelter, legal aid, job placement)</li>
                <li>Chatbot interactions and session logs</li>
                <li>Device and usage data (e.g., browser type, IP address)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide personalized service referrals</li>
                <li>Monitor impact and improve our services</li>
                <li>Analyze user behavior for training the chatbot</li>
                <li>Fulfill legal or regulatory obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
              <p>We process data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your explicit consent</li>
                <li>Legitimate interest in improving access to support</li>
                <li>Legal obligations (e.g., reporting or compliance)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Sharing and Disclosure</h2>
              <p>We do not sell your information. We may share your data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verified service partners (with your consent)</li>
                <li>Technical vendors (e.g., hosting and analytics providers)</li>
                <li>Authorities if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Rights</h2>
              <p>As a user, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct or delete your information</li>
                <li>Withdraw your consent</li>
                <li>Request a copy of your data</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, contact: <a href="mailto:support@glo.org" className="text-accent hover:underline">support@glo.org</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Retention and Storage</h2>
              <p>
                We store data securely on encrypted servers and retain only what is necessary for program delivery, analytics, and auditing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Security Measures</h2>
              <p>
                Our system uses encryption, secure databases (Supabase), and restricted access controls to protect your personal data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
