let restaurants,
    neighborhoods,
    cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
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
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibmF2ZDE1IiwiYSI6ImNqaWJtbW14dDA3aTgzdnFrN3RwcXhhbzYifQ.vBZwbAXdPCMhDdeExbhJBQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
}
/* window.initMap = () => {
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
} */

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

    const pic = document.createElement('picture');
    mainjs.createPictureSource(pic, restaurant.id)
    const img = document.createElement('img');

    img.className = 'restaurant-img';
    img.alt = `${restaurant.name} restaurant`;
    img.srcset = DBHelper.imageUrlForRestaurant(restaurant);
    pic.append(img);

    li.append(pic);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);
    // const likeForm = document.createElement('form');
    const like = document.createElement('div');
    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.setAttribute('aria-label', `View Details of ${restaurant.name}`);
    like.setAttribute('class', 'like');
    // like.setAttribute('src',`/img/icons/${restaurant.is_favorite}.png`);
    like.style.setProperty('background-image', `url(img/icons/${restaurant.is_favorite}.png)`);
    let hoverTitle = "Add to favourites";

    if (restaurant.is_favorite === true) {
        hoverTitle = "Remove from favourites";
    }
    like.title = hoverTitle;
    const alternateVal = !restaurant.is_favorite;
    const apiHelper = APIHelper;
    // like.value=alternateVal;
    // likeForm.action='http://localhost:1337/restaurants/'+restaurant.id;
    // const head=new Headers().append();
    like.addEventListener('click', () => {
        apiHelper.api('http://localhost:1337/restaurants/'+restaurant.id+'/?is_favorite='+JSON.parse(alternateVal), 'PUT',null,null,{resid:restaurant.id,alternateVal:alternateVal}).then(resolve => {
            updateRestaurants();
            mainjs.changedivImage(like, restaurant.is_favorite);
        })


    })
    // mainjs.addOnClick(like,{'id':restaurant.id,'val':alternateVal})
    // likeForm.target = '_self';
    // likeForm.action = 'http://localhost:1337/restaurants/'+restaurant.id+'/?is_favorite='+alternateVal;

    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);
    li.append(like);
    return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map

        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);
        function onClick() {
            window.location.href = marker.options.url;
        }
    });
}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  }); 
} */



class mainjs {
    static createPictureSource(pic, id) {
        let src_small = document.createElement('source');
        let src_medium = document.createElement('source');
        let src_large = document.createElement('source');
        src_small.media = "(max-width: 480px)";
        src_small.srcset = `/img/comp/${id}-small.jpg`;
        src_medium.media = "(max-width: 780px)";
        src_medium.srcset = `/img/comp/${id}-medium.jpg`;

        src_large.media = "(max-width: 2000px)";
        src_large.srcset = `/img/comp/${id}-large.jpg`;
        pic.append(src_small);
        pic.append(src_medium);
        pic.append(src_large);

    }
    /* Change image for favourites div element */
    static changedivImage(ele, name) {
        ele.style.setProperty('background-image', `url(img/icons/${JSON.parse(name)}.png)`);

    }

}