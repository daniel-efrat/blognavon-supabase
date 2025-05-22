// Request Monitor - Helps identify the source of frequent requests
(function() {
  // Store original fetch and XMLHttpRequest methods
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest.prototype.open;
  
  // Log of intercepted requests
  const requestLog = [];
  const MAX_LOGGED_REQUESTS = 50;
  
  // Function to add a request to the log
  function logRequest(url, method, source) {
    // Don't log requests to the request monitor itself to avoid infinite loops
    if (url.includes('request-monitor.js')) {
      return;
    }
    
    // Create a detailed request object
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n').slice(1, 10); // Get first 10 lines of stack
    
    const request = {
      url,
      method,
      timestamp: new Date().toISOString(),
      source,
      stack: stackLines,
      // Try to identify the component or function making the request
      caller: stackLines.find(line => line.includes('components/') || line.includes('app/')) || 'Unknown'
    };
    
    // Log to console for immediate visibility
    console.log(`[REQUEST-MONITOR] ${method} ${url} from ${request.caller}`);
    
    requestLog.unshift(request);
    if (requestLog.length > MAX_LOGGED_REQUESTS) {
      requestLog.pop();
    }
    
    // Check for frequent requests to the same URL
    const recentRequests = requestLog.filter(
      req => req.url === url && 
      new Date() - new Date(req.timestamp) < 10000 // Within last 10 seconds
    );
    
    if (recentRequests.length > 5) {
      console.warn(`[REQUEST-MONITOR] Frequent requests detected to ${url}`);
      console.warn(`Source: ${source}`);
      console.warn(`Likely caller: ${request.caller}`);
      console.warn(`Stack trace:`, request.stack);
    }
  }
  
  // Override fetch
  window.fetch = function(url, options) {
    const method = options && options.method ? options.method : 'GET';
    logRequest(url, method, 'fetch');
    return originalFetch.apply(this, arguments);
  };
  
  // Override XMLHttpRequest
  window.XMLHttpRequest.prototype.open = function(method, url) {
    logRequest(url, method, 'XMLHttpRequest');
    return originalXHR.apply(this, arguments);
  };
  
  // Expose the request log
  window.requestMonitor = {
    getLog: function() {
      return [...requestLog];
    },
    clearLog: function() {
      requestLog.length = 0;
    }
  };
  
  console.log('[REQUEST-MONITOR] Request monitoring initialized');
})();
