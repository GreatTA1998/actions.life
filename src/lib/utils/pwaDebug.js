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
 *   window.pwaDebug()           - Show all debug info
 *   window.pwaDebug.memory()    - Show memory info only
 *   window.pwaDebug.cache()     - Show cache info only
 *   window.pwaDebug.storage()   - Show storage info only
 *   window.pwaDebug.sw()        - Show service worker info only
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
 * Get memory information
 */
async function getMemoryInfo() {
  const info = {
    available: false,
    data: {},
    alternatives: []
  };

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

  // Alternative memory tracking methods for iOS Safari
  try {
    // DOM node count (indicator of memory usage)
    const domNodes = document.querySelectorAll('*').length;
    info.data.domNodes = formatNumber(domNodes);
    info.data.domNodesRaw = domNodes;
    
    // Resource timing - estimate memory from loaded resources
    const resources = performance.getEntriesByType('resource');
    let totalResourceSize = 0;
    const resourceBreakdown = {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      fonts: 0,
      other: 0
    };
    
    resources.forEach((resource) => {
      const size = resource.transferSize || resource.decodedBodySize || 0;
      totalResourceSize += size;
      
      const name = resource.name.toLowerCase();
      if (name.includes('.js') || name.includes('script')) {
        resourceBreakdown.scripts += size;
      } else if (name.includes('.css') || name.includes('style')) {
        resourceBreakdown.stylesheets += size;
      } else if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
        resourceBreakdown.images += size;
      } else if (name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        resourceBreakdown.fonts += size;
      } else {
        resourceBreakdown.other += size;
      }
    });
    
    info.data.resources = {
      total: formatBytes(totalResourceSize),
      totalRaw: totalResourceSize,
      count: formatNumber(resources.length),
      breakdown: {
        scripts: formatBytes(resourceBreakdown.scripts),
        stylesheets: formatBytes(resourceBreakdown.stylesheets),
        images: formatBytes(resourceBreakdown.images),
        fonts: formatBytes(resourceBreakdown.fonts),
        other: formatBytes(resourceBreakdown.other)
      }
    };
    
    // Performance measures
    const measures = performance.getEntriesByType('measure');
    info.data.performanceMeasures = measures.length;
    
    // Navigation timing
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (navTiming) {
      info.data.pageLoad = {
        domContentLoaded: Math.round(navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart) + 'ms',
        loadComplete: Math.round(navTiming.loadEventEnd - navTiming.loadEventStart) + 'ms',
        totalTime: Math.round(navTiming.loadEventEnd - navTiming.fetchStart) + 'ms'
      };
    }
  } catch (e) {
    info.data.error = e.message;
  }

  // iOS Safari guidance
  if (!info.available) {
    info.alternatives = [
      'Memory API not available in iOS Safari Web Inspector',
      'Use "Timelines" tab → Record → Check "Memory" track for memory over time',
      'Connect iOS device to macOS Safari → Develop menu → More memory profiling options',
      'Monitor DOM nodes and resource sizes below as memory indicators'
    ];
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

  // Memory
  console.log('📊 MEMORY USAGE');
  console.log(separator);
  if (data.memory.available) {
    console.log('✓ Memory API Available');
    console.log(`  Used JS Heap:     ${data.memory.data.usedJSHeapSize}`);
    console.log(`  Total JS Heap:    ${data.memory.data.totalJSHeapSize}`);
    console.log(`  JS Heap Limit:    ${data.memory.data.jsHeapSizeLimit}`);
    if (data.memory.data.raw) {
      console.log(`  Raw Used:         ${formatNumber(data.memory.data.raw.usedJSHeapSize)} bytes`);
      console.log(`  Raw Total:        ${formatNumber(data.memory.data.raw.totalJSHeapSize)} bytes`);
    }
  } else {
    console.log('⚠ Memory API not available in iOS Safari');
    if (data.memory.alternatives && data.memory.alternatives.length > 0) {
      console.log('\n  Alternative Memory Tracking:');
      data.memory.alternatives.forEach((alt, idx) => {
        console.log(`    ${idx + 1}. ${alt}`);
      });
    }
  }
  
  // Show alternative memory indicators (always shown)
  if (data.memory.data.domNodes) {
    console.log('\n  Memory Indicators:');
    console.log(`    DOM Nodes:       ${data.memory.data.domNodes}`);
  }
  
  if (data.memory.data.resources) {
    console.log(`    Loaded Resources: ${data.memory.data.resources.count} (${data.memory.data.resources.total})`);
    console.log(`      Scripts:       ${data.memory.data.resources.breakdown.scripts}`);
    console.log(`      Stylesheets:   ${data.memory.data.resources.breakdown.stylesheets}`);
    console.log(`      Images:        ${data.memory.data.resources.breakdown.images}`);
    console.log(`      Fonts:         ${data.memory.data.resources.breakdown.fonts}`);
    console.log(`      Other:         ${data.memory.data.resources.breakdown.other}`);
  }
  
  if (data.memory.data.pageLoad) {
    console.log(`    Page Load Time:  ${data.memory.data.pageLoad.totalTime}`);
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
  
  console.log('\n📊 MEMORY USAGE');
  console.log(separator);
  
  if (memory.available) {
    console.log('✓ Memory API Available');
    console.log(`  Used JS Heap:     ${memory.data.usedJSHeapSize}`);
    console.log(`  Total JS Heap:    ${memory.data.totalJSHeapSize}`);
    console.log(`  JS Heap Limit:    ${memory.data.jsHeapSizeLimit}`);
    if (memory.data.raw) {
      console.log(`  Raw Used:         ${formatNumber(memory.data.raw.usedJSHeapSize)} bytes`);
      console.log(`  Raw Total:        ${formatNumber(memory.data.raw.totalJSHeapSize)} bytes`);
    }
  } else {
    console.log('⚠ Memory API not available in iOS Safari');
    if (memory.alternatives && memory.alternatives.length > 0) {
      console.log('\n  Alternative Memory Tracking:');
      memory.alternatives.forEach((alt, idx) => {
        console.log(`    ${idx + 1}. ${alt}`);
      });
    }
  }
  
  // Show alternative memory indicators
  if (memory.data.domNodes) {
    console.log('\n  Memory Indicators:');
    console.log(`    DOM Nodes:       ${memory.data.domNodes}`);
  }
  
  if (memory.data.resources) {
    console.log(`    Loaded Resources: ${memory.data.resources.count} (${memory.data.resources.total})`);
    console.log(`      Scripts:       ${memory.data.resources.breakdown.scripts}`);
    console.log(`      Stylesheets:   ${memory.data.resources.breakdown.stylesheets}`);
    console.log(`      Images:        ${memory.data.resources.breakdown.images}`);
    console.log(`      Fonts:         ${memory.data.resources.breakdown.fonts}`);
    console.log(`      Other:         ${memory.data.resources.breakdown.other}`);
  }
  
  if (memory.data.pageLoad) {
    console.log(`    Page Load Time:  ${memory.data.pageLoad.totalTime}`);
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

export default pwaDebug;

