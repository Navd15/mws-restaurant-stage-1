let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                zoom: 16,
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                scrollWheelZoom: false
            });
            L.pa
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
                mapboxToken: 'pk.eyJ1IjoibmF2ZDE1IiwiYSI6ImNqaWJtbW14dDA3aTgzdnFrN3RwcXhhbzYifQ.vBZwbAXdPCMhDdeExbhJBQ',
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(newMap);
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
}

/* window.initMap = () => {
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
} */

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

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    // const conatiner = document.getElementById('restaurant-container');
    const name = document.getElementById('restaurant-name');
    // const newRev = document.getElementById('addReview');
    name.innerHTML = restaurant.name;
    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    const pic= document.getElementById('restaurant-img');
    Helper.createPictureSource(pic,restaurant.id);
    const img = document.createElement('img');
    img.id = 'restaurant-img'
    img.alt = `${restaurant.name} restaurant`;
    img.srcset = DBHelper.imageUrlForRestaurant(restaurant);
    pic.appendChild(img);
    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }

    Helper.genAddReviewForm();

    // fill reviews
    fillReviewsHTML();
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
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    fetch(`http://localhost:1337/reviews/${review.id}`).then(res=>{
/*
 Just save them  in db

*/
    });

    const li = document.createElement('li');
    const sp = document.createElement('span');
    const name = document.createElement('p');
    name.setAttribute('id', 'customerName');
    name.innerHTML = review.name;
    name.appendChild(sp);


    const date = document.createElement('p');
    date.innerHTML = new Date(review.createdAt).toDateString().split(' ').slice(1).join();
    date.setAttribute('id', 'createdAt');
    sp.setAttribute('id', 'date');
    sp.appendChild(date);

    // li.appendChild(sp);
    li.appendChild(name);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.setAttribute('id', 'rating');
    li.appendChild(rating);

    date.appendChild(Helper.genMenu(review.id, self.restaurant.id))
    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.setAttribute('id', 'commment');
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
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

/* Class containing helper methods for restaurant.html */
class Helper {
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


    /* Add 'edit ' and 'delete'
     button to reviews */




    static genMenu(id, resid) {
        const conatiner = document.createElement('div');
        const edit = document.createElement('div');
        const del = document.createElement('div');

        conatiner.style.setProperty('display', 'inline-block');

        edit.setAttribute('id', 'editOpt');
        del.setAttribute('id', 'delOpt');

        edit.setAttribute('title', 'Edit review');
        del.setAttribute('title', 'Delete review');

        edit.style.setProperty('background-image', 'url(img/icons/edit.png)');
        del.style.setProperty('background-image', 'url(img/icons/del.png)');
        clickListener.call(edit);
        del.addEventListener('click', deleteComment)


        /* Delete the review with id-> review.id */
        // Change it to API Helper
        function deleteComment() {
            const url = new URL(`http://localhost:1337/reviews/${id}`);
            APIHelper.api(url, 'DELETE', null, null, resid).then(res => {
                location.reload();
            })

        }

        /*Edit the review, inserting data into addreview form */

        function clickListener() {
            const ele = this;
            ele.addEventListener('click', (event) => {
                fetch(`http://localhost:1337/reviews/${id}`)
                    .then(res => {
                        if (res.status == 200){
                            res.json().then(final => {
                                Helper.fillUpdateForm(final);
                                scrollTo({ 'top': document.getElementById('addReview').offsetTop - 100 });

                            })
                        }
                    },(rej)=>{alert('You are currently offline.');})


            })




        }
        conatiner.appendChild(edit)
        conatiner.appendChild(del)
        return conatiner;
    }

    static genAddReviewForm() {
        /* Define submit buttoon actions here */
        const submit = document.getElementById('revSubmit')
        submit.onclick = Helper.PostNew_UpdateComment;

        let revRating = document.getElementById('revRating');
        revRating.style.setProperty('display', 'flex');
        fitStars.call(revRating);
        /* Add div with 'stars at */
        function fitStars() {
            let star;
            for (let i = 1; i <= 5; i++) {
                star = document.createElement('div');
                star.id = i;
                star.title = i;
                star.addEventListener('click', fill);
                star.setAttribute('class', 'open');
                star.classList.add('rating');
                // star.style.setProperty('background-image','url(img)')
                this.appendChild(star);
            }


            function fill(event) {
                const ele = document.getElementById(event.path[0].id);
                const input = document.getElementById('revRatingInput');
                if (ele.classList.contains('filled')) {
                    for (let i = 5; i >= 1; i--) {
                        document.getElementById(i).classList.replace('filled', 'open');

                    }
                    input.value = " ";
                    return;
                }

                /* Make all star divs  black  till selected div*/
                for (let i = 5; i >= ele.id; i--) {
                    document.getElementById(i).classList.replace('filled', 'open');
                }

                /* Make all star divs  golden from selected div   */
                for (let i = ele.id; i >= 1; i--) {
                    document.getElementById(i).classList.replace('open', 'filled')

                }
                input.value = ele.id;



            }


        }
    }


    /* Take data from  the  desired review and 
    fill up the add review div form*/
    static fillUpdateForm(info) {
        const revRating = document.getElementById('revRatingInput');
        const userName = document.getElementById('userName');
        const submit = document.getElementById('revSubmit');
        const comments = document.getElementById('revComment');

        revRating.value = info.rating;
        userName.value = info.name;
        submit.value = 'Update';
        submit.tempRevId = info.id;
        comments.innerText = info.comments;


    }

    static conditionsMet() {
        const commnt = document.getElementById('revComment').value;
        const name = document.getElementById('userName').value;
        const rating = document.getElementById('revRatingInput').value;

        if (commnt != "" & name != "" & rating != "") {
            return true;
        }

        return false;

    }
    static PostNew_UpdateComment(event) {
        if (!Helper.conditionsMet()) {
            alert('Please fill the all values !!');
            return;
        }
        else {
            const method = event.path[0].value == 'Update' ? 'PUT' : 'POST';
            const xtra = self.restaurant.id;

            const data = {

                'restaurant_id':parseInt(self.restaurant.id),
                "name": document.getElementById('userName').value,
                "rating": parseInt(document.getElementById('revRatingInput').value),
                "comments": document.getElementById('revComment').value
            }
            switch (method) {
                case 'POST':
                    APIHelper.api('http://localhost:1337/reviews/', 'POST', data, null, xtra).then((res) => {
                        location.reload();
                    })

                    break;
                case 'PUT':
                    APIHelper.api(`http://localhost:1337/reviews/${document.getElementById('revSubmit').tempRevId}`, 'PUT', data, null, xtra).then(res => {
                        location.reload()
                    })
break;
            }
        }
    }
}

