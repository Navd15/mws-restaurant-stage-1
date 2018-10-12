const idbName = cacheName = "rest-cache-v2"; /* Same name for cache and indexDb  */
const ver = 1;
const port = 1337; /* Change it according to json server  */

self.addEventListener('install', (event) => {
    event.waitUntil( caches.open(cacheName).then((cache) => {
        return cache.addAll([
            "img/icons/starGold.png",
            "img/icons/starBlack.png",
            "img/icons/false.png",
            "img/icons/true.png",
            "img/favicon.ico",
            "restaurant.html",
            "js/main.js",
            "index.html",
            "js/dbhelper.js",
            "js/restaurant_info.js",
            "css/styles.css",
            "css/@media768.css",
            "css/@media480.css"
            
        ])

    })

    )
})

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    /*Only save and get json requests from indexDb */

    if (requestUrl.port == port && event.request.method == 'GET') {
        
        url = requestUrl.href;
        event.respondWith(
            result().then(res => {
                return new Response(res);
            }))

        return;

    } else

        event.respondWith(caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
               

                if (response.status == 404) {
                    // show error.html 
                    return fetch('error.html').then((res) => {
                        return res;
                    })

                }
                if (event.request.method == 'GET') {
                    return caches.open(cacheName).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;

                    })
                }
                return response;
            });

        }))

})


self.addEventListener('activate', (event) => {

    event.waitUntil(
        caches.keys().then((allCaches) => {
            return Promise.all(
                allCaches.filter((caches) => {
                    return caches.startsWith('rest- ') && caches != cacheName;
                }).map((cacheNames) => {
                    return cache.delete(cacheNames)
                })
            )


        })

    )
})

/* Helper methods for indexDB */


/* An easy way to use indexdb is by utilizing idb library: https://github.com/jakearchibald/idb

or if you want to burn out your brain juice..continoue -->
*/

const result = () => {
    return new Promise((resolve, reject) => {
    let regex = new RegExp('http:\/\/localhost:1337\/reviews\/');
    let jsonDb = indexedDB.open(idbName, ver);
        jsonDb.onupgradeneeded=(event) => { /* This handler will be called when there is need to upgrade the db  */
       
            let objectStore;
            let db = event.target.result;

            if(event.oldVersion==0) {
                    objectStore = db.createObjectStore('jsonData', {
                        keyPath: 'id'
                    });

                    db.createObjectStore('pendingStuff',{ autoIncrement : true });
            }
    
            objectStore.transaction.oncomplete = (event) => {

                let rid = 0;
                if (regex.exec(url) != null) {
                    const equalIndex = url.indexOf('=');
                    if (equalIndex > -1) {
                        rid = Number.parseInt(url.substr(equalIndex + 1))

                    } else {
                        rid = -(Number.parseInt(url.substr(url.lastIndexOf('/') + 1)));
                    }
                }


                let tx = db.transaction('jsonData', 'readonly').objectStore("jsonData");

                let get = tx.get(rid);

                get.onsuccess = event => {
                    if (get.result == undefined) {
                        getjsonData(url).then((result) => {
                            let tx = db.transaction('jsonData', 'readwrite').objectStore('jsonData');
                            let res = tx.add({
                                id: rid,
                                jsonData: result
                            });
                            //Return data after adding it to db
 
           
                            /* Note: call to resolve can be made 
                            in res.onsuccess handler */
                            resolve(JSON.stringify(result));

                        })
                    } else
                        //Return data if already available
                        resolve(JSON.stringify(get.result.jsonData));
                }

            }
        }

        /*This handler will be called when  connection to db is successfully made
                     and there is no need to upgrade  */

        jsonDb.onsuccess = event => {
            let db = event.target.result;
            let objectStore = db.transaction('jsonData', 'readonly').objectStore('jsonData');
            objectStore.transaction.oncomplete = (event) => {

                let rid = 0;  /*  keyPath to search for in indexDb  */

                if (regex.exec(url) != null) {
                    const equalIndex = url.indexOf('=');
                    if (equalIndex > -1) {
                        rid = Number.parseInt(url.substr(equalIndex+ 1))
                    }
                    else {
                        rid = -(Number.parseInt(url.substr(url.lastIndexOf('/') + 1)));
                    }
                }
                let tx = db.transaction('jsonData', 'readwrite').objectStore("jsonData");
                let get = tx.get(rid);
                get.onsuccess = event => {
                    //Check if data is already stored in db
                    if (get.result == undefined) {
                        getjsonData(url).then((result) => {

                            let tx = db.transaction('jsonData', 'readwrite').objectStore('jsonData');

                            let res = tx.add({
                                id: rid,
                                jsonData: result
                            })
                            //Return data after adding it to db

                            /* Note: call to resolve can be made 
                            in res.onsuccess handler */
                            resolve(JSON.stringify(result));
                        })
                    } else

                        //Return data if already available
                        resolve(JSON.stringify(get.result.jsonData));
                }

            }
        }

    })



};

/* Fetch data from URL  */
const getjsonData = (url) => {
    return new Promise((resolve, reject) => {
       return  fetch(url).then((res) => {
            if (res.status == 200) {
                res.json().then((res) => {
                    resolve(res);
                })

            }
        })

    })

}