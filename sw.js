importScripts('sw-cache-polyfill.js');

var CACHE_VERSION = 'app-v1';
var CACHE_FILES = [
    '/AndroidXMigrateHelper',
    '/AndroidXMigrateHelper/index.html',
    '/AndroidXMigrateHelper/assets/scripts/script.js',
    '/AndroidXMigrateHelper/assets/scripts/clipboard-copy-element.js',
    '/AndroidXMigrateHelper/assets/styles/search.css',
    '/AndroidXMigrateHelper/favicon.ico',
    '/AndroidXMigrateHelper/assets/manifest.json',
    '/AndroidXMigrateHelper/assets/icons/icon-72x72.png',
    '/AndroidXMigrateHelper/assets/icons/icon-96x96.png',
    '/AndroidXMigrateHelper/assets/icons/icon-128x128.png',
    '/AndroidXMigrateHelper/assets/icons/icon-144x144.png',
    '/AndroidXMigrateHelper/assets/icons/icon-152x152.png',
    '/AndroidXMigrateHelper/assets/icons/icon-180x180.png',
    '/AndroidXMigrateHelper/assets/icons/icon-192x192.png',
    '/AndroidXMigrateHelper/assets/icons/icon-384x384.png',
    '/AndroidXMigrateHelper/assets/icons/icon-512x512.png',
    '/AndroidXMigrateHelper/assets/data/androidx-artifact-mapping.json',
    '/AndroidXMigrateHelper/assets/data/androidx-class-mapping.json'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(CACHE_FILES);
            })
    );
});

self.addEventListener('fetch', function (event) {
    let online = navigator.onLine
    if(!online){
        event.respondWith(
            caches.match(event.request).then(function(res){
                if(res){
                    return res;
                }
                requestBackend(event);
            })
        )
    }
});

function requestBackend(event){
    var url = event.request.clone();
    return fetch(url).then(function(res){
        //if not a valid response send the error
        if(!res || res.status !== 200 || res.type !== 'basic'){
            return res;
        }

        var response = res.clone();

        caches.open(CACHE_VERSION).then(function(cache){
            cache.put(event.request, response);
        });

        return res;
    })
}

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(key, i){
                if(key !== CACHE_VERSION){
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});
