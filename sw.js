const cacheName="rest-cache-v2";

self.addEventListener('install',(event)=>{
        event.waitUntil(caches.open(cacheName).then((cache)=>{
    return cache.addAll([
        "/js/main.js",
        "/index.html",
        "/js/dbhelper.js",
        "/js/restaurant_info.js",
            "/data/restaurants.json",
            "/css/styles.css",
            "/css/@media768.css", 
            "/css/@media425.css",
            "/favicon.ico",
        
        ]) 
        })
    
    )})

  self.addEventListener('fetch',(event)=>{
    var requestUrl = new URL(event.request.url);
event.respondWith(caches.match(event.request).then((response)=>{
    if(response)
     return response

    return fetch(event.request).then((response)=>{

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