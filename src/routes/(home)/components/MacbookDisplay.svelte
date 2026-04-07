<script>
  let { children } = $props()
</script>

<!-- MacBook Skeleton -->
<div class="relative flex flex-col items-center w-[90vw] max-w-[900px] mt-12 mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
  
  <!-- Screen Assembly -->
  <div class="relative w-full aspect-[16/10] bg-black rounded-t-[20px] p-2 sm:p-3 shadow-2xl border-[1px] border-[#333] flex flex-col">
    
    <!-- Screen Display -->
    <div class="relative w-full h-full bg-white rounded-[8px] overflow-auto flex flex-col justify-center items-center [transform:translate3d(0,0,0)]">
      
      {@render children()}
    </div>
  </div>

  <!-- MacBook Base -->
  <div class="relative w-[110%] h-[18px] sm:h-[22px] bg-gradient-to-b from-[#e0e0e0] to-[#a3a3a3] rounded-b-[12px] sm:rounded-b-[16px] flex justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-t border-[#b0b0b0]">
    <!-- Thumb Indent -->
    <div class="w-24 sm:w-32 h-[5px] sm:h-[6px] bg-[#999] rounded-b-[6px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"></div>
  </div>
</div>