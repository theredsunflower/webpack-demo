import idb from 'idb';

//open IndexedDb database
var dbPromise = idb.open('restaurants', 1, function(upgradeDb) {
	if (!upgradeDb.objectStoreNames.contains('restaurants')) {
	upgradeDb.createObjectStore('restaurants', {keyPath:'id'});
  }
});

var rePromise = idb.open('reviews', 1, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains('reviews')) {
  upgradeDb.createObjectStore('reviews', {keyPath:'id'});
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html', 
        '/restaurant.html?id=1',
        '/restaurant.html?id=2',
        '/restaurant.html?id=3',
        '/restaurant.html?id=4',
        '/restaurant.html?id=5',
        '/restaurant.html?id=6',
        '/restaurant.html?id=7',
        '/restaurant.html?id=8',
        '/restaurant.html?id=9',
        '/css/styles.css',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/star-1.png',
        '/img/star-2.png',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js'
      ]);
    })
  );
});
/*
self.addEventListener('fetch', function(event) {
  var requestUrl = event.request.url;
  event.respondWith(
    fetch(event.request).then(console.log(event.request.url.index))
  );
});
*/

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
  if (checkURL.pathname === "/restaurants") {
    //check to see if homepage
    if(event.request.referrer === "http://localhost:8080/") {
      const id = "-1"
      handleAJAXEvent(event, id);
    }
    else {
      //get restaurant info
      const indR = event.request.referrer;
      const parts = indR.split("=");
      const id = parts[1];
      console.log(id);
      
      handleAJAXEvent(event, id);
    }

  } else if(checkURL.pathname === "/reviews/") {
    const parts = checkURL.search.split("=");
    const id = parts[1];
    
    handleReviewEvent(event, id);
  }
  else {
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
        return new Response("Error fetching restaurant data", { status: 500 });
      })
  );
};

const handleReviewEvent = (event, id) => {
  // Check the IndexedDB to see if the JSON for the API
  // has already been stored there. If so, return that.
  // If not, request it from the API, store it, and then
  // return it back.
  event.respondWith(
    rePromise
      .then(re => {
        return re
          .transaction("reviews")
          .objectStore("reviews")
          .get(id);
      })
      .then(data => {
        return (
          (data && data.data) ||
          fetch(event.request)
            .then(fetchResponse => fetchResponse.json())
            .then(json => {
              return rePromise.then(re => {
                const tx = re.transaction("reviews", "readwrite");
                tx.objectStore("reviews").put({
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
        return new Response("Error fetching review data", { status: 500 });
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
