<script>
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
        color: 'white',
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
    }
  }

  let selectedTheme = 'solid'
  $: currentTheme = themes[selectedTheme];

  const currentHighlight = {
    name: 'Background',
    background: 'rgba(251, 191, 36, 0.05)',
    fontWeight: 'inherit'
  }

  let hoveredCell = null

  function handleCellClick(product, cellIndex) {
    if (cellIndex === 0 && product.primaryLogo) {
      window.open(product.primaryLogo.url, '_blank', 'noopener,noreferrer')
    }
  }

  function handleCellKeydown(event, product, cellIndex) {
    if ((event.key === 'Enter' || event.key === ' ') && cellIndex === 0 && product.primaryLogo) {
      event.preventDefault();
      window.open(product.primaryLogo.url, '_blank', 'noopener,noreferrer')
    }
  }

  const products = [
    {
      name: 'Google',
      primaryLogo: { src: '/competitor_logos/gcal_favicon.ico', url: 'https://calendar.google.com', alt: 'Google Calendar' },
      secondaryLogos: [
        { src: '/competitor_logos/ical.png', url: 'https://www.icloud.com/calendar', alt: 'Apple Calendar' },
        { src: '/competitor_logos/microsoft.ico', url: 'https://outlook.live.com/calendar', alt: 'Microsoft Outlook' },
        { src: '/competitor_logos/Cron-favicon-style2-07.svg', url: 'https://notion.so/product/calendar', alt: 'Notion Calendar' }
      ],
      bestFor: 'Reliable. Feature complete. Integrates with everything',
      weakness: 'Slow at improving, features accumulate, lack of breakthrough redesigns.'
    },
    {
      name: 'Todoist',
      primaryLogo: { src: '/competitor_logos/todoist.ico', url: 'https://todoist.com', alt: 'Todoist' },
      secondaryLogos: [
        { src: '/competitor_logos/ticktick.png', url: 'https://ticktick.com', alt: 'TickTick' },
        { src: '/competitor_logos/things3.ico', url: 'https://culturedcode.com/things', alt: 'Things 3' }
      ],
      bestFor: 'Modern clean lists',
      weakness: 'Fragmentation across views, hard to see the full picture'
    },
    {
      name: 'actions.life',
      primaryLogo: { src: '/logo-no-bg.png', url: 'https://actions.life', alt: 'Actions.life' },
      secondaryLogos: [],
      bestFor: "Everything in one view, each task tree is focusable",
      weakness: 'Limited to solo use, with no notifications and integrations yet',
      isHighlighted: true
    },
    {
      name: 'TimeTree',
      primaryLogo: { src: '/competitor_logos/timetree.ico', url: 'https://timetreeapp.com', alt: 'TimeTree' },
      secondaryLogos: [],
      bestFor: 'Easy for families to share calendars',
      weakness: 'Basic calendar'
    },
    {
      name: 'Vimcal',
      primaryLogo: { src: '/competitor_logos/vimcal-favicon.png', url: 'https://vimcal.com', alt: 'Vimcal' },
      secondaryLogos: [],
      bestFor: 'Specialized for high volumes of meetings',
      weakness: 'Not for life planning'
    },
    {
      name: 'Extended list of alternatives',
      primaryLogo: { src: '', url: 'https://vimcal.com', alt: 'link' },
      secondaryLogos: [],
      bestFor: '',
      weakness: ''
    },
    // {
    //   name: 'Motion',
    //   primaryLogo: { src: '/competitor_logos/motion-svg.svg', url: 'https://usemotion.com', alt: 'Motion' },
    //   secondaryLogos: [],
    //   bestFor: 'AI agents auto-manage your calendar',
    //   weakness: ''
    // },
  ]

  // Convert to table format for easier grid rendering
  const tableData = [
    ['Name', 'Unique Strengths', 'Weakness'],
    ...products.map(p => [p, p.bestFor, p.weakness])
  ]

</script>

<div>
  <!-- <div class="demo-header" style="display: flex; width: 100%; justify-content: center; font-size: 24px; margin-bottom: 24px;">
    <h2>
      Comparison of calendar alternatives
    </h2>
  </div> -->

  <!-- <div class="controls">
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
  </div> -->

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
        {@const isHighlighted = false}
        <!-- {@const isHighlighted = rowIndex > 0 && (cellIndex === 0 && cell.isHighlighted || cellIndex > 0 && tableData[rowIndex][0].isHighlighted)} -->
        {@const isHovered = hoveredCell === cellKey}
        <!-- style:background={rowIndex === 0 ? currentTheme.header.background : (isHighlighted ? currentHighlight.background : (isHovered ? currentTheme.cell.hover : currentTheme.cell.background))} -->
        <div
          class="grid-cell"
          class:header={rowIndex === 0}
          class:first-column={cellIndex === 0}
          class:highlight={rowIndex > 0 && cellIndex === 0 && cell.isHighlighted}
          class:highlight-column={rowIndex > 0 && cellIndex > 0 && tableData[rowIndex][0].isHighlighted}
          style:color={rowIndex === 0 ? currentTheme.header.color : currentTheme.cell.color}
          style:font-weight={rowIndex === 0 ? currentTheme.header.fontWeight : (isHighlighted ? currentHighlight.fontWeight : 'inherit')}
          style:border-right="1px solid {currentTheme.cell.borderColor}"
          style:border-bottom="1px solid {currentTheme.cell.borderColor}"
          on:mouseenter={() => hoveredCell = cellKey}
          on:mouseleave={() => hoveredCell = null}
          on:click={() => handleCellClick(cell, cellIndex)}
          on:keydown={(e) => handleCellKeydown(e, cell, cellIndex)}
          role={rowIndex > 0 && cellIndex === 0 && cell.primaryLogo ? 'button' : undefined}
        >
          {#if rowIndex === 0}
            <!-- Header row -->
            {cell}
          {:else if cellIndex === 0}
            <div class="product-cell-wrapper">
              <div class="product-row">
                <div class="primary-product">
                  <a
                    href={cell.primaryLogo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="primary-product-link"
                    title={cell.primaryLogo.alt}
                  >
                    {#if cell.primaryLogo.src}
                      <img src={cell.primaryLogo.src} alt={cell.primaryLogo.alt}
                        class="product-logo primary"
                      />
                    {/if}

                    <span class="product-name">
                      {cell.name}
                    </span>
                  </a>
                </div>

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
                        <img src={logo.src} alt={logo.alt}
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
  .demo-header {
    text-align: center;
  }

  .demo-header h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #171717;
    letter-spacing: -0.01em;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    align-items: center;
  }

  .grid-table {
    display: grid;
    grid-template-columns: 1.8fr 3fr 1.5fr;
    gap: 0;
    transition: all 0.3s ease;
    overflow: hidden;
  }

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

  @media (max-width: 768px) {
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

  .product-cell-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    height: 100%;
    width: 100%;
  }

  .product-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
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

  .product-name {
    font-weight: 500;
    font-size: 14px;
  }

  .secondary-logos {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto; /* Don't grow, don't shrink */
  }

  .secondary-logo-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .product-logo.secondary {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    padding: 2px;
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
    grid-template-columns: fit-content(500px) 3fr 2fr;
  }
</style>
