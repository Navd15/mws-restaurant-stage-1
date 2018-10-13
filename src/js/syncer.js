/* Class handles different method api requests */
class APIHelper {
    constructor() {
        this.indexed_db_name = 'rest-cache-v2';
        this.object_store_name = 'jsonData';
    }
    static api(url, method, data = null, options = null, extra = null) {
        return new Promise((resolve, reject) => {
            switch (method) {

                case 'PUT':
                    this.apiPUT(url, data, options, extra).then(res => {
                        resolve()
                    })

                    break;

                case 'POST':
                    this.apiPOST(url, data, extra).then(res => {
                        resolve();

                    })
                    break;

                case 'DELETE':
                    this.apiDelete(url, extra).then(res => {
                        resolve();

                    })
                    break;
            }

        })

    }
    /* Do not directly use these methods:*/

    static apiPUT(url, data, options = null, extra) {
        return new Promise((resolve, reject) => {

            if (typeof url == "string") {
                url = new URL(url);
            }
            if (data == null) {
                fetch(url, {
                    method: 'PUT'
                }).then(res => {
                    if (res.status == 200) {
                        if (res.url.endsWith('false') || res.url.endsWith('true')) {
                            const apihelp = new APIHelper();
                            DB.delete(apihelp.indexed_db_name, apihelp.object_store_name, 0)
                                .then((res) => {
                                    resolve();
                                })

                        }
                    } else {


                    }


                })

            } else {
                const header = new Headers({
                    'content-type': 'application/json'
                })

                fetch(url, {
                    method: 'PUT',
                    headers: header,
                    body: JSON.stringify(data)
                }).then(res => {
                    if (res.status == 200) {
                        const apihelp = new APIHelper();
                        DB.delete(apihelp.indexed_db_name, apihelp.object_store_name, extra)
                            .then((res) => {
                                resolve();
                            })

                    } else
                        /* save to pending req db */

                        return;

                }, (req) => {


                })
            }

        })

    }

    /* @url -POST url  
    @data- POST data
    @extra -can include id of restaurant for idb delete etc
    */

    static apiPOST(url, data, extra) {
        return new Promise((resolve, reject) => {
            if (typeof url == "string") {
                url = new URL(url);
            }
            const header = new Headers({
                'content-type': 'application/json'
            })
            const apihelp = new APIHelper();
            fetch(url, {
                method: 'POST',
                headers: header,
                body: JSON.stringify(data)
            }).then(res => {
                if (res.status == 201) {

                    DB.delete(apihelp.indexed_db_name, apihelp.object_store_name, extra).then(res => {
                        resolve();
                    })
                }

            }, reject => {
                DB.update(apihelp.indexed_db_name, apihelp.object_store_name, data, extra).then(res => {
                    resolve();

                })
            })

        })

    }

    static apiDelete(url, extra) {
        return new Promise((resolve, reject) => {
            if (typeof url == "string") {

                url = new URL(url);
            }
            fetch(url, {
                method: 'DELETE'
            }).then(res => {
                if (res.status == 200) {
                    const apihelp = new APIHelper();
                    DB.delete(apihelp.indexed_db_name, apihelp.object_store_name, extra).then(res => {
                        resolve();

                    });
                }
            })

        })

    }

}


/* Failed API helper class */
class PendingStuff {
    static updatePendingObjectStore(newObj) {
        return new Promise((resolve, reject) => {
            const apihelp = new APIHelper();
            const db = indexedDB.open(apihelp.indexed_db_name, 1);
            db.onsuccess = (event) => {
                event.target.result.transaction('pendingStuff', 'readwrite').objectStore('pendingStuff').add(newObj).onsuccess = () => {
                    resolve();
                }
            }
        })
    }
}

/* Helper class for database access */

class DB {

    /*@dbName- database name 
    @objstore- object store 
    @key - location to be deleted */

    static delete(dbName, objstore, key) {
        return new Promise((resolve, reject) => {
            const db = indexedDB.open(dbName, 1);
            db.onsuccess = (event) => {
                const newDB = event.target.result;
                const req = newDB.transaction(objstore, 'readwrite')
                    .objectStore(objstore).delete(key);
                resolve();
            };
        })
    }

    static update(dbName, objectStore, data, key) {
        return new Promise((resolve, reject) => {
            const db = indexedDB.open(dbName, 1);
            db.onsuccess = (event) => {

                const newDB = event.target.result;
                const trx = newDB.transaction(objectStore, 'readwrite');
                const req = trx.objectStore(objectStore).get(key);
                req.onsuccess = (event) => {
                    const backup = req.result.jsonData;

                    if (backup) {
                        const newData = {
                            "comments": data.comments,
                            "restaurant_id": parseInt(data.restaurant_id),
                            "rating": parseInt(data.rating),
                            "name": data.name,
                            "createdAt": new Date().toISOString()
                        }

                        backup.push(newData);
                        trx.objectStore(objectStore).put({
                            id: key,
                            jsonData: backup
                        }).onsuccess = () => {
                            const pendingObj = {
                                url: "http://localhost:1337/reviews/",
                                body: newData
                            }
                            PendingStuff.updatePendingObjectStore(pendingObj).then(res => {
                                resolve()
                            })

                        }

                    }
                }

            }

        })

    }


}

// function tryFailedReq(callback) {
//     const db = indexedDB.open('rest-cache-v2', 1);

//         db.onsuccess = (event) => {
//             const no = event.target.result.objectStoreNames.length;

//             if (no > 1) {
//                 const trx = event.target.result.transaction('pendingStuff', 'readwrite').objectStore('pendingStuff');
//                 trx.openCursor().onsuccess = (event) => {
//                     const cursor = event.target.result;
//                     const header = new Headers({ 'content-type': 'application/json' })

//                     if (cursor) {
//                         if (!this.last_key) {
//                             this.last_key = cursor.value.body.restaurant_id;
//                         }
//                         fetch(new URL(cursor.value.url), { method: 'POST', headers: header, body: JSON.stringify(cursor.value.body) }).then(res => {

//                             if (res.status == 201) {
//                                 DB.delete('rest-cache-v2', 'pendingStuff', cursor.key).then(res => {

//                                 });
//                             }
//                         })
//                         cursor.continue();
//                     }
//                     else {
//                         callback();

//                     }
//                 }

//             }

//         }

// }

// (function s() {
//     navigator.connection.onchange = (event) => {
//           if (event.currentTarget.downlink==0){


//           }

//         if (event.currentTarget.downlink > 0) {
//             tryFailedReq(()=>{
//                 DB.delete('rest-cache-v2', 'jsonData', this.last_key).then(res => {
//                     location.reload();
//                 })
//             })


//         }
//     }

// })()