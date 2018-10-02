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

  var restId = restaurant.id;
  restId = restId.toString();
  var favStatus = restaurant.is_favorite;
  var favorite = createFavorite();
  var favContainer = document.getElementById('fav-container');
  favContainer.appendChild(favorite);

  function createFavorite() {

  var addBox = document.createElement('input');
  addBox.alt = "favorite toggle";
  addBox.type = 'image';
  addBox.id = restId + 'f';
  addBox.className = 'favStars';

    if(favStatus == true || favStatus == 'true'){
      addBox.src = './img/star-1.png';     
      addBox.addEventListener('click', rmFavorite);
    }
    else if(favStatus == false || favStatus == 'false'){
      addBox.src = './img/star-2.png';     
      addBox.addEventListener('click', addFavorite);
    }
    else {
      addBox.innerHTML = "Favorites not available";    
    }
  document.body.appendChild(addBox);
  return addBox;
  }

  function addFavorite() {
    var url = 'http://localhost:1337/restaurants/' + restId + '/?is_favorite=true';

      fetch(url, {
        method: 'PUT',
      }).then(console.log("marking favorite"))
      .catch(error => console.error('Error:', error));

    var star = document.getElementById(restId + 'f');
    star.src = './img/star-1.png';
    star.removeEventListener('click', addFavorite);
    star.addEventListener('click', rmFavorite); 


  }  

  function rmFavorite() {
    var url = 'http://localhost:1337/restaurants/' + restId + '?is_favorite=false';

      fetch(url, {
        method: 'PUT',
      }).then(console.log("removing favorite"))
      .catch(error => console.error('Error:', error));

    var star = document.getElementById(restId + 'f');
    star.src = './img/star-2.png';
    star.removeEventListener('click', rmFavorite);
    star.addEventListener('click', addFavorite); 

  }

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

function showFormIndex() {
  var button = document.getElementById('review-button');
  var form = document.getElementById('review-form');
  var submit = document.getElementById('submit-button');

  button.addEventListener('click', function() {
    form.style.display = 'block';
    button.style.display = 'none';
  });

  submit.addEventListener('click', getData);
}
showFormIndex();

function getData() {
  var restId = getParameterByName('id')
  var nameF = document.getElementById('nameF').value;
  var ratingF = document.getElementById('ratingF').value;
  var reviewF = document.getElementById('reviewF').value;
  var data = {
    "restaurant_id": restId,
    "name": nameF,
    "rating": ratingF,
    "comments": reviewF
};

var url = 'http://localhost:1337/reviews/';

fetch(url, {
  method: 'POST', // or 'PUT'
  body: JSON.stringify(data), // data can be `string` or {object}!
  headers:{
    'Content-Type': 'application/json'
  }
}).then(res => res.json())
.then(response => console.log('Success:', JSON.stringify(response)))
.catch(error => console.error('Error:', error));

location.reload(true);
alert("your review was added");

return data;
}



