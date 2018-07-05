const cacheName="rest-cache-v2";

self.addEventListener('install',(event)=>{
        event.waitUntil(caches.open(cacheName).then((cache)=>{
    return cache.addAll(["/", 
             "/data/restaurants.json",
            "/css/styles.css",
             "/css/@media768.css", 
             "/css/@media425.css",
             "/js/dbhelper.js",
             "/js/main.js",
            "/js/restaurant_info.js",
             "/restaurant.html",
             "/favicon.ico",
            // "/img/1.jpg",
            // "/img/2.jpg",
            // "/img/3.jpg",
            // "/img/4.jpg",
            // "/img/5.jpg",
            // "/img/6.jpg",
            // "/img/7.jpg",
            // "/img/8.jpg",
            // "/img/9.jpg",
            // "/img/10.jpg",
        ]) 
        })
    
    )})

  self.addEventListener('fetch',(event)=>{
    var requestUrl = new URL(event.request.url);
event.respondWith(caches.match(event.request).then((response)=>{
    if(response) return response;

    return fetch(event.request).then((resonse)=>{

        return caches.open(cacheName).then((cache)=>{
            cache.put(event.request, response.clone());
            return response;

        })

    })

}))

  })


  self.addEventListener('activate',(event)=>{

    event.waitUntil(
caches.keys().then((allCaches)=>{
    return Promise.all(
        allCaches.filter((caches)=>{

            return caches.startsWith('rest- ') && caches!=cacheName ; 
        }).map((cacheNames)=>{
        return cache.delete(cacheNames )
        
        })
    )


})

    )    
  })