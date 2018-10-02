let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  getReviews();
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}
function getReviews(){
var restId = getParameterByName('id');
var restUrl = 'http://localhost:1337/reviews/?restaurant_id=' + restId;
console.log(restUrl);
fetch(restUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    var reviews = myJson;
    var i;
    
    if(reviews.length > 1) {
      for(i = 0; i < reviews.length; i++) {
      var review = reviews[i];
      var reviewUl = document.getElementById('reviews-list');        
      var reviewLi = document.createElement('li');
      var reviewName = document.createElement('h2');
      var reviewRating = document.createElement('p');
      var reviewComment = document.createElement('p');
      console.log(review);

      reviewName.innerHTML = review.name;
      reviewRating.innerHTML = review.rating;
      reviewComment.innerHTML = review.comments;


      reviewUl.append(reviewLi);
      reviewLi.append(reviewName);
      reviewLi.append(reviewRating);
      reviewLi.append(reviewComment);

      }
    }
    else {
      console.log("no reviews");
    }
    return;
  });
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = 'restaurant detail image'

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function showFormR() {
  var button = document.getElementById('review-button-two');
  var form = document.getElementById('review-form-two');

  button.addEventListener('click', function() {
    form.style.display = 'block';
    button.style.display = 'none';
  });
}
showFormR();



