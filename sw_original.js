const staticCache = ['restaurant-v8'];

const cacheFiles = [
  '/',
  // '/offline.html',
  '/index.html',
  '/data/restaurants.json',
  '/js/app.js',
  // '/js/dbhelper.js',
  // '/js/main.js',
  // '/js/restaurant_info.js',
  // '/restaurant.html',
  // './css/styles.css'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCache).then(cache => cache.addAll(cacheFiles))
  );
});

self.addEventListener('activate', event => {

  event.waitUntil(
    caches.keys().then(keys => Promise.all(
        keys.map(key => {
          console.log(staticCache);
          return caches.delete('restaurant-v3');
          if (!staticCache.indexOf(key) == -1) {
            return caches.delete(key);
          }
        })
      ))
  );
});


self.addEventListener('fetch', event => {

  event.respondWith(
    caches.match(event.request).then(response => {

        // return response || fetch(event.request);
        if (response) {
          console.log('[Service Worker] Found in Cache', event.request.url, response);
          return response;
        }

        // If the request is not found in cache
        var requestClone = event.request.clone();

        return fetch(requestClone)
                .then(function(response) {
                  if (!response) {
                    console.log('[Service Worker] No response from fetch');
                    return response;
                  }

                  var responseClone = response.clone();

                  caches.open(staticCache).then(function(cache) {
                    cache.put(event.request, responseClone);
                    console.log('[Service Worker] New data cached', event.request.url);
                  })
                })
                .catch(err => {console.log('[ServiceWorker] Error Fetching & Caching New Data', err)});

    })
  );
});
