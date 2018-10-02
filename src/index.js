import idb from 'idb';

//open IndexedDb database
var dbPromise = idb.open('restaurants', 1, function(upgradeDb) {
	if (!upgradeDb.objectStoreNames.contains('restaurants')) {
	upgradeDb.createObjectStore('restaurants', {keyPath:'id'});
	}
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html', 
        '/restaurant.html?id={x}'
      ]);
    })
  );
});
/*
//listen for fetch events
self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }

  // Requests going to the API get handled separately from those
  // going to other destinations
  const checkURL = new URL(event.request.url);
  if (checkURL.port === "1337") {
    const parts = checkURL.pathname.split("/");
    const id =
      parts[parts.length - 1] === "restaurants"
        ? "-1"
        : parts[parts.length - 1];
    handleAJAXEvent(event, id);
  } else {
    handleNonAJAXEvent(event, cacheRequest);
  }
});

const handleAJAXEvent = (event, id) => {
  // Check the IndexedDB to see if the JSON for the API
  // has already been stored there. If so, return that.
  // If not, request it from the API, store it, and then
  // return it back.
  event.respondWith(
    dbPromise
      .then(db => {
        return db
          .transaction("restaurants")
          .objectStore("restaurants")
          .get(id);
      })
      .then(data => {
        return (
          (data && data.data) ||
          fetch(event.request)
            .then(fetchResponse => fetchResponse.json())
            .then(json => {
              return dbPromise.then(db => {
                const tx = db.transaction("restaurants", "readwrite");
                tx.objectStore("restaurants").put({
                  id: id,
                  data: json
                });
                return json;
              });
            })
        );
      })
      .then(finalResponse => {
        return new Response(JSON.stringify(finalResponse));
      })
      .catch(error => {
        return new Response("Error fetching data", { status: 500 });
      })
  );
};

const handleNonAJAXEvent = (event, cacheRequest) => {
  // Check if the HTML request has previously been cached.
  // If so, return the response from the cache. If not,
  // fetch the request, cache it, and then return it.
  event.respondWith(
	caches.match(event.request).then(function(response)
    {
      return response || fetch(event.request);
    })
  );
};
*/