var staticCacheName = 'restaurant-static-v9';

var defaultCacheFiles = [
  './',
  './index.html',
  './restaurant.html',
  './offline.html',
  './data/restaurants.json',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  './css/responsive.css',
  './css/styles.css'
];

var dynamicCacheName = 'dynamic-files';


self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(defaultCacheFiles);
    })
  );
});


self.addEventListener('activate', function(e) {

  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      // keep dynamic caches, only remove old static caches
      if (cacheNames !== dynamicCacheName) {
        return Promise.all(cacheNames.map(function(cache) {
          if (cache.indexOf(staticCacheName) == -1) {
            return caches.delete(cache);
          }
        }));
      }
    })
  );

});



self.addEventListener('fetch', function(e) {

  // console.log('[Service Worker] Fetch', e.request.url);

  // If the page indicates 'No internet', show custom offline page
  if (e.request.mode == 'navigate') {
    e.respondWith(
      fetch(e.request.url).catch(function() {
        return caches.match('./offline.html');
      })
    );
  }

  // Don't cache google map
  if (e.request.url.indexOf('googleapis') > -1 || e.request.url.indexOf('maps') > -1) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(response) {

      // If the request is in the static cache
      if (response) {
        // console.log('[Service Worker Found in cache]', e.request.url);
        return response;
      }

      var requestClone = e.request.clone();

      // If the request is not in cache, fetch again
      return fetch(requestClone).then(function(response) {

        var responseClone = response.clone();

        // Add responses to dynamic cache when the url is visited
        caches.open(dynamicCacheName).then(function(cache) {
          cache.put(e.request, responseClone);

          console.log('[Service Worker add to Dynamic Cache]', e.request.url);

          return response;
        })

        return response;
      })
    })
  );

});
