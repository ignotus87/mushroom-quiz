// Choose a cache name
const cacheName = 'cache-v1';

// List the files to precache
const precacheResources = ['/', '/index.html', '/Style/app.css', '/selectNameByImage.js', '/Species/speciesList.json', '/Translation/translation.json',
    '/Script/vue.global.js', '/favicon.ico', '/Images/appBanner.png', '/Images/background.jpg', '/Images/green_tick.png', '/Images/red_x.png'];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
    console.log('Service worker install event!');
    event.waitUntil(
        caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activate event!');
});

// Caching approach based on https://gomakethings.com/how-to-set-an-expiration-date-for-items-in-a-service-worker-cache/

/**
* Check if cached API data is still valid
* @param  {Object}  response The response object
* @return {Boolean}          If true, cached data is valid
*/
var isValid = function (response) {
    if (!response) return false;
    var fetched = response.headers.get('sw-fetched-on');
    if (fetched && (parseFloat(fetched) + (1000 * 60 * 60 * 2)) > new Date().getTime()) return true;
    return false;
};

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (isValid(cachedResponse)) {
                return cachedResponse;
            }
            return fetch(event.request).then(function (response) {

                // Cache for offline access
                var copy = response.clone();
                event.waitUntil(caches.open('api').then(function (cache) {
                    var headers = new Headers(copy.headers);
                    headers.append('sw-fetched-on', new Date().getTime());
                    return copy.blob().then(function (body) {
                        return cache.put(event.request, new Response(body, {
                            status: copy.status,
                            statusText: copy.statusText,
                            headers: headers
                        }));
                    });
                }));

                // Return the requested file
                return response;

            }).catch(function (error) {
                return caches.match(event.request).then(function (response) {
                    return response || caches.match('/offline.json');
                });
            });
        }),
    );
});

