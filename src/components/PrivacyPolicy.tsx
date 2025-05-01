import React from "react";
import "../style/PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy">
      <h1>Privacy Policy for Crex</h1>
      <p>Effective Date: 4/26/2025</p>
      <p>
        Thank you for using Crex ("we," "our," "us"). Your privacy is important
        to us. This Privacy Policy explains how we collect, use, and protect
        your information when you use Crex (the "Service").
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>When you use Crex, we collect the following information:</p>
        <ul>
          <li>
            <strong>Personal Information:</strong> Your name, email address, and
            files you upload (e.g., assignments, rosters).
          </li>
          <li>
            <strong>Authentication Information:</strong> If you sign in through
            Google, we collect basic profile details necessary to authenticate
            your account.
          </li>
          <li>
            <strong>Assignment and Roster Data:</strong> We collect student
            names and submissions for the purpose of grading.
          </li>
        </ul>
        <p>
          We only collect information necessary to provide and improve the
          Service.
        </p>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain Crex.</li>
          <li>
            Save you time by pre-filling assignment and roster information.
          </li>
          <li>Securely store and manage assignment submissions.</li>
          <li>
            Communicate with you, including support requests or important
            service updates.
          </li>
        </ul>
        <p>
          We do not sell, rent, or share your personal information with third
          parties for marketing purposes.
        </p>
      </section>

      <section>
        <h2>3. Third-Party Services</h2>
        <p>We use the following third-party services to operate Crex:</p>
        <ul>
          <li>
            <strong>Google Authentication:</strong> To securely log you into
            your account.
          </li>
          <li>
            <strong>AWS S3:</strong> To store assignment submissions.
          </li>
          <li>
            <strong>AWS RDS (PostgreSQL Database):</strong> To store user
            account information and roster data.
          </li>
        </ul>
        <p>
          These services may collect information in accordance with their own
          privacy policies.
        </p>
      </section>

      <section>
        <h2>4. FERPA Compliance</h2>
        <p>
          Crex is committed to protecting the privacy of student education
          records in compliance with the Family Educational Rights and Privacy
          Act (FERPA). We:
        </p>
        <ul>
          <li>
            Only collect, process, and store student information as directed by
            authorized school officials (i.e., teachers).
          </li>
          <li>
            Use student data solely to provide grading services and related
            functionality within Crex.
          </li>
          <li>
            Do not use student data for advertising, marketing, or other
            commercial purposes.
          </li>
          <li>
            Provide access to student information only to authorized personnel
            and implement strict security controls.
          </li>
          <li>
            Allow educational institutions to request the deletion of student
            data at any time.
          </li>
        </ul>
        <p>
          By using Crex, you (as a school official) acknowledge that our
          handling of student information is compliant with your FERPA
          responsibilities.
        </p>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>
          We take reasonable measures to protect your information, including
          encryption, access controls, and secure storage practices. However, no
          method of transmission over the Internet or method of electronic
          storage is 100% secure.
        </p>
      </section>

      <section>
        <h2>6. Children's Privacy</h2>
        <p>
          Crex is not intended for children under the age of 13, and we do not
          knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          information at any time by contacting us.
        </p>
      </section>

      <section>
        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page.
        </p>
      </section>

      <section>
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or your personal
          data, please contact:
        </p>
        <p>
          Tunde
          <br />
          Email: <a href="mailto:tunde@trycrex.com">tunde@trycrex.com</a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
