
import React from 'react';

const DataProtection = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Data Protection Policy</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <div>
              <p><strong>Effective Date:</strong> July 7, 2025</p>
            </div>

            <p className="text-foreground">
              GLO is committed to protecting the privacy and data of its users, in line with the Kenya Data Protection Act, 2019, and international data protection standards (including GDPR).
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Data Controller</h2>
              <p>The data controller is:</p>
              <div className="ml-4">
                <p><strong>Dinah Buyeke Masanda</strong></p>
                <p>Founder, GLO</p>
                <p>Email: <a href="mailto:support@glo.org" className="text-accent hover:underline">support@glo.org</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Principles of Data Protection</h2>
              <p>We follow these principles:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process data lawfully and fairly</li>
                <li>Collect only necessary data</li>
                <li>Maintain accuracy and allow for correction</li>
                <li>Retain only as long as needed</li>
                <li>Ensure confidentiality and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Security Measures</h2>
              <p>We protect your data using:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption</li>
                <li>Secure Supabase storage</li>
                <li>Password-protected access for administrators</li>
                <li>Daily system monitoring for threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. User Rights</h2>
              <p>You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to your data</li>
                <li>Correct or delete your information</li>
                <li>Withdraw consent</li>
                <li>Request that we stop processing your data</li>
              </ul>
              <p className="mt-4">
                Contact: <a href="mailto:support@glo.org" className="text-accent hover:underline">support@glo.org</a> to submit a request.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Breach Protocol</h2>
              <p>In case of a breach:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We will notify affected users within 72 hours</li>
                <li>Authorities will be informed if legally required</li>
                <li>All access points will be reviewed and secured</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProtection;
