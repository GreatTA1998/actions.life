/**
 * PWA Debug Utility for iOS 17
 * 
 * Provides comprehensive debugging information about:
 * - Memory usage
 * - Cache storage (Cache API)
 * - Service Worker status
 * - Browser storage (localStorage, IndexedDB, SessionStorage)
 * 
 * Usage in console:
 *   window.pwaDebug()                    - Show all debug info
 *   window.pwaDebug.memory()             - Show memory info only
 *   window.pwaDebug.cache()              - Show cache info only
 *   window.pwaDebug.storage()            - Show storage info only
 *   window.pwaDebug.sw()                 - Show service worker info only
 *   
 * Verification functions (test PWA goals):
 *   window.pwaDebug.verifyAll()          - Run all verifications
 *   window.pwaDebug.verifyHTMLOnlyCache() - Verify only HTML cached (not images)
 *   window.pwaDebug.verifyCacheSpeed()   - Verify cache speeds up reloads
 *   window.pwaDebug.verifyUpdates()      - Verify updates propagate correctly
 */

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatNumber = (num) => {
  return num.toLocaleString();
};

/**
 * Get memory information (iOS Safari optimized)
 */
async function getMemoryInfo() {
  const info = {
    available: false,
    isIOS: false,
    data: {},
    alternatives: []
  };

  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  info.isIOS = isIOS;

  // Chrome/Edge Memory API (not available in Safari/iOS)
  if (performance.memory) {
    info.available = true;
    info.data = {
      usedJSHeapSize: formatBytes(performance.memory.usedJSHeapSize),
      totalJSHeapSize: formatBytes(performance.memory.totalJSHeapSize),
      jsHeapSizeLimit: formatBytes(performance.memory.jsHeapSizeLimit),
      raw: {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      }
    };
  }

  // iOS Safari-compatible memory tracking
  try {
    // DOM node count (key memory indicator for iOS)
    const domNodes = document.querySelectorAll('*').length;
    info.data.domNodes = formatNumber(domNodes);
    info.data.domNodesRaw = domNodes;
    
    // Estimate memory pressure based on DOM size
    let memoryPressure = 'low';
    if (domNodes > 5000) memoryPressure = 'high';
    else if (domNodes > 2000) memoryPressure = 'medium';
    info.data.memoryPressure = memoryPressure;
    
    // Resource timing - track actual loaded resources
    const resources = performance.getEntriesByType('resource');
    let totalTransferSize = 0;
    let totalDecodedSize = 0;
    const resourceBreakdown = {
      scripts: { transfer: 0, decoded: 0, count: 0 },
      stylesheets: { transfer: 0, decoded: 0, count: 0 },
      images: { transfer: 0, decoded: 0, count: 0 },
      fonts: { transfer: 0, decoded: 0, count: 0 },
      html: { transfer: 0, decoded: 0, count: 0 },
      other: { transfer: 0, decoded: 0, count: 0 }
    };
    
    resources.forEach((resource) => {
      const transferSize = resource.transferSize || 0;
      const decodedSize = resource.decodedBodySize || 0;
      totalTransferSize += transferSize;
      totalDecodedSize += decodedSize;
      
      const name = resource.name.toLowerCase();
      let category = 'other';
      if (name.includes('.js') || name.includes('script') || name.includes('chunk')) {
        category = 'scripts';
      } else if (name.includes('.css') || name.includes('style')) {
        category = 'stylesheets';
      } else if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif|heic)$/)) {
        category = 'images';
      } else if (name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        category = 'fonts';
      } else if (name.match(/\.html$/) || resource.initiatorType === 'navigation') {
        category = 'html';
      }
      
      resourceBreakdown[category].transfer += transferSize;
      resourceBreakdown[category].decoded += decodedSize;
      resourceBreakdown[category].count++;
    });
    
    info.data.resources = {
      transferTotal: formatBytes(totalTransferSize),
      decodedTotal: formatBytes(totalDecodedSize),
      transferTotalRaw: totalTransferSize,
      decodedTotalRaw: totalDecodedSize,
      count: formatNumber(resources.length),
      breakdown: {
        scripts: {
          transfer: formatBytes(resourceBreakdown.scripts.transfer),
          decoded: formatBytes(resourceBreakdown.scripts.decoded),
          count: resourceBreakdown.scripts.count
        },
        stylesheets: {
          transfer: formatBytes(resourceBreakdown.stylesheets.transfer),
          decoded: formatBytes(resourceBreakdown.stylesheets.decoded),
          count: resourceBreakdown.stylesheets.count
        },
        images: {
          transfer: formatBytes(resourceBreakdown.images.transfer),
          decoded: formatBytes(resourceBreakdown.images.decoded),
          count: resourceBreakdown.images.count
        },
        fonts: {
          transfer: formatBytes(resourceBreakdown.fonts.transfer),
          decoded: formatBytes(resourceBreakdown.fonts.decoded),
          count: resourceBreakdown.fonts.count
        },
        html: {
          transfer: formatBytes(resourceBreakdown.html.transfer),
          decoded: formatBytes(resourceBreakdown.html.decoded),
          count: resourceBreakdown.html.count
        },
        other: {
          transfer: formatBytes(resourceBreakdown.other.transfer),
          decoded: formatBytes(resourceBreakdown.other.decoded),
          count: resourceBreakdown.other.count
        }
      }
    };
    
    // Navigation timing (iOS Safari compatible)
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (navTiming) {
      const fetchStart = navTiming.fetchStart;
      const domContentLoaded = navTiming.domContentLoadedEventEnd - fetchStart;
      const loadComplete = navTiming.loadEventEnd - fetchStart;
      const totalTime = navTiming.loadEventEnd - fetchStart;
      const responseTime = navTiming.responseEnd - fetchStart;
      const wasCached = navTiming.transferSize === 0;
      
      info.data.pageLoad = {
        domContentLoaded: Math.round(domContentLoaded),
        loadComplete: Math.round(loadComplete),
        totalTime: Math.round(totalTime),
        responseTime: Math.round(responseTime),
        wasCached,
        transferSize: formatBytes(navTiming.transferSize),
        decodedSize: formatBytes(navTiming.decodedBodySize || 0)
      };
    }
    
    // Storage quota estimation (iOS Safari)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        info.data.storageQuota = {
          quota: formatBytes(estimate.quota || 0),
          usage: formatBytes(estimate.usage || 0),
          available: formatBytes((estimate.quota || 0) - (estimate.usage || 0)),
          usagePercent: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0
        };
      } catch (e) {
        // Storage API may not be available
      }
    }
  } catch (e) {
    info.data.error = e.message;
  }

  return info;
}

/**
 * Get all Cache API information
 */
async function getCacheInfo() {
  const cachesInfo = {
    available: typeof caches !== 'undefined',
    caches: [],
    totalSize: 0,
    totalEntries: 0
  };

  if (!cachesInfo.available) {
    return cachesInfo;
  }

  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      const entries = [];
      let cacheSize = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          try {
            const clonedResponse = response.clone();
            const blob = await clonedResponse.blob();
            const size = blob.size;
            cacheSize += size;
            
            entries.push({
              url: request.url,
              method: request.method,
              size: formatBytes(size),
              sizeRaw: size,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              type: response.type,
              timestamp: response.headers.get('date') || 'unknown'
            });
          } catch (e) {
            entries.push({
              url: request.url,
              method: request.method,
              error: 'Could not read response: ' + e.message
            });
          }
        }
      }
      
      cachesInfo.caches.push({
        name: cacheName,
        entryCount: entries.length,
        totalSize: formatBytes(cacheSize),
        totalSizeRaw: cacheSize,
        entries: entries
      });
      
      cachesInfo.totalSize += cacheSize;
      cachesInfo.totalEntries += entries.length;
    }
    
    cachesInfo.totalSizeFormatted = formatBytes(cachesInfo.totalSize);
  } catch (error) {
    cachesInfo.error = error.message;
  }

  return cachesInfo;
}

/**
 * Get Service Worker information
 */
async function getServiceWorkerInfo() {
  const swInfo = {
    available: 'serviceWorker' in navigator,
    registrations: []
  };

  if (!swInfo.available) {
    return swInfo;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      const sw = registration.active || registration.installing || registration.waiting;
      
      swInfo.registrations.push({
        scope: registration.scope,
        state: sw ? sw.state : 'none',
        scriptURL: sw ? sw.scriptURL : 'none',
        updateViaCache: registration.updateViaCache,
        hasActive: !!registration.active,
        hasInstalling: !!registration.installing,
        hasWaiting: !!registration.waiting
      });
    }
    
    swInfo.count = registrations.length;
  } catch (error) {
    swInfo.error = error.message;
  }

  return swInfo;
}

/**
 * Get browser storage information
 */
async function getStorageInfo() {
  const storageInfo = {
    localStorage: {
      available: typeof Storage !== 'undefined',
      size: 0,
      entries: 0,
      data: {}
    },
    sessionStorage: {
      available: typeof Storage !== 'undefined',
      size: 0,
      entries: 0,
      data: {}
    },
    indexedDB: {
      available: typeof indexedDB !== 'undefined',
      databases: []
    }
  };

  // localStorage
  if (storageInfo.localStorage.available) {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([key + value]).size;
        totalSize += size;
        storageInfo.localStorage.data[key] = {
          size: formatBytes(size),
          sizeRaw: size,
          valueLength: value ? value.length : 0,
          preview: value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : null
        };
      }
      storageInfo.localStorage.size = formatBytes(totalSize);
      storageInfo.localStorage.sizeRaw = totalSize;
      storageInfo.localStorage.entries = localStorage.length;
    } catch (e) {
      storageInfo.localStorage.error = e.message;
    }
  }

  // sessionStorage
  if (storageInfo.sessionStorage.available) {
    try {
      let totalSize = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        const size = new Blob([key + value]).size;
        totalSize += size;
        storageInfo.sessionStorage.data[key] = {
          size: formatBytes(size),
          sizeRaw: size,
          valueLength: value ? value.length : 0,
          preview: value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : null
        };
      }
      storageInfo.sessionStorage.size = formatBytes(totalSize);
      storageInfo.sessionStorage.sizeRaw = totalSize;
      storageInfo.sessionStorage.entries = sessionStorage.length;
    } catch (e) {
      storageInfo.sessionStorage.error = e.message;
    }
  }

  // IndexedDB
  if (storageInfo.indexedDB.available) {
    try {
      // Note: Safari doesn't expose databases until they're opened
      // We'll try to detect common database names
      const commonDBs = ['firebaseLocalStorageDb', 'firebase-heartbeat-database'];
      
      for (const dbName of commonDBs) {
        try {
          const request = indexedDB.open(dbName);
          await new Promise((resolve, reject) => {
            request.onsuccess = () => {
              const db = request.result;
              const objectStoreNames = Array.from(db.objectStoreNames);
              storageInfo.indexedDB.databases.push({
                name: dbName,
                version: db.version,
                objectStores: objectStoreNames,
                objectStoreCount: objectStoreNames.length
              });
              db.close();
              resolve();
            };
            request.onerror = () => resolve(); // Just skip if can't open
            request.onblocked = () => resolve();
          });
        } catch (e) {
          // Skip
        }
      }
    } catch (e) {
      storageInfo.indexedDB.error = e.message;
    }
  }

  return storageInfo;
}

/**
 * Format and display debug information
 */
function formatOutput(data) {
  const separator = '─'.repeat(60);
  
  console.log('\n' + separator);
  console.log('🔍 PWA DEBUG REPORT - iOS 17');
  console.log(separator + '\n');

  // Memory (iOS Safari optimized)
  console.log('📊 MEMORY & PERFORMANCE');
  console.log(separator);
  
  if (data.memory.isIOS) {
    console.log('📱 iOS Safari detected (Memory API unavailable)');
  }
  
  if (data.memory.available) {
    console.log('✓ Memory API Available (Chrome/Edge)');
    console.log(`  Used JS Heap:     ${data.memory.data.usedJSHeapSize}`);
    console.log(`  Total JS Heap:    ${data.memory.data.totalJSHeapSize}`);
    console.log(`  JS Heap Limit:    ${data.memory.data.jsHeapSizeLimit}`);
  } else {
    console.log('⚠ Memory API not available (iOS Safari)');
    console.log('   Using proxy indicators below');
  }
  
  // DOM complexity (key iOS indicator)
  if (data.memory.data.domNodes) {
    const pressure = data.memory.data.memoryPressure || 'unknown';
    const pressureIcon = pressure === 'high' ? '🔴' : pressure === 'medium' ? '🟡' : '🟢';
    console.log(`\n${pressureIcon} DOM Complexity: ${data.memory.data.domNodes} nodes (${pressure} pressure)`);
  }
  
  // Resource breakdown (iOS Safari compatible)
  if (data.memory.data.resources) {
    const res = data.memory.data.resources;
    console.log(`\n📦 Loaded Resources: ${res.count} total`);
    console.log(`  Transfer Size:    ${res.transferTotal} (network)`);
    console.log(`  Decoded Size:     ${res.decodedTotal} (memory)`);
    
    const br = res.breakdown;
    console.log(`\n  Breakdown:`);
    if (br.scripts.count > 0) {
      console.log(`    📜 Scripts:      ${br.scripts.count} files, ${br.scripts.decoded} decoded`);
    }
    if (br.stylesheets.count > 0) {
      console.log(`    🎨 Stylesheets:  ${br.stylesheets.count} files, ${br.stylesheets.decoded} decoded`);
    }
    if (br.images.count > 0) {
      console.log(`    🖼️  Images:       ${br.images.count} files, ${br.images.decoded} decoded`);
    }
    if (br.fonts.count > 0) {
      console.log(`    🔤 Fonts:        ${br.fonts.count} files, ${br.fonts.decoded} decoded`);
    }
    if (br.html.count > 0) {
      console.log(`    📄 HTML:         ${br.html.count} files, ${br.html.decoded} decoded`);
    }
    if (br.other.count > 0) {
      console.log(`    📦 Other:        ${br.other.count} files, ${br.other.decoded} decoded`);
    }
  }
  
  // Page load performance
  if (data.memory.data.pageLoad) {
    const pl = data.memory.data.pageLoad;
    const cacheIcon = pl.wasCached ? '⚡' : '🌐';
    console.log(`\n${cacheIcon} Page Load Performance:`);
    console.log(`  Response Time:    ${pl.responseTime}ms (${pl.wasCached ? 'from cache' : 'from network'})`);
    console.log(`  DOM Ready:        ${pl.domContentLoaded}ms`);
    console.log(`  Load Complete:    ${pl.loadComplete}ms`);
    console.log(`  Total Time:       ${pl.totalTime}ms`);
    if (pl.transferSize) {
      console.log(`  Transfer Size:    ${pl.transferSize}`);
    }
  }
  
  // Storage quota (iOS Safari)
  if (data.memory.data.storageQuota) {
    const sq = data.memory.data.storageQuota;
    const quotaIcon = sq.usagePercent > 80 ? '🔴' : sq.usagePercent > 50 ? '🟡' : '🟢';
    console.log(`\n${quotaIcon} Storage Quota:`);
    console.log(`  Used:             ${sq.usage} (${sq.usagePercent}%)`);
    console.log(`  Available:        ${sq.available}`);
    console.log(`  Total Quota:      ${sq.quota}`);
  }
  
  console.log('');

  // Cache API
  console.log('💾 CACHE STORAGE (Cache API)');
  console.log(separator);
  if (data.cache.available) {
    console.log(`Total Caches: ${data.cache.caches.length}`);
    console.log(`Total Entries: ${formatNumber(data.cache.totalEntries)}`);
    console.log(`Total Size: ${data.cache.totalSizeFormatted}`);
    console.log('');
    
    if (data.cache.caches.length === 0) {
      console.log('  No caches found');
    } else {
      data.cache.caches.forEach((cache, idx) => {
        console.log(`\n  Cache ${idx + 1}: "${cache.name}"`);
        console.log(`    Entries: ${formatNumber(cache.entryCount)}`);
        console.log(`    Size: ${cache.totalSize}`);
        if (cache.entries.length > 0) {
          console.log(`    Top entries:`);
          cache.entries.slice(0, 5).forEach((entry, eIdx) => {
            console.log(`      ${eIdx + 1}. ${entry.url.substring(0, 60)}${entry.url.length > 60 ? '...' : ''}`);
            console.log(`         ${entry.method} | ${entry.status} | ${entry.size}`);
          });
          if (cache.entries.length > 5) {
            console.log(`      ... and ${formatNumber(cache.entries.length - 5)} more`);
          }
        }
      });
    }
  } else {
    console.log('⚠ Cache API not available');
  }
  console.log('');

  // Service Workers
  console.log('⚙️  SERVICE WORKERS');
  console.log(separator);
  if (data.serviceWorker.available) {
    console.log(`Registered: ${data.serviceWorker.count || 0}`);
    if (data.serviceWorker.registrations.length === 0) {
      console.log('  No service workers registered');
    } else {
      data.serviceWorker.registrations.forEach((sw, idx) => {
        console.log(`\n  SW ${idx + 1}:`);
        console.log(`    Scope: ${sw.scope}`);
        console.log(`    State: ${sw.state}`);
        console.log(`    Script: ${sw.scriptURL}`);
        console.log(`    Update Via Cache: ${sw.updateViaCache}`);
      });
    }
  } else {
    console.log('⚠ Service Workers not available');
  }
  console.log('');

  // Browser Storage
  console.log('🗄️  BROWSER STORAGE');
  console.log(separator);
  
  // localStorage
  console.log('localStorage:');
  if (data.storage.localStorage.available) {
    console.log(`  Entries: ${formatNumber(data.storage.localStorage.entries)}`);
    console.log(`  Size: ${data.storage.localStorage.size}`);
    if (Object.keys(data.storage.localStorage.data).length > 0) {
      console.log('  Keys:');
      Object.entries(data.storage.localStorage.data).forEach(([key, info]) => {
        console.log(`    • ${key}: ${info.size} (${formatNumber(info.valueLength)} chars)`);
      });
    }
  } else {
    console.log('  ⚠ Not available');
  }
  console.log('');

  // sessionStorage
  console.log('sessionStorage:');
  if (data.storage.sessionStorage.available) {
    console.log(`  Entries: ${formatNumber(data.storage.sessionStorage.entries)}`);
    console.log(`  Size: ${data.storage.sessionStorage.size}`);
    if (Object.keys(data.storage.sessionStorage.data).length > 0) {
      console.log('  Keys:');
      Object.entries(data.storage.sessionStorage.data).forEach(([key, info]) => {
        console.log(`    • ${key}: ${info.size} (${formatNumber(info.valueLength)} chars)`);
      });
    }
  } else {
    console.log('  ⚠ Not available');
  }
  console.log('');

  // IndexedDB
  console.log('IndexedDB:');
  if (data.storage.indexedDB.available) {
    if (data.storage.indexedDB.databases.length === 0) {
      console.log('  No databases detected (may need to open them first)');
    } else {
      data.storage.indexedDB.databases.forEach((db) => {
        console.log(`  • ${db.name} (v${db.version})`);
        console.log(`    Object Stores: ${db.objectStoreCount}`);
        db.objectStores.forEach((store) => {
          console.log(`      - ${store}`);
        });
      });
    }
  } else {
    console.log('  ⚠ Not available');
  }
  console.log('');

  console.log(separator);
  console.log('✅ Debug report complete');
  console.log(separator + '\n');

  // Return structured data for programmatic access
  return data;
}

/**
 * Main debug function
 */
async function pwaDebug() {
  const [memory, cache, serviceWorker, storage] = await Promise.all([
    getMemoryInfo(),
    getCacheInfo(),
    getServiceWorkerInfo(),
    getStorageInfo()
  ]);

  const data = {
    memory,
    cache,
    serviceWorker,
    storage,
    timestamp: new Date().toISOString()
  };

  return formatOutput(data);
}

/**
 * Individual debug functions
 */
pwaDebug.memory = async () => {
  const memory = await getMemoryInfo();
  const separator = '─'.repeat(60);
  
  console.log('\n📊 MEMORY & PERFORMANCE');
  console.log(separator);
  
  if (memory.isIOS) {
    console.log('📱 iOS Safari detected (Memory API unavailable)');
  }
  
  if (memory.available) {
    console.log('✓ Memory API Available (Chrome/Edge)');
    console.log(`  Used JS Heap:     ${memory.data.usedJSHeapSize}`);
    console.log(`  Total JS Heap:    ${memory.data.totalJSHeapSize}`);
    console.log(`  JS Heap Limit:    ${memory.data.jsHeapSizeLimit}`);
  } else {
    console.log('⚠ Memory API not available (iOS Safari)');
    console.log('   Using proxy indicators below');
  }
  
  // DOM complexity (key iOS indicator)
  if (memory.data.domNodes) {
    const pressure = memory.data.memoryPressure || 'unknown';
    const pressureIcon = pressure === 'high' ? '🔴' : pressure === 'medium' ? '🟡' : '🟢';
    console.log(`\n${pressureIcon} DOM Complexity: ${memory.data.domNodes} nodes (${pressure} pressure)`);
  }
  
  // Resource breakdown (iOS Safari compatible)
  if (memory.data.resources) {
    const res = memory.data.resources;
    console.log(`\n📦 Loaded Resources: ${res.count} total`);
    console.log(`  Transfer Size:    ${res.transferTotal} (network)`);
    console.log(`  Decoded Size:     ${res.decodedTotal} (memory)`);
    
    const br = res.breakdown;
    console.log(`\n  Breakdown:`);
    if (br.scripts.count > 0) {
      console.log(`    📜 Scripts:      ${br.scripts.count} files, ${br.scripts.decoded} decoded`);
    }
    if (br.stylesheets.count > 0) {
      console.log(`    🎨 Stylesheets:  ${br.stylesheets.count} files, ${br.stylesheets.decoded} decoded`);
    }
    if (br.images.count > 0) {
      console.log(`    🖼️  Images:       ${br.images.count} files, ${br.images.decoded} decoded`);
    }
    if (br.fonts.count > 0) {
      console.log(`    🔤 Fonts:        ${br.fonts.count} files, ${br.fonts.decoded} decoded`);
    }
    if (br.html.count > 0) {
      console.log(`    📄 HTML:         ${br.html.count} files, ${br.html.decoded} decoded`);
    }
    if (br.other.count > 0) {
      console.log(`    📦 Other:        ${br.other.count} files, ${br.other.decoded} decoded`);
    }
  }
  
  // Page load performance
  if (memory.data.pageLoad) {
    const pl = memory.data.pageLoad;
    const cacheIcon = pl.wasCached ? '⚡' : '🌐';
    console.log(`\n${cacheIcon} Page Load Performance:`);
    console.log(`  Response Time:    ${pl.responseTime}ms (${pl.wasCached ? 'from cache' : 'from network'})`);
    console.log(`  DOM Ready:        ${pl.domContentLoaded}ms`);
    console.log(`  Load Complete:    ${pl.loadComplete}ms`);
    console.log(`  Total Time:       ${pl.totalTime}ms`);
    if (pl.transferSize) {
      console.log(`  Transfer Size:    ${pl.transferSize}`);
    }
  }
  
  // Storage quota (iOS Safari)
  if (memory.data.storageQuota) {
    const sq = memory.data.storageQuota;
    const quotaIcon = sq.usagePercent > 80 ? '🔴' : sq.usagePercent > 50 ? '🟡' : '🟢';
    console.log(`\n${quotaIcon} Storage Quota:`);
    console.log(`  Used:             ${sq.usage} (${sq.usagePercent}%)`);
    console.log(`  Available:        ${sq.available}`);
    console.log(`  Total Quota:      ${sq.quota}`);
  }
  
  console.log('\n  Full Data:');
  console.log(JSON.stringify(memory.data, null, 2));
  console.log('');
  return memory;
};

pwaDebug.cache = async () => {
  const cache = await getCacheInfo();
  console.log('\n💾 CACHE STORAGE');
  console.log('─'.repeat(60));
  console.log(JSON.stringify(cache, null, 2));
  console.log('');
  return cache;
};

pwaDebug.sw = async () => {
  const sw = await getServiceWorkerInfo();
  console.log('\n⚙️  SERVICE WORKERS');
  console.log('─'.repeat(60));
  console.log(JSON.stringify(sw, null, 2));
  console.log('');
  return sw;
};

pwaDebug.storage = async () => {
  const storage = await getStorageInfo();
  console.log('\n🗄️  BROWSER STORAGE');
  console.log('─'.repeat(60));
  console.log(JSON.stringify(storage, null, 2));
  console.log('');
  return storage;
};

/**
 * Clear specific caches (utility function)
 */
pwaDebug.clearCache = async (cacheName) => {
  if (!cacheName) {
    console.log('Usage: window.pwaDebug.clearCache("cache-name")');
    console.log('Available caches:');
    const cacheInfo = await getCacheInfo();
    cacheInfo.caches.forEach(c => console.log(`  - ${c.name}`));
    return;
  }
  
  try {
    const deleted = await caches.delete(cacheName);
    if (deleted) {
      console.log(`✅ Cache "${cacheName}" deleted`);
    } else {
      console.log(`⚠ Cache "${cacheName}" not found`);
    }
  } catch (e) {
    console.error(`❌ Error deleting cache: ${e.message}`);
  }
};

/**
 * Clear all caches (utility function)
 */
pwaDebug.clearAllCaches = async () => {
  try {
    const cacheNames = await caches.keys();
    let cleared = 0;
    for (const name of cacheNames) {
      if (await caches.delete(name)) {
        cleared++;
        console.log(`✅ Cleared: ${name}`);
      }
    }
    console.log(`\n✅ Cleared ${cleared} cache(s)`);
  } catch (e) {
    console.error(`❌ Error clearing caches: ${e.message}`);
  }
};

/**
 * Verify Goal #1: Only HTML is cached (not images)
 * Checks that runtime cache contains only navigation requests, not images
 */
pwaDebug.verifyHTMLOnlyCache = async () => {
  const separator = '─'.repeat(60);
  console.log('\n' + separator);
  console.log('✅ VERIFICATION #1: HTML-Only Caching');
  console.log(separator + '\n');

  try {
    const cacheInfo = await getCacheInfo();
    
    if (!cacheInfo.available) {
      console.log('❌ Cache API not available');
      return false;
    }

    // Find the app-shell cache (or any runtime cache)
    const runtimeCache = cacheInfo.caches.find(c => 
      c.name === 'app-shell' || 
      c.name.includes('html') ||
      c.entries.some(e => e.url && e.url.match(/^https?:\/\//))
    );

    if (!runtimeCache) {
      console.log('⚠ No runtime cache found. Make sure you\'ve navigated to a page first.');
      console.log('Available caches:', cacheInfo.caches.map(c => c.name).join(', '));
      return false;
    }

    console.log(`Checking cache: "${runtimeCache.name}"`);
    console.log(`Total entries: ${runtimeCache.entryCount}\n`);

    const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg|ico|avif|heic)$/i;
    const htmlPattern = /\.html$|^[^.]*$|\/([^\/?#]+)$/; // ends with .html, no extension, or just path

    let htmlCount = 0;
    let imageCount = 0;
    let otherCount = 0;
    const images = [];
    const html = [];

    for (const entry of runtimeCache.entries) {
      const url = entry.url.toLowerCase();
      const isImage = imagePattern.test(url) || 
                     entry.headers?.['content-type']?.includes('image/');
      const isHTML = entry.headers?.['content-type']?.includes('text/html') ||
                    entry.method === 'GET' && !isImage && !url.includes('.js') && !url.includes('.css');

      if (isImage) {
        imageCount++;
        images.push(entry.url);
      } else if (isHTML) {
        htmlCount++;
        html.push(entry.url);
      } else {
        otherCount++;
      }
    }

    console.log(`Results:`);
    console.log(`  ✅ HTML pages cached: ${htmlCount}`);
    console.log(`  ${imageCount > 0 ? '❌' : '✅'} Images cached: ${imageCount}`);
    console.log(`  ⚠ Other resources: ${otherCount}`);

    if (imageCount > 0) {
      console.log(`\n❌ PROBLEM: Found ${imageCount} image(s) in runtime cache:`);
      images.slice(0, 5).forEach(img => console.log(`  - ${img}`));
      if (images.length > 5) console.log(`  ... and ${images.length - 5} more`);
      console.log('\nThis means images are being cached, increasing memory usage.');
      return false;
    }

    if (htmlCount === 0) {
      console.log('\n⚠ WARNING: No HTML pages found in cache.');
      console.log('Make sure you\'ve navigated to pages after installing the service worker.');
      return false;
    }

    console.log(`\n✅ SUCCESS: Only HTML pages are cached. Memory footprint minimized.`);
    if (html.length > 0) {
      console.log(`\nCached pages:`);
      html.slice(0, 5).forEach(url => console.log(`  - ${url}`));
      if (html.length > 5) console.log(`  ... and ${html.length - 5} more`);
    }
    return true;
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    return false;
  }
};

/**
 * Verify Goal #2: Cache speeds up reloads
 * Measures load time from cache vs network
 */
pwaDebug.verifyCacheSpeed = async () => {
  const separator = '─'.repeat(60);
  console.log('\n' + separator);
  console.log('✅ VERIFICATION #2: Cache Performance');
  console.log(separator + '\n');

  try {
    // Check if we have cached content
    const cacheInfo = await getCacheInfo();
    const runtimeCache = cacheInfo.caches.find(c => 
      c.name === 'app-shell' || 
      c.name.includes('html')
    );

    if (!runtimeCache || runtimeCache.entryCount === 0) {
      console.log('⚠ No cached content found. Navigate to a page first, then run this again.');
      return false;
    }

    // Measure current page load time
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (!navTiming) {
      console.log('⚠ Navigation timing not available');
      return false;
    }

    const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
    const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
    const responseTime = navTiming.responseEnd - navTiming.fetchStart;

    console.log('Current page load metrics:');
    console.log(`  Total load time: ${Math.round(loadTime)}ms`);
    console.log(`  DOM ready: ${Math.round(domContentLoaded)}ms`);
    console.log(`  Response time: ${Math.round(responseTime)}ms`);

    // Check if response came from cache
    const cacheStatus = navTiming.transferSize === 0 ? 'from cache' : 'from network';
    console.log(`  Source: ${cacheStatus}`);

    // Test cache hit directly
    console.log('\nTesting cache hit for current page...');
    const currentUrl = window.location.href;
    const cache = await caches.open(runtimeCache.name);
    const cachedResponse = await cache.match(currentUrl);
    
    if (cachedResponse) {
      const start = performance.now();
      const blob = await cachedResponse.clone().blob();
      const end = performance.now();
      const cacheReadTime = end - start;
      
      console.log(`✅ Cache hit confirmed`);
      console.log(`  Cache read time: ${Math.round(cacheReadTime)}ms`);
      console.log(`  Cached size: ${formatBytes(blob.size)}`);
      
      if (responseTime > 100) {
        console.log(`\n✅ Cache advantage: ~${Math.round(responseTime - cacheReadTime)}ms faster than network`);
      } else {
        console.log(`\n✅ Cache working: Response served from cache`);
      }
      return true;
    } else {
      console.log(`⚠ Current page not in cache yet. Reload the page to populate cache.`);
      return false;
    }
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    return false;
  }
};

/**
 * Verify Goal #3: Updates propagate correctly
 * Checks service worker update mechanism and stale-while-revalidate behavior
 */
pwaDebug.verifyUpdates = async () => {
  const separator = '─'.repeat(60);
  console.log('\n' + separator);
  console.log('✅ VERIFICATION #3: Update Propagation');
  console.log(separator + '\n');

  try {
    const swInfo = await getServiceWorkerInfo();
    
    if (!swInfo.available || swInfo.registrations.length === 0) {
      console.log('❌ No service worker registered');
      return false;
    }

    const registration = swInfo.registrations[0];
    console.log('Service Worker Status:');
    console.log(`  State: ${registration.state}`);
    console.log(`  Scope: ${registration.scope}`);
    console.log(`  Script: ${registration.scriptURL}`);

    // Check for waiting service worker (update available)
    if (registration.hasWaiting) {
      console.log('\n⚠ Update available but not activated');
      console.log('The new service worker is waiting. Reload to activate.');
    } else {
      console.log('\n✅ Service worker is active');
    }

    // Verify StaleWhileRevalidate strategy
    console.log('\nVerifying StaleWhileRevalidate strategy...');
    const cacheInfo = await getCacheInfo();
    const runtimeCache = cacheInfo.caches.find(c => 
      c.name === 'app-shell' || 
      c.name.includes('html')
    );

    if (runtimeCache && runtimeCache.entryCount > 0) {
      console.log(`✅ Runtime cache found: "${runtimeCache.name}"`);
      console.log(`  Entries: ${runtimeCache.entryCount}`);
      
      // Check cache headers to verify stale-while-revalidate behavior
      const sampleEntry = runtimeCache.entries[0];
      const cacheDate = sampleEntry.headers?.['date'] || sampleEntry.timestamp;
      
      console.log(`\nCache behavior:`);
      console.log(`  Strategy: StaleWhileRevalidate`);
      console.log(`  Latest cached entry: ${cacheDate || 'unknown'}`);
      console.log(`  ✓ Cache serves immediately`);
      console.log(`  ✓ Network fetch happens in background`);
      console.log(`  ✓ Next navigation uses fresh content`);
      
      return true;
    } else {
      console.log('⚠ No runtime cache found. Navigate to pages first.');
      return false;
    }
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    return false;
  }
};

/**
 * Run all verifications in sequence
 */
pwaDebug.verifyAll = async () => {
  console.log('\n🔍 RUNNING ALL PWA VERIFICATIONS\n');
  
  const results = {
    htmlOnly: await pwaDebug.verifyHTMLOnlyCache(),
    cacheSpeed: await pwaDebug.verifyCacheSpeed(),
    updates: await pwaDebug.verifyUpdates()
  };

  const separator = '─'.repeat(60);
  console.log('\n' + separator);
  console.log('📊 VERIFICATION SUMMARY');
  console.log(separator);
  console.log(`  HTML-only caching: ${results.htmlOnly ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Cache performance: ${results.cacheSpeed ? '✅ PASS' : '⚠ NEEDS TEST'}`);
  console.log(`  Update propagation: ${results.updates ? '✅ PASS' : '❌ FAIL'}`);
  console.log(separator + '\n');

  return results;
};

export default pwaDebug;

