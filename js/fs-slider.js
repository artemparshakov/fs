/**
 * Fullscreen slider
 *
 */


var fsSlider = function() {
    this.init.apply( this, arguments );
}


// version
fsSlider.VERSION = '0.1';


// defaults
fsSlider.DEFAULTS = {
    interval: 500,
    pause: 'hover',

    nearby: 2,

    ctaTextCickable: true,
    ctaTextMoreText: 'read more',
    ctaTextLength: 90,

    showPagination: true,
    showThumbs: false,

    // fulscreen options
    fullscreen: true,
    fullscreenSwitcher: '.fs-fullscreen-sw',

    // slides
    slideItemSelector: '.fs-slides__item',
    slidesViewportSelector: '.fs-viewport',

    // nav
    sliderNavPrevSelector: '.fs-nav__prev',
    sliderNavNextSelector: '.fs-nav__next'
}



fsSlider.prototype = {

    init: function( slider, options ) {
        // extend options
        this.options = $.extend( {}, fsSlider.DEFAULTS, options );

        // slider
        this.$slider = $( slider );

        // variable used to indicate if slider is in fullscreen
        this.fullscreen = false;

        // current index
        this.curIndex = 0;

        // loaded images URLs
        this.loaded = [];

        // how many items to preload
        this.nearby = this.options.nearby;

        // cache elements for slider
        this.cacheElements();

        // get slides count
        this.count = this.getCount();


        if ( this.options.showThumbs ) {
            this.$slider.addClass( 'fs--thumbs-active' );
        }


        if ( this.options.showPagination ) {
            this.$slider.addClass( 'fs--pagination-active' );
            // create pagination
            this.makePagination();
        }


        // bind events
        this.bindEvents();

        // load first slide
        this.switchSlide();
    },




    /**
     * Caching elements
     */
    cacheElements: function() {
        // slides
        this.$slides = this.$slider.find( this.options.slideItemSelector );

        // slides viewport
        this.$slidesViewport = this.$slider.find( this.options.slidesViewportSelector );

        // fullscreen switcher
        this.$swFullscreen = this.$slider.find( this.options.fullscreenSwitcher );

        // nav
        this.$sliderNavPrev = this.$slider.find( this.options.sliderNavPrevSelector );
        this.$sliderNavNext = this.$slider.find( this.options.sliderNavNextSelector );
    },




    /**
     * slider events
     */
    bindEvents: function() {
        var that  = this;

        // navigation
        $( this.$sliderNavNext ).on( 'click', $.proxy( this.gotoNext, this ));
        $( this.$sliderNavPrev ).on( 'click', $.proxy( this.gotoPrev, this ));

        // 
        this.$pagination.on( 'click', '.fs-pages__item', function() {
            // $.proxy( this.gotoPrev, this )
            that.curIndex = $( this ).index();

            that.switchSlide( that.curIndex );
        });


        this.$swFullscreen.on( 'click', $.proxy( this.goFullscreen, this ));
    },




    /**
     * Slides count
     */
    getCount: function() {
        return this.$slides.length;
    },




    /**
     * go to next slide
     */
    gotoNext: function( evt ) {
        if ( evt ) evt.preventDefault();
        this.goto( this.curIndex + 1 );
    },


    gotoPrev: function( evt ) {
        if ( evt ) evt.preventDefault();
        this.goto( this.curIndex - 1 );
    },




    /**
     * general go to function
     */
    goto: function( index ) {
        if ( index < 0 || index > this.count - 1 ) return

        this.curIndex = index;

        this.switchSlide( this.curIndex );
    },



    /**
     * create pagination
     *
     */
    makePagination: function() {
        this.$pagination = $( '<ul />', { 'class': 'fs-pages' } );

        for ( var i = 0; i < this.count; i += 1 ) {
            var $paginationItem = $( '<li />', { 'class': 'fs-pages__item', 'data-item-num': i, 'text': i + 1 } );

            this.$pagination.append( $paginationItem );
        }


        // append after viewport
        this.$slidesViewport.after( this.$pagination );

        // make active page
        this.setActivePage();
    },




    setActivePage: function(evt) {
        if ( evt ) evt.preventDefault();

        this.$pagination.find( '.fs-pages__item--active' ).removeClass( 'fs-pages__item--active' );
        this.$pagination.find( '.fs-pages__item' ).eq( this.curIndex ).addClass( 'fs-pages__item--active' );
    },




    /**
     * Loading slide
     */
    switchSlide: function( index ) {
        var src = this.getSlideSrc();


        // check if images are loaded
        if ( $.inArray( src, this.loaded ) === -1 ) {
            this.setImage( src, this.curIndex );
            this.addToLoaded( src );
        }


        // set active slide
        this.setActiveSlide();


        // load nearby items
        this.loadNearby();


        // set active pagintaion item
        if ( this.options.showPagination ) {
            this.setActivePage();
        }
    },




    /**
     * This function needs to figure out data src dependong on screen res
     * TODO: write RWD logic in this function
     */
    getSlideSrc: function( index ) {
        // return this.$slides.find( '.fs-slides__image' ).eq( index ).attr( 'data-src' );
        return this.$slides.eq( this.curIndex ).find( '.fs-slides__image' ).attr( 'data-src' );
    },




    /**
     * check if loaded and push to array
     */
    addToLoaded: function( el ) {
        this.loaded.push( el );
    },




    /**
     * load nearby slides
     */
    loadNearby: function() {
        var count = this.count,
            that = this,
            index = this.curIndex,
            nearby = this.nearby,
            n;


        var loadImages = function( n ) {
            var src;

            if ( (n < that.count) && (n >= 0) ) {
                src = that.$slides.eq( n ).find( 'img' ).attr( 'data-src' );

                // if element is not in array - add to it
                if ( $.inArray( src, that.loaded ) === -1 ) {
                    that.addToLoaded( src );
                    that.setImage( src, n );
                }
            }
        };

        for ( n = (index+1); n <= (index + nearby); n++ ) {
            loadImages( n );
        }


        // load from left
        for ( n = (index-1); n >= (index - nearby); n-- ) {
            loadImages( n );
        }
    },


    setImage: function( src, n ) {
        var that = this,
            image = new Image(),
            index = this.curIndex;

        var onLoad = function( evt ) {
            this.changeImageSrc( src, n );

            console.log( 'loaded', n, src );
        }


        image.src = src;
        $( image ).one( 'load', $.proxy( onLoad, this ));
    },


    changeImageSrc: function( src, index ) {
        this.$slides.eq( index ).find( 'img' ).attr( 'src', src );
    },




    /**
     * Setting active slides
     */
    setActiveSlide: function() {
        this.$slides.removeClass( 'fs-slides__item--active' );
        this.$slides.eq( this.curIndex ).addClass( 'fs-slides__item--active' );
    },




    /**
     * Show images fullscreen
     *
     */
    goFullscreen: function( evt ) {
        if ( !this.fullscreen ) {
            this.$slider.addClass( 'fs--fullscreen' );

            // fullscreen is on
            this.fullscreen = true;

            $( evt.currentTarget )
                .html( 'Quit Fullscreen' );
        }
        else {
            this.$slider.removeClass( 'fs--fullscreen' );

            // fullscreen is off
            this.fullscreen = false;

            $( evt.currentTarget )
                .html( 'View Fullscreen' );
        }
    }

};



+function( $ ) {
    $(function() {
        var sliders = [];

        $( '.fs' ).each(function() {
            sliders.push(new fsSlider( this, {
                ctaTextMoreText: 'Read More...',
                ctaTextLength: 140,
                showThumbs: true,
                showPagination: true,
                interval: 300
            }));
        });
    });
}( jQuery );
