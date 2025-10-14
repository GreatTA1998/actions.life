<script>
  let { 
    checked = false, 
    label = '',
    onchange = () => {}
  } = $props()
</script>

<label class="toggle-switch">
  <input type="checkbox" {checked} {onchange} style="margin: 0;">
  <span class="toggle-slider"></span>
  <span class="toggle-label">{label}</span>
</label>

<style>
  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    height: 32px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    background-color: #e0e0e0;
    border-radius: 20px;
    transition: background-color 0.2s;
  }

  .toggle-slider:before {
    content: "";
    position: absolute;
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: #1a73e8;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(16px);
  }

  .toggle-label {
    margin-left: 8px;
    font-size: 14px;
    color: #70757a;
  }
</style> 