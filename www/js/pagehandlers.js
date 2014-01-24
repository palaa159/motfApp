//////////// Page handlers ////////////
$(document).on('scrollstop', function() {
    app.scrPos = $(window).scrollTop();
    misc.log(app.scrPos);
    if (app.currPage == 'Poets') {
        app.pageSilo.p_poets.scrPos = app.scrPos;
    }
});
// WHEN click navbar
$(document).on("pageshow", "[data-role='page']", function() {
    if($(this).jqmData("title") !== 'Poet Detail') {
        $("[data-role='navbar'] a").removeClass("motf-tab-btn-active");
    // if double hit the button
    // scroll to top
    app.currPage = $(this).jqmData("title");
    if (app.currPage !== 'Poets') {
        app.pageSilo.p_poets.hit = 0;
    } else {
    }
    // misc.log(app.currPage);
    // Add active class to app.currPage nav button
    $("[data-role='navbar'] a").each(function(i, v) {
        if ($(this).text() === app.currPage) {
            misc.log($(this).text());
            $(this).addClass('motf-tab-btn-active');
        }
    });
    }
});

// LANDING //
$(document).on('pageshow', '#p_landing', function() {
    // disable nav
    $("[data-role='navbar']").hide();
    misc.log('create >>> fetch');
    misc.centerObj('#fetching');
    // TEST IF CONNECT TO INTERNET
    // Retrieve data from Parse
    parse.init();
    parse.fetchVideo();
    parse.fetchUGC();
});

// OFFLINE ////////////////////////////////////////////////////////////////
$(document).on('pageshow', '#p_offline', function() {
    $("[data-role='navbar']").hide();
    misc.warn('show >>> offline');
    document.addEventListener('online', function() {
        // alert('back to online again');
        $.mobile.navigate('#p_landing');
    }, false);
});

// POETS ////////////////////////////////////////////////////////////////
$(document).on("pageinit", "#p_poets", function() {
    $("[data-role='navbar']").show();
    misc.log('init >>> Poets');
    mapView.deployListView();

    // listener
    $('li.ui-block-a').on('tap', function() {
        if (app.pageSilo.p_poets.scrPos > 0) {
            app.pageSilo.p_poets.hit++;
            if (app.pageSilo.p_poets.hit == 2) {
                misc.warn('scroll top');
                $("html, body").animate({
                    scrollTop: 0
                }, 500);
                app.pageSilo.p_poets.hit = 0;
            }
        }
    });
});
$(document).on('pagebeforeshow', '#p_poets', function() {
    app.pageSilo.p_poets.currPoet = -1;
    // Silent Scroll
    misc.log('pageshow ' + '#p_poets');
    $.mobile.silentScroll(app.pageSilo.p_poets.scrPos);
});

// POET DETAIL ////////////////////////////////////////////////////////////////
$(document).on('pagebeforeshow', '#p_detail', function() {
    app.pageSilo.p_poets.hit = 0;
});
$(document).on('pagehide', '#p_detail', function() {
    misc.log('hide >>> detailView');
    $('#detailNodeTitle').html(' ');
    $('#detailNodeAddress').html(' ');
    $('#detailNodeDesc').html(' ');
    $('#detailSeqNum').html(' ');
    $('#ytplayer').attr('src', '');
    detailMap.map.remove();
});
$(document).on('pageinit', '#p_detail', function() {
    $('#backToBefore').on('tap', function() {
        $.mobile.navigate('#' + app.currPage);
    });
});
$(document).on('pageshow', '#p_detail', function() {
    misc.log('show >>> detailView');
    detailMap.init();
    // for vimeo player
    var iframe = $('#ytplayer')[0];
    var player = $(iframe);
    var url = 'http://www.youtube.com/embed/' + app.videoData[app.currData].url + '?controls=0&rel=0&showinfo=0&modestbranding=1';
    // for ANDROID
    document.addEventListener('backbutton', function(e) {
        detailMap.map.remove();
        // console.log('back');
        // player.api('pause');
        // clear detailview
        $('#ytplayer').attr('src', '');
        // $('#detailNodeVideo').hide();
        $.mobile.changePage('#' + app.currPage);
    });
    console.log('detailview refreshed');
    var WIDTH = '100%';
    $('#detailNodeTitle').html(app.videoData[app.currData].name);
    $('#detailNodeAddress').html(app.videoData[app.currData].address);
    $('#detailNodeVideo').css({
        'width': WIDTH,
        'height': WIDTH * 9 / 16
    });
    if (app.videoData[app.currData].ID < 10) {
        $('#detailSeqNum').html('0' + app.videoData[app.currData].ID);
    } else {
        $('#detailSeqNum').html(app.videoData[app.currData].ID);
    }
    $('#detailNodeDesc').html(app.videoData[app.currData].author);

    if (app.currData == 0) {
        $('#detailNodeMap').css({
            'visibility': 'hidden'
        });
    } else {
        $('#detailNodeMap').css({
            'visibility': 'visible'
        });
    }
    $('#detailNodeMap').css({
        'width': WIDTH
    });
    $('#ytplayer')
        .attr({
            'width': WIDTH,
            'height': WIDTH * 9 / 16,
            'src': url
        });
    $('#detailNodeVideo').show();
});

// MAP ////////////////////////////////////////////////////////////////
$(document).on("pagecreate", "#p_map", function() {
    misc.log('init >>> mapView');
    // misc.centerObj('#locatingBox');
    // mapView.init();
    // mapView.feedVideo();
});