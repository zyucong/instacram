const cacheName = 'v1';

// obtain from YouTube https://www.youtube.com/watch?v=ksXwaWHCW6k
// add event listener to fetch and store all the request and response to cache
self.addEventListener('fetch', e => {
    e.respondWith(
        // if fetch success, get the response from api
        fetch(e.request).then(res => {
            const cloneResponse = res.clone();
            caches.open(cacheName).then(cache => {
                cache.put(e.request, cloneResponse);
            });
            return res;
        })
        // otherwise, look for the cache to populate the web page
        .catch(() => caches.match(e.request).then(res => res))
    );
});
