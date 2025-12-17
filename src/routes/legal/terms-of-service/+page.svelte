<script>
  import TopNavbar from '../../(home)/components/TopNavbar.svelte';
</script>

<div class="legal-page-background">
  <div style="position: absolute; top: 0; left: 0; right: 0;">
    <TopNavbar />
  </div>

  <div class="content-container">
    <h1>Terms of Service</h1>
    <p class="date">Last updated: {new Date().toLocaleDateString()}</p>

    <section>
      <h2>1. Agreement to Terms</h2>
      <p>
        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>actions.life</strong> ("we," "us" or "our"), concerning your access to and use of the <strong>actions.life</strong> website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
      </p>
      <p>
        You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
      </p>
    </section>

    <section>
      <h2>2. Intellectual Property Rights</h2>
      <p>
        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
      </p>
    </section>

    <section>
      <h2>3. User Representations</h2>
      <p>
        By using the Site, you represent and warrant that:
      </p>
      <ul>
        <li>All registration information you submit will be true, accurate, current, and complete.</li>
        <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
        <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
        <li>You are not a minor in the jurisdiction in which you reside.</li>
        <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
        <li>You will not use the Site for any illegal or unauthorized purpose.</li>
      </ul>
    </section>

    <section>
      <h2>4. Prohibited Activities</h2>
      <p>
        You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
      </p>
    </section>

    <section>
      <h2>5. User Generated Contributions</h2>
      <p>
        The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
      </p>
      <p>
        Contributions may be viewable by other users of the Site and the Marketplace and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.
      </p>
    </section>

    <section>
      <h2>6. Modifications and Interruptions</h2>
      <p>
        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time.
      </p>
    </section>

    <section>
      <h2>7. Governing Law</h2>
      <p>
        These Terms shall be governed by and defined following the laws of your jurisdiction. actions.life and yourself irrevocably consent that the courts of your jurisdiction shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
      </p>
    </section>

    <section>
      <h2>8. Dispute Resolution</h2>
      <p>
        Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration.
      </p>
    </section>

    <section>
      <h2>9. Corrections</h2>
      <p>
        There may be information on the Site that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Site at any time, without prior notice.
      </p>
    </section>

    <section>
      <h2>10. Contact Us</h2>
      <p>
        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@actions.life.
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