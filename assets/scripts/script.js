(function ($) {
    "use strict";

    let form = document.querySelector('.searchForm');

    form.addEventListener('submit', function (e) {
        let query = document.querySelector('#search');
        if (query.value === "") {
            searchResult.innerHTML = `<div class="searchStatus">Please enter a <b>Support Library</b> class name.</div>`;
            e.preventDefault();
            return false;
        }

        window.history.pushState({}, "", '?q=' + query.value);
        search_class_mappings(query.value);
        e.preventDefault();
    });

    //Get Artifact,Class Mapping From Json File
    const search_class_mappings = async searchBox => {
        const res_artifact_mapping = await fetch('assets/data/androidx-artifact-mapping.json');
        const res_class_mapping = await fetch('assets/data/androidx-class-mapping.json');

        const artifact_mapping = await res_artifact_mapping.json();
        const class_mapping = await res_class_mapping.json();

        //Get Entered Data
        let filter_artifact_mapping = artifact_mapping.filter(artifact_map => {
            const regex = new RegExp(`^${searchBox}`);
            return artifact_map.OldBuildArtifact.match(regex) || artifact_map.AndroidXBuildArtifact.match(regex);
        });

        //Get Entered Data
        let filter_class_mapping = class_mapping.filter(class_map => {
            const regex = new RegExp(`^${searchBox}`);
            return class_map.SupportLibraryClass.match(regex) || class_map.AndroidXClass.match(regex);
        });

        if (searchBox.length === 0) {
            filter_artifact_mapping = [];
            filter_class_mapping = [];
        }

        if (filter_class_mapping.length === 0) {
            outputArtifactMappingResult(filter_artifact_mapping);
        } else {
            outputClassMappingResult(filter_class_mapping);
        }
    };

    //Show Results in HTML
    const outputClassMappingResult = filter_class_mapping => {
        if (filter_class_mapping.length > 0) {
            const html = filter_class_mapping
                .map(
                    fit => `
                <div class="searchChunk">
                <clipboard-copy value="${fit.SupportLibraryClass}"><div class="chunkOldAndroidSupportLibraryClass" id="chunkOldAndroidSupportLibraryClass">${fit.SupportLibraryClass}</div></clipboard-copy>
                <clipboard-copy value="${fit.AndroidXClass}"><div class="chunkNewAndroidXClass" id="chunkNewAndroidXClass">${fit.AndroidXClass}</div></clipboard-copy>
            </div>
     `
                )
                .join('');
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('q');
            let query = document.querySelector('#search');
            query.value = searchQuery;
            searchResult.innerHTML = `<div class="searchQuery">Showing results <b>${filter_class_mapping.length}</b> for <b>${searchQuery}</b></div>`;
            document.getElementById('searchResult').innerHTML += html;

            document.addEventListener('clipboard-copy', function () {
                const notice = document.getElementById('notice');
                notice.innerText = 'Copied!';
                var x = document.getElementById("notice");
                x.className = "show";
                setTimeout(function () {
                    x.className = x.className.replace("show", "");
                }, 1000);
            });
        } else {
            searchResult.innerHTML = '<div class="searchStatus">Entered query doesn\'t matched.</div>';
        }
    };

    //Show Results in HTML
    const outputArtifactMappingResult = filter_artifact_mapping => {
        if (filter_artifact_mapping.length > 0) {
            const html2 = filter_artifact_mapping
                .map(
                    fit2 => `
                <div class="searchChunk">
                <clipboard-copy value="${fit2.OldBuildArtifact}"><div class="chunkOldAndroidSupportLibraryClass" id="chunkOldAndroidSupportLibraryClass">${fit2.OldBuildArtifact}</div></clipboard-copy>
                <clipboard-copy value="${fit2.AndroidXBuildArtifact}"><div class="chunkNewAndroidXClass" id="chunkNewAndroidXClass">${fit2.AndroidXBuildArtifact}</div></clipboard-copy>
            </div>
     `
                )
                .join('');
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('q');
            let query = document.querySelector('#search');
            query.value = searchQuery;
            searchResult.innerHTML = `<div class="searchQuery">Showing results <b>${filter_artifact_mapping.length}</b> for <b>${searchQuery}</b></div>`;
            document.getElementById('searchResult').innerHTML += html2;

            document.addEventListener('clipboard-copy', function () {
                const notice = document.getElementById('notice');
                notice.innerText = 'Copied!';
                var x = document.getElementById("notice");
                x.className = "show";
                setTimeout(function () {
                    x.className = x.className.replace("show", "");
                }, 1000);
            });
        } else {
            searchResult.innerHTML = '<div class="searchStatus">Entered query doesn\'t matched.</div>';
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    //const defaultQuery = 'com.android.support';

    //https://codepen.io/gschier/pen/jkivt
    var PlaceholderTypeAnim = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    PlaceholderTypeAnim.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.placeholder = this.txt;

        var that = this;
        var delta = 150 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(function() {
            that.tick();
        }, delta);
    };

    if (searchQuery !== null) {
        search_class_mappings(searchQuery)
    } else {
        //window.history.pushState({}, "", '?q=' + defaultQuery);
        //search_class_mappings(defaultQuery);

        var elements = document.getElementsByName('q');
        for (var i=0; i<elements.length; i++) {
            var toRotate = '[ "com.android.support", "com.android.support.constraint", "android.support.design", "android.support.design.R" ]';
            var period = '1000';
            if (toRotate) {
                new PlaceholderTypeAnim(elements[i], JSON.parse(toRotate), period);
            }
        }
    }

    // Registering ServiceWorker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ',    registration.scope);
        }).catch(function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }

})(jQuery);
