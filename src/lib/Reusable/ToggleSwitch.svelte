<script>
  export let label = ''
  export let checked = false
  export let onChange = () => {}
</script>

<div class="toggle-container">
  <label class="switch-label">
    <span class="label-text">{label}</span>
    <div class="toggle-switch">
      <input 
        type="checkbox"
        bind:checked
        on:change={onChange}
      />
      <span class="slider"></span>
    </div>
  </label>
</div>

<style>
  .toggle-container {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    background: white;
    border-bottom: 1px solid #eee;
  }

  .switch-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    user-select: none;
  }

  .label-text {
    font-size: 16px;
    color: #333;
    margin-right: 16px;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    flex-shrink: 0;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  input:checked + .slider {
    background-color: #4a90e2;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #4a90e2;
  }
</style> 