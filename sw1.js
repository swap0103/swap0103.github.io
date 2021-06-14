self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        './',
        './VaccineFinder.html',
        './Test.html',
        './style.css',
        './master.jss',
        './main.js'
      ]);
    })
  );
});
self.addEventListener('fetch', function(event) {
 console.log(event.request.url);

event.respondWith(
   caches.match(event.request).then(function(response) {
     return response || fetch(event.request);
   })
 );
});
