<script>
  import { user } from "../../store";
  import Tasks from "../../back-end/Tasks";
  import text from "./text";
  import GPT from "../../back-end/GPT.js";
  import { onMount, tick } from "svelte";
  import { DateTime } from "luxon";

  let TheChatInput

  const DefaultDateRange = {
    startDate: DateTime.now().minus({ month: 2 }).toISODate(),
    endDate: DateTime.now().plus({ month: 2 }).toISODate(),
  };
  
  let state = {
    userID: "",
    chat: [{role: 'assistant', content: text.example}],
    currentInput: "",
    tasksJSON: "",
    DateRange: DefaultDateRange,
  };

  const setState = (newState) => (state = newState);

  $: user.subscribe((value) => {
    state = { ...state, userID: value.uid };
  });

  $: if (TheChatInput) {
    
    requestAnimationFrame(() => {
      TheChatInput.focus()
    })
  }

  onMount(async () => {
    const tasksJSON = await Tasks.getTasksJSONByRange(
      state.userID,
      state.DateRange.startDate,
      state.DateRange.endDate
    ).catch((err) => {
      console.error("error in onMount, ", err);
    });
    setState({ ...state, tasksJSON });

    await tick()
  });

  async function addMessage() {
    if (state.currentInput.trim()) {
      setState({
        ...state,
        chat: [...state.chat, { role: "user", content: state.currentInput }],
      });
    }
    state.currentInput = "";
    const { role, content } = await GPT.chat(state.tasksJSON, state.chat);
    setState({
      ...state,
      chat: [...state.chat, { role, content }],
    });
  }
</script>

<div class="container">
  <div class="chat-box">
    {#each state.chat as message}
      {#if message.role === "user"}
        <div class="message-class">
          <strong>{message.role}:</strong>
          {message.content}
        </div>
      {:else}
        <div>
          <strong>{message.role}:</strong>
          {message.content}
        </div>
      {/if}
    {/each}
  </div>

  <div class="input-section">
    <input bind:this={TheChatInput}
      type="text"
      placeholder="Type your message..."
      bind:value={state.currentInput}
    />

    <button class="submit-button" on:click={addMessage}>
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
    /* background-color: var(--todo-list-bg-color); */
    background-color:  var(--navbar-bg-color);
  }

  .chat-box {
    /* border-radius: 16px; */
    /* margin: auto; */
    padding: 1vw;
    flex-grow: 1;
    /* border: 1px solid #ccc; */
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
    /* border: 1px solid #ccc; */
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

<!-- <style src="./AI.css"></style> -->