<script>
  const theme = {
    table: {
      background: '#18181b',
      borderRadius: '8px',
      border: '1px solid #27272a',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    cell: {
      color: '#fafafa',
      borderColor: '#27272a'
    },
    header: {
      color: 'white',
      fontWeight: '600'
    }
  }

  const headers = ['Name', 'Unique Strengths', 'Weakness']
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
      bestFor: 'Everything in one view, each task tree is focusable',
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
    }
  ]

  function openPrimary(product) {
    if (product.primaryLogo) {
      window.open(product.primaryLogo.url, '_blank', 'noopener,noreferrer')
    }
  }

  function handleCellKeydown(event, product) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPrimary(product)
    }
  }
</script>

<div
  class="grid-table"
  style:background={theme.table.background}
  style:border-radius={theme.table.borderRadius}
  style:border={theme.table.border}
  style:box-shadow={theme.table.boxShadow}
>
  {#each headers as header}
    <div
      class="grid-cell header"
      style:color={theme.header.color}
      style:font-weight={theme.header.fontWeight}
      style:border-right="1px solid {theme.cell.borderColor}"
      style:border-bottom="1px solid {theme.cell.borderColor}"
    >
      {header}
    </div>
  {/each}

  {#each products as product}
    <div
      class="grid-cell first-column"
      class:highlight={product.isHighlighted}
      style:color={theme.cell.color}
      style:border-right="1px solid {theme.cell.borderColor}"
      style:border-bottom="1px solid {theme.cell.borderColor}"
      onclick={() => openPrimary(product)}
      onkeydown={(e) => handleCellKeydown(e, product)}
      role={product.primaryLogo ? 'button' : undefined}
      tabindex={product.primaryLogo ? 0 : undefined}
    >
      <div class="product-row">
        <div class="primary-product">
          <a
            href={product.primaryLogo.url}
            target="_blank"
            rel="noopener noreferrer"
            class="primary-product-link"
            title={product.primaryLogo.alt}
          >
            {#if product.primaryLogo.src}
              <img src={product.primaryLogo.src} alt={product.primaryLogo.alt} class="product-logo primary" />
            {/if}
            <span class="product-name">{product.name}</span>
          </a>
        </div>

        {#if product.secondaryLogos.length}
          <div class="secondary-logos">
            {#each product.secondaryLogos as logo}
              <a
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                class="secondary-logo-link"
                title={logo.alt}
                on:click|stopPropagation
              >
                <img src={logo.src} alt={logo.alt} class="product-logo secondary" />
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div
      class="grid-cell"
      class:highlight-column={product.isHighlighted}
      style:color={theme.cell.color}
      style:border-right="1px solid {theme.cell.borderColor}"
      style:border-bottom="1px solid {theme.cell.borderColor}"
    >
      {product.bestFor}
    </div>

    <div
      class="grid-cell"
      class:highlight-column={product.isHighlighted}
      style:color={theme.cell.color}
      style:border-right="1px solid {theme.cell.borderColor}"
      style:border-bottom="1px solid {theme.cell.borderColor}"
    >
      {product.weakness}
    </div>
  {/each}
</div>

<style>
  .grid-table {
    display: grid;
    grid-template-columns: fit-content(500px) 3fr 2fr;
    gap: 0;
    overflow: hidden;
  }

  .grid-cell {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    font-size: 14px;
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
    cursor: pointer;
    position: relative;
  }

  .grid-cell:focus,
  .grid-cell:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: -2px;
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
    flex: 0 0 auto;
  }

  .primary-product-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
  }

  .product-logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
    filter: grayscale(0.2);
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
    flex: 0 0 auto;
    position: relative;
    z-index: 1;
  }

  .secondary-logo-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
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
  }
</style>
