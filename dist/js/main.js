if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
  .then(function(reg) {
    // registration worked
    console.log('Registration succeeded');
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + 'restaurant-photo';
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  //gives users ability to mark restaurant as a favorite
  var restId = restaurant.id;
  restId = restId.toString();
  var favStatus = restaurant.is_favorite;
  var favorite = createFavorite();
  li.append(favorite);

  function createFavorite() {
    var addBox = document.createElement('a');
    addBox.id = restId + 'fav';
    addBox.innerHTML = "unchecked";

    document.body.appendChild(addBox);
    console.log(favStatus);

    check();

    return addBox;
}
  function check() {
    var updateBox = document.getElementById(restId + 'fav');
    if (favStatus == true || favStatus == 'true') {
      updateBox.innerHTML = "Favorite";
      updateBox.addEventListener('click', rmFavorite);
    }
    else if (favStatus == false || favStatus == 'false') {
      updateBox.innerHTML = "Not Favorite";
      updateBox.addEventListener('click', addFavorite);      
    }
    else {
      console.log("not sure what is happening here");
   }
  }

  function addFavorite() {
    var url = 'http://localhost:1337/restaurants/' + restId + '/?is_favorite=true';

      fetch(url, {
        method: 'PUT',
      }).then(console.log("marking favorite"))
      .catch(error => console.error('Error:', error));

    var text = document.getElementById(restId + 'fav');
    text.innerHTML = "new Favorite";
    text.addEventListener('click', check); 

  }  

  function rmFavorite() {
    var url = 'http://localhost:1337/restaurants/' + restId + '?is_favorite=false';

      fetch(url, {
        method: 'PUT',
      }).then(console.log("removing favorite"))
      .catch(error => console.error('Error:', error));

    var text = document.getElementById(restId + 'fav');
    text.innerHTML = "Removed";
    text.addEventListener('click', check); 
  }  
  return li
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
//add favorite checkbox and home page form

function showFormIndex() {
  var button = document.getElementById('review-button');
  var form = document.getElementById('review-form');

  button.addEventListener('click', function() {
    form.style.display = 'block';
    button.style.display = 'none';
  });
}
showFormIndex();


