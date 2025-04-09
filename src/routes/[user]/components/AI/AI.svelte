<script>
  import { user } from '/src/lib/store'
  import Task from '/src/lib/db/models/Task.js'
  import text from './text'
  import GPT from './GPT.js'
  import { DateTime } from 'luxon'

  let TheChatInput
  let tasksJSON
  let loading = false

  const DefaultDateRange = {
    startDate: DateTime.now().minus({ month: 2 }).toISODate(),
    endDate: DateTime.now().plus({ month: 2 }).toISODate(),
  }
  
  let state = {
    userID: '',
    chat: [{role: 'assistant', content: text.example}],
    currentInput: '',
    tasksJSON: '',
    DateRange: DefaultDateRange,
  }

  const setState = (newState) => (state = newState)

  $: user.subscribe((value) => {
    state = { ...state, userID: value.uid }
  })

  $: if (TheChatInput) {
    // requestAnimationFrame(() => {
    //   TheChatInput.focus()
    // })
  }

  async function addMessage() {
    if (!tasksJSON) {
      tasksJSON = await Task.getTasksJSONByRange(
        state.userID,
        state.DateRange.startDate,
        state.DateRange.endDate
      )
      setState({ ...state, tasksJSON })
    }

    if (state.currentInput.trim()) {
      loading = true
      setState({
        ...state,
        chat: [...state.chat, { role: 'user', content: state.currentInput }],
      })
    }
    state.currentInput = ''
    const { role, content } = await GPT.chat(state.tasksJSON, state.chat)
    setState({
      ...state,
      chat: [...state.chat, { role, content }],
    })
    loading = false
  }
</script>

<div class="container">
  <div class="chat-box">
    {#each state.chat as message}
      {#if message.role === "user"}
        <div class="message-class">
          <strong>{message.role}:</strong> {message.content}
        </div>
      {:else}
        <div>
          <strong>{message.role}:</strong> {message.content}
        </div>
      {/if}
    {/each}

    {#if loading}
      Loading response...
    {/if}
  </div>

  <div class="input-section">
    <input bind:this={TheChatInput}
      type="text"
      placeholder="Type your message..."
      bind:value={state.currentInput}
    />

    <button on:click={addMessage} class="submit-button">
      <span class="material-symbols-outlined">
        arrow_upward
      </span>
    </button>
  </div>
</div>

<style>
   .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color:  var(--navbar-bg-color);
  }

  .chat-box {
    padding: 1vw;
    flex-grow: 1;
    overflow-y: scroll;
    white-space: pre-wrap;
  }

  .input-section {
    display: flex;
    align-items: center;
    padding: 12px 6px;
    column-gap: 6px;
  }

  .input-section input {
    width: 100%;
    padding: 10px;
    border-radius: 16px;
    font-size: 16px;
    border: none;
  }


  .input-section input:focus {
    outline: none;
    border: none;
  }

  .message-class {
    text-align: right;
    color: #007bff;
  }

  .submit-button {
    display: flex; 
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 16px; 
    width: 32px; 
    height: 32px;
    background-color: #007bff;
    color: white;
  }

  .submit-button:hover {
    background-color: #0056b3;
  }
</style>