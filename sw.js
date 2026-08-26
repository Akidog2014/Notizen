const CACHE_NAME = "erfassung-pwa-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* =====================================================
   INSTALLATION
===================================================== */

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                function(cache) {

                    return cache.addAll(
                        APP_FILES
                    );

                }
            )
            .then(
                function() {

                    return self.skipWaiting();

                }
            )

        );

    }
);


/* =====================================================
   AKTIVIERUNG
===================================================== */

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys()
                .then(
                    function(cacheNames) {

                        return Promise.all(

                            cacheNames.map(
                                function(cacheName) {

                                    if (
                                        cacheName !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        );

                    }
                )
                .then(
                    function() {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =====================================================
   OFFLINE / FETCH
===================================================== */

self.addEventListener(
    "fetch",
    function(event) {

        /*
           Nur GET-Anfragen behandeln.
        */

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                function(cachedResponse) {

                    /*
                       Wenn bereits im Cache:
                       sofort verwenden.
                    */

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    /*
                       Sonst aus dem Internet laden.
                    */

                    return fetch(
                        event.request
                    )
                    .then(
                        function(response) {

                            /*
                               Erfolgreiche Antwort
                               für später speichern.
                            */

                            if (
                                response &&
                                response.status === 200 &&
                                response.type === "basic"
                            ) {

                                const responseClone =
                                    response.clone();


                                caches.open(
                                    CACHE_NAME
                                )
                                .then(
                                    function(cache) {

                                        cache.put(
                                            event.request,
                                            responseClone
                                        );

                                    }
                                );

                            }


                            return response;

                        }
                    );

                }
            )

        );

    }
);
