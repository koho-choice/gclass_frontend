import React from "react";
import "../style/PrivacyPolicy.css";

const TermsOfService: React.FC = () => {
  return (
    <div className="privacy-policy">
      <h1>Terms of Service for Crex</h1>
      <p>Effective Date: 4/26/2025</p>
      <p>
        Welcome to Crex ("we," "our," "us"). By accessing or using Crex (the
        "Service"), you agree to be bound by these Terms of Service ("Terms").
        If you do not agree to these Terms, please do not use the Service.
      </p>

      <section>
        <h2>1. Use of the Service</h2>
        <p>
          Crex provides a platform to help teachers streamline grading
          assignments. You agree to use the Service only for lawful educational
          purposes and in compliance with all applicable laws, regulations, and
          these Terms.
        </p>
      </section>

      <section>
        <h2>2. Account Registration</h2>
        <p>
          To use Crex, you must authenticate via Google. You agree to provide
          accurate, current, and complete information and to keep your account
          credentials secure. You are responsible for all activity that occurs
          under your account.
        </p>
      </section>

      <section>
        <h2>3. Data Ownership and Responsibility</h2>
        <p>
          You retain all rights to the student data and submissions you upload
          to Crex. By using the Service, you grant Crex a limited license to
          store, process, and manage your data solely to provide and improve the
          Service. You are responsible for ensuring that you have the necessary
          rights and permissions to upload any information, including student
          data, to Crex.
        </p>
      </section>

      <section>
        <h2>4. FERPA Compliance</h2>
        <p>
          If you are an educational institution or school official subject to
          the Family Educational Rights and Privacy Act (FERPA), you agree that
          Crex acts as a "School Official" with "legitimate educational
          interests" under FERPA. We use student data exclusively to fulfill our
          service obligations and do not use such data for any other purpose.
        </p>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use Crex for any illegal, harmful, or abusive activity.</li>
          <li>
            Upload content you do not have rights to or that violates the rights
            of others.
          </li>
          <li>
            Attempt to access or interfere with other users' data or accounts.
          </li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </p>
      </section>

      <section>
        <h2>6. Third-Party Services</h2>
        <p>
          Crex integrates with third-party services such as Google
          Authentication and AWS for storage. Your use of those services may be
          subject to separate terms and policies.
        </p>
      </section>

      <section>
        <h2>7. Service Availability</h2>
        <p>
          We aim to provide continuous access to Crex, but we do not guarantee
          that the Service will be available at all times. We may suspend or
          discontinue the Service at our discretion.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Crex is not liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. If we make significant
          changes, we will notify you through the Service or by other means.
          Your continued use of Crex after changes are effective constitutes
          acceptance of the new Terms.
        </p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the State of [Insert your
          state, e.g., Delaware], without regard to its conflict of laws
          principles.
        </p>
      </section>

      <section>
        <h2>11. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact:</p>
        <p>
          Tunde
          <br />
          Email: <a href="mailto:tunde@trycrex.com">tunde@trycrex.com</a>
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
