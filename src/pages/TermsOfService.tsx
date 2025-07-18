
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <div>
              <p><strong>Effective Date:</strong> July 7, 2025</p>
            </div>

            <p className="text-foreground">
              Welcome to GLO. These Terms of Service govern your access to and use of our website and services. By using our platform, you agree to the terms below.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Eligibility</h2>
              <p>
                You must be at least 13 years old to use this platform. If under 18, parental or guardian consent may be required for certain services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Acceptable Use</h2>
              <p>Users must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Avoid abuse, fraud, or harassment of any kind</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Services Offered</h2>
              <p>
                GLO facilitates access to third-party service providers. While we vet our partners, we are not liable for the actions of third-party organizations. GLO is not an emergency service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
              <p>
                All content and code on this platform are owned by GLO or its licensors. You may not reuse or distribute this content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate user access if these terms are violated or if the platform is misused.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
