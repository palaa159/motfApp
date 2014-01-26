//////////// System ////////////

var sys = {
    os: null,
    // application Constructor
    init: function() {
        // window.addEventListener('load', function() {
        //     FastClick.attach(document.body);
        // });
        // CHECK SYSTEM
        sys.os = misc.checkSystem();
        if (sys.os == 'web') { // IF WEB, then init web
            app.initWeb();
        } else {
            sys.bindEvents();
        }
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        // FastClick.attach(document.body);
        app.initMobile();
        sys.receivedEvent('geolocation');
    },
    receivedEvent: function(id) {
        // alert(id);
        var onSuccess = function(position) {
            alert('Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n');
        };

        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
        // navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
};

//////////// APP ////////////

var app = {
    w: window.innerWidth,
    h: window.innerHeight,
    scrPos: 0,
    currPage: null,
    currData: null,
    pageSilo: {
        p_poets: {
            scrPos: null,
            hit: 0,
            currPoet: -1
        },
        p_map: {
            currData: null
        }
    },

    currPoet: null,
    videoData: [],
    UGCData: [],
    initWeb: function() {
        misc.warn('WEB DEBUGGING');
        this.initApp();
    },
    initMobile: function() {
        misc.warn('MOBILE DEBUGGING');
        if(sys.os == 'ios7') {
            $('.ui-header-custom').css({
                top: '-1px',
                'padding-top': '18px'
            });
        }
        this.initApp();
    },
    initApp: function() {
        misc.log('App starting');
        this.defaultHandling();
    },
    defaultHandling: function() {
        // handle persistent footer
        $(function() {
            $("[data-role='navbar']").navbar();
        });
    }
};

var listView = {
    deployListView: function() {
        $.each(app.videoData, function(i, v) {
        // misc.log('cloning');
        $('#forClone')
            .clone()
            .attr('id', 'v' + i)
            .appendTo('.ui-listview');
        if (i < 9) {
            $('#v' + i).find('#nodeSeq').html('0' + v.ID);
        } else {
            $('#v' + i).find('#nodeSeq').html(v.ID);
        }
        // replace image
        // console.log(JSON.stringify(v.thumbnail));
        $('#v' + i).css({
            backgroundImage: 'url(img/poetImg/poet_' + i + '.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        });
        $('#v' + i).find('#nodeTitle').html(v.name);
        $('#v' + i).find('#nodeAddress').html(v.address);
        $('#v' + i).find('#nodeAuthor').html(v.author);
        $('#v' + i).on('tap', function(e) {
            // e.preventDefault();
            app.pageSilo.p_poets.currPoet = i;
            app.currData = i;
        });
    });
    // remove for clone
    $('#forClone').remove();
    }
};

//////////// MapView ////////////
var southWest = new L.LatLng(40.791459, -73.858608),
    northEast = new L.LatLng(40.830437, -73.904785),
    bounds = new L.LatLngBounds(southWest, northEast);
var mapView = {
    lat: null,
    lng: null,
    newLatLng: null,
    map: null,
    myPos: null,
    zoom: function(num) {
        mapView.map.setView(app.videoData[num].geoData, 16);
        console.log('zoom to ' + app.videoData[num].geoData);
    },
    init: function() {
        this.map = new L.map('map', {
            center: [40.816911, -73.887223],
            minZoom: 14,
            zoom: 15,
            zoomControl: false
        });
        // set map bound
        this.map.setMaxBounds(bounds);

        // user
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(mapView.map);
        mapView.myPos = new L.circleMarker([0, 0], {
            stroke: false,
            fillColor: '#fb0005',
            fillOpacity: 1,
            radius: 5
        }).bindPopup('This is YOU').addTo(mapView.map);
    },
    detectUserLocation: function() {
        misc.log('### detecting location');
        if (navigator.geolocation) {
            var timeoutVal = 10 * 1000 * 1000;
            navigator.geolocation.watchPosition(
                mapView.mapToPosition,
                alertError, {
                    enableHighAccuracy: true,
                    timeout: timeoutVal,
                    maximumAge: 0
                });
        } else {
            alert("Geolocation is not supported by this browser");
        }

        function alertError(error) {
            var errors = {
                1: 'Permission denied',
                2: 'Position unavailable',
                3: 'Request timeout'
            };
            if(sys.os = 'web') {
                alert('Geolocation error');
            } else {
                navigator.notification.alert('Error: Geolocation not detected',
                function() {
                },
                'Memories of the Future',
                'Dismiss');
            }
        }
    },
    mapToPosition: function(position) {
        mapView.lng = position.coords.longitude;
        mapView.lat = position.coords.latitude;
        mapView.newLatLng = new L.LatLng(mapView.lat, mapView.lng);
        mapView.myPos.setLatLng(mapView.newLatLng);
        // check if myPos is in rect
        if (bounds.contains(mapView.newLatLng)) {
            $('#clientLocate').fadeIn();
        } else {
            $('#clientLocate').fadeOut();
        }
        $('#locatingBox').fadeOut();
        mapView.mapFullOpacity();
        mapView.map.invalidateSize();
    },
    feedVideo: function() {
        misc.log('$$$ feeding >>> VIDEO');
        var nodes = [];
        $.each(app.videoData, function(i, v) {
            var nodeID = v.ID;
            // remove i = 0
            if (i !== 0)
                nodes[i] = L.marker(v.geoData, {
                    // icon: mapView.videoIcon
                })
                    .bindLabel(nodeID.toString(), {
                        noHide: true
                    })
                    .bindPopup('<a onclick="mapView.setCurrDataOnMap(' + i + ');" href="#p_detail">  <div id="chevron"></div>    <div class="contextualView">' + v.author + '<br>' + v.address + '</div></a>')
                    .addTo(mapView.map);
        });
    },
    feedUGC: function() {
        misc.log('$$$ feeding >>> UGC');
        var UGCNode = [];
        $.each(app.UGCData, function(i, v) {
            // d(JSON.stringify(v));
            if (v.approval == true) {
                UGCNode[i] = L.marker([v.lat + 0.001, v.lng], {
                    icon: mapView.UGCIcon
                })
                    .bindPopup('<a onclick="mapView.setCurrUGCData(' + i + ');" href="#p_ugcDetail"><div id="chevron"></div><div class="contextualView">' + v.title + '</div></a>')
                    .addTo(mapView.map);
            }
        });
    },
    setCurrDataOnMap: function(i) {
        app.currData = i;
    },
    setCurrUGCData: function() {

    },
    videoIcon: L.icon({
        iconUrl: 'js/vendor/images/marker-icon-2x.png',
        iconSize: [20, 32], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        iconAnchor: [18, 18], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-6, -15] // point from which the popup should open relative to the iconAnchor

    }),
    UGCIcon: L.icon({
        iconUrl: 'js/vendor/images/ugc-icon-2x.png',
        iconSize: [15, 24], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        // iconAnchor: [12, 55], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [0, -15] // point from which the popup should open relative to the iconAnchor
    }),
    clientLocate: function() {
        mapView.map.setView(mapView.newLatLng, 16);
        $('#locatingBox').fadeOut();
        mapView.mapFullOpacity();
    },
    mapHalfOpacity: function() {
        $('#map').animate({
            'opacity': 0.5
        });
    },
    mapFullOpacity: function() {
        $('#map').animate({
            'opacity': 1
        });
    }
};

//////////// Detail Map ////////////

var detailMap = {
    map: null,
    init: function() {
        this.map = L.map('detailNodeMap', {
            dragging: false,
            touchZoom: false,
            tap: false,
            doubleClickZoom: false,
            center: app.videoData[app.currData].geoData,
            zoomControl: false,
            zoom: 15
        });
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(detailMap.map);
        L.marker(app.videoData[app.currData].geoData)
            .bindLabel(app.videoData[app.currData].ID.toString(), {
                noHide: true
            })
            .addTo(detailMap.map);
        detailMap.map.invalidateSize();
    }
};

// UGC MAPVIEW ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
var UGCMapView = {
    map: null,
    lat: null,
    lng: null,
    init: function() {
        this.map = new L.Map('ugcMap', {
            center: [40.816911, -73.887223],
            minZoom: 14,
            zoom: 15,
            zoomControl: false
        });
        // set map bound
        this.map.setMaxBounds(bounds);
        // user
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(this.map);
        $('#ugcMap').animate({
            opacity: 1
        });
    },
    capture: function() {
        var centerW = $('#ugcMap').width() / 2,
            centerH = $('#ugcMap').height() / 2 - 10;
        this.lat = this.map.containerPointToLatLng([centerW, centerH]).lat;
        this.lng = this.map.containerPointToLatLng([centerW, centerH]).lng;
        misc.warn('@@@ capture >>> ' + this.lat + ', ' + this.lng);
    }
};

//////////// Parse ////////////
var parse = {
    videoObj: Parse.Object.extend('firstPhase'),
    UGCObj: Parse.Object.extend('ugc'),
    video: null,
    UGC: null,

    init: function() {
        Parse.initialize('LcwUW1mhSbxh25gcPfHKFENrbt6YegsB8bxF5VJZ', 'lewWw2HFlo1kk9qnJy1y1OrWfZGVNjSTjAfqRF8e');
        this.video = new this.videoObj();
        this.UGC = new this.UGCObj();
    },
    fetchVideo: function() {
        this.video.fetch({
            success: function(object) {
                app.videoData = misc.sortByKey(object._serverData.results, 'ID');
                $.mobile.navigate('#p_poets');
            },
            error: function(model, error) {
                $.mobile.navigate('#p_offline');
            }
        });
    },
    fetchUGC: function() {
        this.UGC.fetch({
            success: function(object) {
                // d(JSON.stringify(object));
                app.UGCData = null;
                app.UGCData = object._serverData.results;
                misc.log(' after fetchUGC: ' + app.UGCData.length);
                // mapView.feedUGC();
            },
            error: function(model, error) {
                // alert(model + error);
                misc.warn('##########ERROR##########');
                app.UGCData = null;
                $.mobile.navigate('#p_offline');
                // alert('error retrieving data, please restart the app');
            }
        });
    },
    storeUGC: function(lat, lng, title, content) {
        parse.UGC.save({
            lat: lat,
            lng: lng,
            title: title,
            content: content,
            approval: true
        }, {
            success: function(object) {
                if(sys.os == 'web') {
                    alert('success UGC');
                    // fetch new data
                        misc.warn('### begin callback');
                        // fetch UGC
                        app.UGCData.push({
                            lat: lat,
                            lng: lng,
                            title: title,
                            content: ugcContent,
                            approval: true
                        });
                        $.mobile.navigate('#p_map');
                } else {
                    navigator.notification.alert(
                    'Thank you for your contribution',
                    function() {
                        // fetch new data
                        misc.warn('### begin callback');
                        // fetch UGC
                        app.UGCData.push({
                            lat: lat,
                            lng: lng,
                            title: title,
                            content: ugcContent,
                            approval: true
                        });
                        $.mobile.navigate('#p_map');
                    },
                    'Memories of the Future',
                    'OK');
                }
                
            },
            error: function(model, err) {
                navigator.notification.alert(
                    'There is something wrong with the server, Your poem is not stored',
                    function() {
                        $.mobile.navigate('#mapView');
                    },
                    'Memories of the Future',
                    'Dismiss');
            }
        });
    }
};
//////////// Initialize ////////////
sys.init();
//////////// ////////// ////////////