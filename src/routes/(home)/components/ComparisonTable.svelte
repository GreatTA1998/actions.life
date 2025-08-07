<script>
  // Theme configurations with coordinated colors
  const themes = {
    solid: {
      name: 'Solid',
      table: {
        background: '#18181b',
        borderRadius: '8px',
        border: '1px solid #27272a',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      cell: {
        background: '#18181b',
        color: '#fafafa',
        borderColor: '#27272a',
        hover: '#27272a'
      },
      header: {
        background: '#09090b',
        color: '#a1a1aa',
        fontWeight: '600'
      },
      highlight: {
        background: '#2e1065',
        color: '#c4b5fd'
      }
    },
    glass: {
      name: 'Glass',
      table: {
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(16px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
      },
      cell: {
        background: 'transparent',
        color: '#27272a',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        hover: 'rgba(255, 255, 255, 0.2)'
      },
      header: {
        background: 'rgba(255, 255, 255, 0.15)',
        color: '#52525b',
        fontWeight: '600'
      },
      highlight: {
        background: 'rgba(139, 92, 246, 0.08)',
        color: '#7c3aed'
      }
    },
    minimal: {
      name: 'Minimal',
      table: {
        background: 'transparent',
        borderRadius: '0',
        border: 'none',
        boxShadow: 'none'
      },
      cell: {
        background: 'transparent',
        color: '#3f3f46',
        borderColor: '#e4e4e7',
        borderBottom: true,
        hover: 'rgba(0, 0, 0, 0.02)'
      },
      header: {
        background: 'transparent',
        color: '#18181b',
        fontWeight: '600',
        borderBottom: '2px solid #18181b'
      },
      highlight: {
        background: 'transparent',
        color: '#7c3aed'
      }
    }
  };

  // Highlighting options for actions.life row
  const highlightOptions = {
    typography: {
      name: 'Typography',
      borderLeft: 'none',
      background: 'transparent', 
      fontWeight: '500',
      letterSpacing: '0.01em'
    },
    background: {
      name: 'Background',
      borderLeft: 'none',
      background: 'rgba(251, 191, 36, 0.05)',
      fontWeight: 'inherit',
      letterSpacing: 'normal'
    }
  };

  let selectedTheme = 'solid';
  let selectedHighlight = 'typography';
  $: currentTheme = themes[selectedTheme];
  $: currentHighlight = highlightOptions[selectedHighlight];
  
  // Track hover state for cells
  let hoveredCell = null;

  // Handle cell click to open primary product URL
  function handleCellClick(product, cellIndex) {
    if (cellIndex === 0 && product.primaryLogo) {
      window.open(product.primaryLogo.url, '_blank', 'noopener,noreferrer');
    }
  }

  // Handle keyboard events for accessibility
  function handleCellKeydown(event, product, cellIndex) {
    if ((event.key === 'Enter' || event.key === ' ') && cellIndex === 0 && product.primaryLogo) {
      event.preventDefault();
      window.open(product.primaryLogo.url, '_blank', 'noopener,noreferrer');
    }
  }

  // Product data with logos and URLs
  const products = [
    {
      name: 'Google Calendar',
      primaryLogo: { src: '/competitor_logos/gcal_favicon.ico', url: 'https://calendar.google.com', alt: 'Google Calendar' },
      secondaryLogos: [
        { src: '/competitor_logos/icons8-apple-calendar-96.png', url: 'https://www.icloud.com/calendar', alt: 'Apple Calendar' },
        { src: '/competitor_logos/icons8-outlook-calendar-96.png', url: 'https://outlook.live.com/calendar', alt: 'Microsoft Outlook' },
        { src: '/competitor_logos/Cron-favicon-style2-07.svg', url: 'https://notion.so/product/calendar', alt: 'Notion Calendar' }
      ],
      bestFor: 'Mature ecosystem with reliable integrations. 1B users.',
      weakness: 'Gradual stagnation and feature bloat.'
    },
    {
      name: 'Todoist',
      primaryLogo: { src: '/competitor_logos/todoist.ico', url: 'https://todoist.com', alt: 'Todoist' },
      secondaryLogos: [
        { src: '/competitor_logos/ticktick.png', url: 'https://ticktick.com', alt: 'TickTick' },
        { src: '/competitor_logos/things3.ico', url: 'https://culturedcode.com/things', alt: 'Things 3' }
      ],
      bestFor: 'Different views for everything. Clean context switching. Apple Design Award, 50M users.',
      weakness: 'Requires navigating between multiple views—Today, Upcoming, Projects—which can make it harder to see the full picture at once.'
    },
    {
      name: 'actions.life',
      primaryLogo: { src: '/logo-no-bg.png', url: 'https://actions.life', alt: 'Actions.life' },
      secondaryLogos: [],
      bestFor: "See everything on a unified view, then focus on one thing if needed, 2 users.",
      weakness: 'No notifications, meeting integrations and sharing.',
      isHighlighted: true
    },
    {
      name: 'TimeTree',
      primaryLogo: { src: '/competitor_logos/timetree.ico', url: 'https://timetreeapp.com', alt: 'TimeTree' },
      secondaryLogos: [],
      bestFor: 'Specialized for couples & families to share calendars. 45M users.',
      weakness: 'Not much to offer for individuals.'
    },
    {
      name: 'Motion',
      primaryLogo: { src: '/competitor_logos/motion-svg.svg', url: 'https://usemotion.com', alt: 'Motion' },
      secondaryLogos: [],
      bestFor: 'Specialized for AI-assisted scheduling. 1M paying users.',
      weakness: 'Hard to leverage for non-power users.'
    },
    {
      name: 'Vimcal',
      primaryLogo: { src: '/competitor_logos/vimcal-favicon.png', url: 'https://vimcal.com', alt: 'Vimcal' },
      secondaryLogos: [],
      bestFor: 'Specialized for meetings, efficient UX.',
      weakness: 'Not much to offer outside of work.'
    }
  ];

  // Convert to table format for easier grid rendering
  const tableData = [
    ['Product', 'Unique Strengths', 'Weakness'],
    ...products.map(p => [p, p.bestFor, p.weakness])
  ];

</script>

<div class="table-container">
  <div class="controls">
    <div class="style-toggle">
      <span class="toggle-label">Theme:</span>
      {#each Object.entries(themes) as [key, theme]}
        <button 
          class="toggle-btn" 
          class:active={selectedTheme === key}
          on:click={() => selectedTheme = key}
        >
          {theme.name}
        </button>
      {/each}
    </div>
    
    <div class="highlight-toggle">
      <span class="toggle-label">Highlight:</span>
      {#each Object.entries(highlightOptions) as [key, option]}
        <button 
          class="toggle-btn" 
          class:active={selectedHighlight === key}
          on:click={() => selectedHighlight = key}
        >
          {option.name}
        </button>
      {/each}
    </div>
  </div>
  
  <div 
    class="grid-table {selectedTheme}"
    style:background={currentTheme.table.background}
    style:border-radius={currentTheme.table.borderRadius}
    style:border={currentTheme.table.border}
    style:box-shadow={currentTheme.table.boxShadow}
    style:backdrop-filter={currentTheme.table.backdropFilter}
    style:-webkit-backdrop-filter={currentTheme.table.backdropFilter}
  >
    {#each tableData as row, rowIndex}
      {#each row as cell, cellIndex}
        {@const cellKey = `${rowIndex}-${cellIndex}`}
        {@const isHighlighted = rowIndex > 0 && (cellIndex === 0 && cell.isHighlighted || cellIndex > 0 && tableData[rowIndex][0].isHighlighted)}
        {@const isHovered = hoveredCell === cellKey}
        <div 
          class="grid-cell" 
          class:header={rowIndex === 0}
          class:first-column={cellIndex === 0}
          class:highlight={rowIndex > 0 && cellIndex === 0 && cell.isHighlighted}
          class:highlight-column={rowIndex > 0 && cellIndex > 0 && tableData[rowIndex][0].isHighlighted}
          style:background={rowIndex === 0 ? currentTheme.header.background : (isHighlighted ? currentHighlight.background : (isHovered ? currentTheme.cell.hover : currentTheme.cell.background))}
          style:color={rowIndex === 0 ? currentTheme.header.color : currentTheme.cell.color}
          style:font-weight={rowIndex === 0 ? currentTheme.header.fontWeight : (isHighlighted ? currentHighlight.fontWeight : 'inherit')}
          style:letter-spacing={isHighlighted ? currentHighlight.letterSpacing : 'normal'}
          style:border-left={isHighlighted ? currentHighlight.borderLeft : 'none'}
          style:border-right={selectedTheme === 'minimal' ? 'none' : `1px solid ${currentTheme.cell.borderColor}`}
          style:border-bottom={selectedTheme === 'minimal' && rowIndex === 0 ? currentTheme.header.borderBottom : (selectedTheme === 'minimal' ? `1px solid ${currentTheme.cell.borderColor}` : `1px solid ${currentTheme.cell.borderColor}`)}
          on:mouseenter={() => hoveredCell = cellKey}
          on:mouseleave={() => hoveredCell = null}
          on:click={() => handleCellClick(cell, cellIndex)}
          on:keydown={(e) => handleCellKeydown(e, cell, cellIndex)}
          tabindex={rowIndex > 0 && cellIndex === 0 && cell.primaryLogo ? 0 : undefined}
          role={rowIndex > 0 && cellIndex === 0 && cell.primaryLogo ? 'button' : undefined}
        >
          {#if rowIndex === 0}
            <!-- Header row -->
            {cell}
          {:else if cellIndex === 0}
            <!-- Product column with logo(s) -->
            <div class="product-cell-wrapper">
              <!-- Row with primary product and secondary logos -->
              <div class="product-row">
                <!-- Primary product with name and logo -->
                <div class="primary-product">
                  <a 
                    href={cell.primaryLogo.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="primary-product-link"
                    title={cell.primaryLogo.alt}
                  >
                    <img 
                      src={cell.primaryLogo.src} 
                      alt={cell.primaryLogo.alt} 
                      class="product-logo primary"
                    />
                    <span class="product-name">{cell.name}</span>
                  </a>
                </div>
                <!-- Secondary logos if any -->
                {#if cell.secondaryLogos && cell.secondaryLogos.length > 0}
                  <div class="secondary-logos">
                    {#each cell.secondaryLogos as logo}
                      <a 
                        href={logo.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="secondary-logo-link"
                        title={logo.alt}
                        on:click|stopPropagation
                      >
                        <img 
                          src={logo.src} 
                          alt={logo.alt} 
                          class="product-logo secondary"
                        />
                      </a>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <!-- Other cells -->
            {cell}
          {/if}
        </div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .table-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 48px 24px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }

  /* Controls layout */
  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    align-items: center;
  }

  .style-toggle,
  .highlight-toggle {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    margin-right: 8px;
  }

  .toggle-btn {
    padding: 8px 16px;
    border: 1px solid #e4e4e7;
    background: transparent;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #71717a;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .toggle-btn:hover {
    background: #fafafa;
    color: #18181b;
  }

  .toggle-btn.active {
    background: #18181b;
    color: #ffffff;
    border-color: #18181b;
  }

  /* Base grid setup */
  .grid-table {
    display: grid;
    grid-template-columns: 1.8fr 3fr 1.5fr;
    gap: 0;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  /* Base cell styling */
  .grid-cell {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    font-size: 14px;
    transition: all 0.2s ease;
    line-height: 1.5;
    letter-spacing: -0.006em;
  }

  .grid-cell.header {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    padding: 14px 20px;
  }

  .grid-cell.first-column {
    font-weight: 500;
  }

  /* Highlight Actions.life row with subtle style */
  .grid-cell.highlight,
  .grid-cell.highlight-column {
    font-weight: 500;
  }

  /* Grid borders handled entirely by inline styles */

  /* Hover state */
  .grid-cell:hover {
    cursor: default;
  }

  /* Special handling for minimal theme */
  .minimal .grid-cell {
    border-right: none;
    padding: 20px 0;
  }

  .minimal .grid-cell:nth-child(4n-3) {
    padding-left: 0;
  }

  .minimal .grid-cell:nth-child(4n) {
    padding-right: 0;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .table-container {
      padding: 32px 16px;
    }
    
    .controls {
      margin-bottom: 16px;
    }
    
    .style-toggle,
    .highlight-toggle {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .toggle-label {
      font-size: 13px;
    }
    
    .toggle-btn {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .grid-table {
      font-size: 13px;
    }
    
    .grid-cell {
      padding: 14px 16px;
    }

    .grid-cell.header {
      font-size: 11px;
    }
  }

  /* Product cell styles */
  .product-cell-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    height: 100%;
    width: 100%;
  }

  .product-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .primary-product {
    display: flex;
    align-items: center;
    flex: 0 0 auto; /* Don't grow, don't shrink */
  }

  .primary-product-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.2s ease;
    flex: 1;
  }

  .primary-product-link:hover {
    opacity: 0.8;
  }

  .product-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    filter: grayscale(0.2);
    transition: filter 0.2s ease, transform 0.2s ease;
    /* Ensure consistent sizing regardless of internal padding */
    flex-shrink: 0;
  }

  .product-logo.primary {
    width: 24px;
    height: 24px;
  }

  .primary-product-link:hover .product-logo {
    filter: grayscale(0);
    transform: scale(1.1);
  }

  .product-name {
    font-weight: 500;
    font-size: 14px;
    color: inherit;
  }

  /* Secondary logos */
  .secondary-logos {
    display: flex;
    align-items: center;
    gap: 6px; /* Clean spacing between logos */
    flex: 0 0 auto; /* Don't grow, don't shrink */
  }

  .secondary-logo-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .secondary-logo-link:hover {
    transform: scale(1.15);
  }

  .product-logo.secondary {
    width: 18px;
    height: 18px;
    transition: filter 0.2s ease, transform 0.2s ease;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 1px; /* Reduced from 2px to make logos bigger */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .secondary-logo-link:hover .product-logo.secondary {
    filter: grayscale(0);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }


  /* Make entire cell clickable for primary product */
  .grid-cell.first-column {
    cursor: pointer;
    position: relative;
  }

  /* Focus styles for accessibility */
  .grid-cell:focus {
    outline: 2px solid #4f46e5;
    outline-offset: -2px;
  }

  .grid-cell:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: -2px;
  }

  /* Prevent event bubbling for secondary logos */
  .secondary-logos {
    position: relative;
    z-index: 1;
  }

  /* Responsive adjustments for product cells */
  @media (max-width: 768px) {
    .product-logo.primary {
      width: 20px;
      height: 20px;
    }

    .product-logo.secondary {
      width: 16px;
      height: 16px;
    }

    .product-name {
      font-size: 13px;
    }

    .secondary-logos {
      margin-left: 0;
    }
  }

  /* Ensure logo column has enough space */
  .grid-table {
    grid-template-columns: 1.8fr 3fr 1.5fr;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .table-container {
      background: transparent;
    }

    .toggle-btn {
      border-color: #27272a;
      color: #a1a1aa;
    }

    .toggle-btn:hover {
      background: #27272a;
      color: #fafafa;
    }

    .toggle-btn.active {
      background: #fafafa;
      color: #18181b;
      border-color: #fafafa;
    }

    .grid-cell {
      color: #e4e4e7;
    }

    .grid-cell.header {
      color: #a1a1aa;
    }

    /* Dark mode: Solid style */
    .solid.grid-table {
      background: #18181b;
      border-color: #27272a;
    }

    .solid .grid-cell {
      background: #18181b;
      border-color: #27272a;
    }

    .solid .grid-cell.header {
      background: #09090b;
    }

    .solid .grid-cell:hover {
      background: #27272a;
    }

    .solid .grid-cell.highlight,
    .solid .grid-cell.highlight-column {
      background: #1e1b4b;
    }

    /* Dark mode: Translucent style */
    .translucent.grid-table {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .translucent .grid-cell {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .translucent .grid-cell.header {
      background: rgba(255, 255, 255, 0.05);
    }

    .translucent .grid-cell:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .translucent .grid-cell.highlight,
    .translucent .grid-cell.highlight-column {
      background: rgba(139, 92, 246, 0.15);
    }

    /* Dark mode: Minimal style */
    .minimal .grid-cell {
      border-color: #27272a;
    }

    .minimal .grid-cell.header {
      border-bottom-color: #e4e4e7;
    }

    .minimal .grid-cell:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .minimal .grid-cell.highlight {
      color: #a78bfa;
    }
  }
</style>
