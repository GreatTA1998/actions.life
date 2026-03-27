<script>
  import TopNavbar from '../../(home)/components/TopNavbar.svelte';
</script>

<div class="legal-page-background">
  <div style="position: absolute; top: 0; left: 0; right: 0;">
    <TopNavbar />
  </div>

  <div class="content-container">
    <h1>Privacy Policy</h1>
    <p class="date">Last updated: {new Date().toLocaleDateString()}</p>

    <section>
      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>actions.life</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
      </p>
    </section>

    <section>
      <h2>2. Information We Collect</h2>
      <p>
        We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
      </p>
      <p>The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
      <ul>
        <li><strong>Google Calendar Data.</strong> We access your Google Calendar data strictly on a read-only basis to display your schedule within the application. <strong>We do not store, save, or retain any of your calendar data on our servers.</strong> This data is fetched directly from Google APIs for display purposes only and is not used for any other purpose.</li>
        <li><strong>Personal Information Provided by You.</strong> We collect names; email addresses; and other similar information.</li>
        <li><strong>Google Account Data.</strong> When you choose to register or log in with your Google account, we collect your name, email address, and profile picture to create and manage your account.</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Your Information</h2>
      <p>
        We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
      </p>
      <ul>
        <li>To facilitate account creation and logon process.</li>
        <li>To send you administrative information.</li>
        <li>To protect our Services.</li>
      </ul>
    </section>

    <section>
      <h2>4. Will Your Information be Shared with Anyone?</h2>
      <p>
        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis:
      </p>
      <ul>
        <li><strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information for a specific purpose.</li>
        <li><strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests.</li>
        <li><strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.</li>
        <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
      </ul>
    </section>

    <section>
      <h2>5. How Long Do We Keep Your Information?</h2>
      <p>
        We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
      </p>
    </section>

    <section>
      <h2>6. How Do We Keep Your Information Safe?</h2>
      <p>
        We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information.
      </p>
    </section>

    <section>
      <h2>7. Your Privacy Rights</h2>
      <p>
        In some regions (like the EEA and UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. To make such a request, please use the contact details provided below.
      </p>
    </section>

    <section>
      <h2>8. Contact Us</h2>
      <p>
        If you have questions or comments about this policy, you may email us at support@actions.life.
      </p>
    </section>
  </div>
</div>

<style>
  .legal-page-background {
    background: linear-gradient(
      135deg,
      #f7f0e1 0%,
      #e8f4f0 25%,
      #d4e8e0 50%,
      #c8dcd2 75%,
      #bfd3c7 100%
    );
    min-height: 100vh;
    padding-top: 80px;
    padding-bottom: 40px;
  }

  .content-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  h1 {
    font-size: 2.5rem;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .date {
    color: #718096;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }

  section {
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.6;
    color: #4a5568;
    margin-bottom: 1rem;
  }

  ul {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    color: #4a5568;
  }

  @media (max-width: 600px) {
    .content-container {
      padding: 20px;
      margin: 0 16px;
    }

    h1 {
      font-size: 2rem;
    }
  }
</style>