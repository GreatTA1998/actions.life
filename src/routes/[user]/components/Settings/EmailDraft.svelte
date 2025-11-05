<script>
  import UXFormTextArea from '$lib/components/UXFormTextArea.svelte'
  import { sendEmail } from '$lib/utils/cloudFunctions.js'
  import { showUndoSnackbar } from '$lib/store'

  let messageBody = ''
  let isSending = false

  async function handleSendEmail() {
    if (!messageBody.trim() || isSending) return

    isSending = true
    const fullMessage = `Hello,\n\n${messageBody}\n\nBest Regards`
    
    try {
      await sendEmail({
        subject: 'Support Request',
        content: fullMessage,
        toWho: 'elton@explanations.io'
      })
      
      messageBody = ''
      showUndoSnackbar('Email sent successfully.', null)
    } catch (error) {
      console.error('Failed to send email:', error)
      showUndoSnackbar('Failed to send email. Please try again.', null)
    } finally {
      isSending = false
    }
  }
</script>

<div class="email-draft-section">
  <div class="email-header">
    <div class="email-field">
      <span class="email-field-label">To:</span>
      <span class="email-field-value">elton@explanations.io</span>
    </div>
  </div>
  
  <div class="email-body">
    <div class="email-prefix">Hello,</div>
    
    <UXFormTextArea 
      value={messageBody}
      oninput={e => messageBody = e.target.value}
      fieldLabel=""
      placeholder="Type your message here..."
    />
    
    <div class="email-suffix">Best Regards</div>
  </div>

  <div class="email-footer">
    <button on:click={handleSendEmail} class="send-email-button" disabled={!messageBody.trim() || isSending}>
      <span class="material-symbols-outlined">send</span>
      <span>{isSending ? 'Sending...' : 'Send'}</span>
    </button>
  </div>
</div>

<style>
  .email-draft-section {
    display: flex;
    flex-direction: column;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    background: white;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .email-header {
    border-bottom: 1px solid #eaeaea;
    padding: 12px 16px;
  }

  .email-field {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .email-field-label {
    font-size: 14px;
    font-weight: 500;
    color: #777;
    min-width: 32px;
  }

  .email-field-value {
    font-size: 14px;
    color: #3d3d3d;
    flex: 1;
  }

  .email-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .email-prefix,
  .email-suffix {
    font-size: 14px;
    color: #aaa;
    font-style: italic;
    padding: 0 4px;
  }

  .email-footer {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
    border-top: 1px solid #eaeaea;
  }

  .send-email-button {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #252525;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 500;
  }

  .send-email-button:hover:not(:disabled) {
    background: #1a1a1a;
  }

  .send-email-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-email-button span.material-symbols-outlined {
    font-size: 16px;
  }
</style>

