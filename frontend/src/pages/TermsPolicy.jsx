import React from "react";
import MainWrapper from "@/components/MainWrapper";

const H2 = ({ children }) => (
  <h2 className="mx-3 my-6 text-2xl font-semibold text-gradient">{children}</h2>
);

const H3 = ({ children }) => (
  <h3 className="mx-5 my-3">{children}</h3>
);

const Ul = ({ children }) => <ul className="list-disc ml-8">{children}</ul>;

const Article = () => (
  <article>
    <H2>Terms of Service</H2>

    <H3>Acceptance of Terms</H3>
    <p>
      By using our service, you agree to comply with these Terms. If you do not
      agree, do not use the service.
    </p>

    <H3>Account Responsibilities</H3>
    <p>
      You are responsible for maintaining the security of your account and any
      activities that occur under it.
    </p>

    <H3>User Content</H3>
    <p>
      You own your content but grant us a non-exclusive license to use, display,
      and distribute it on our platform. Ensure your content does not violate
      any laws.
    </p>

    <H3>Prohibited Activities</H3>
    <p>
      You agree not to engage in unlawful activities, post harmful content, or
      use the platform for malicious purposes.
    </p>

    <H3>Termination of Service</H3>
    <p>
      We may suspend or terminate your account at any time if you violate these
      terms.
    </p>

    <H3>Disclaimer of Warranties</H3>
    <p>
      We provide the service "as-is" and make no warranties, express or implied,
      regarding the service's functionality or availability.
    </p>

    <H3>Limitation of Liability</H3>
    <p>
      We are not responsible for any damages or losses resulting from your use
      of the platform.
    </p>

    <H3>Changes to Terms</H3>
    <p>
      We reserve the right to update these Terms, and you will be notified of
      any significant changes.
    </p>

    <H2>Privacy Policy</H2>
    <p>
      We respect your privacy and are committed to protecting your personal
      data. This policy explains how we collect, use, and protect your
      information.
    </p>

    <H3>Data We Collect</H3>
    <Ul>
      <li>
        Personal details: name, email, etc., for account management and
        communication.
      </li>
      <li>
        Site usage data: IP address, browser, OS, etc., for site optimization.
      </li>
      <li>User-generated content: posts, comments, and interactions.</li>
    </Ul>

    <H3>Data Usage</H3>
    <Ul>
      <li>Provide, maintain, and improve our services.</li>
      <li>Protect our users and ensure a safe environment.</li>
      <li>For account-related communications and legal obligations.</li>
    </Ul>

    <H3>User Rights</H3>
    <Ul>
      <li>Access, rectification, deletion of personal data.</li>
    </Ul>

    <H3>Content Posted by Users</H3>
    <Ul>
      <li>Publicly accessible and can be viewed by others.</li>
      <li>Do not post sensitive information.</li>
      <li>
        Any content shared publicly will be retained unless you request removal.
      </li>
    </Ul>
    <H3>Policy Changes</H3>
    <p>Any changes to this Privacy Policy will be posted here.</p>

    <H2>Cookies Policy</H2>
    <p>
      We use cookies to improve user experience and provide essential services,
      including account logins, session management, and personalized content.
    </p>
    <p>
      By using our site, you consent to the use of cookies. You can manage or
      disable cookies via your browser settings, but some features may not
      function properly without them.
    </p>

    <H3>Types of Cookies Used:</H3>
    <Ul>
      <li>Necessary cookies for website functionality.</li>
    </Ul>

    <H3>Managing Cookies:</H3>
    <Ul>
      <li>Most browsers allow you to disable cookies.</li>
      <li>Disabling cookies may affect site functionality.</li>
    </Ul>

    <H3>Policy Changes</H3>
    <p>Any changes to this Privacy Policy will be posted here.</p>
  </article>
);

// The Privacy Policy page.
const PrivacyPolicy = () => (
  <MainWrapper title="Privacy and Terms">
    <Article />
  </MainWrapper>
);

export default PrivacyPolicy;
