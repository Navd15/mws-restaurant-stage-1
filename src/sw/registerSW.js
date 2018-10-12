class SW {
    constructor(container){


        this._container=container;
    }

    registerSW() {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.register('./sw.js', { scope: '/' }).then(event => {
                console.log('SW registered')
            })
        }




    }




}

let c=new SW(document.getElementById('maincontent'))
c.registerSW();