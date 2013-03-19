// Copyright (c) %%year%% by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: %%version%%

(function(window, klass, Util){


    Util.registerNamespace('Code.PhotoSwipe.Toolbar');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.Toolbar.ToolbarClass = klass({



        toolbarEl: null,
        closeEl: null,
        playEl: null,
        previousEl: null,
        nextEl: null,
        captionEl: null,
        captionContentEl: null,
        currentCaption: null,
        descriptionEl: null,
        descriptionContentEl: null,
        currentDescription: null,
        settings: null,
        cache: null,
        timeout: null,
        isVisible: null,
        fadeOutHandler: null,
        touchStartHandler: null,
        touchMoveHandler: null,
        clickHandler: null,



        /*
         * Function: dispose
         */
        dispose: function(){

            var prop;

            this.clearTimeout();

            this.removeEventHandlers();

            Util.Animation.stop(this.toolbarEl);
            Util.Animation.stop(this.captionEl);
            Util.Animation.stop(this.descriptionEl);

            Util.DOM.removeChild(this.toolbarEl, this.toolbarEl.parentNode);
            Util.DOM.removeChild(this.captionEl, this.captionEl.parentNode);
            Util.DOM.removeChild(this.descriptionEl, this.descriptionEl.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
         * Function: initialize
         */
        initialize: function(cache, options){

            var cssClass;

            this.settings = options;
            this.cache = cache;
            this.isVisible = false;

            this.fadeOutHandler = this.onFadeOut.bind(this);
            this.touchStartHandler = this.onTouchStart.bind(this);
            this.touchMoveHandler = this.onTouchMove.bind(this);
            this.clickHandler = this.onClick.bind(this);


            cssClass = PhotoSwipe.Toolbar.CssClasses.toolbar;
            if (this.settings.captionAndToolbarFlipPosition){
                cssClass = cssClass + ' ' + PhotoSwipe.Toolbar.CssClasses.toolbarTop;
            }


            // Toolbar
            this.toolbarEl = Util.DOM.createElement(
                'div',
                {
                    'class': cssClass
                },
                this.settings.getToolbar()
            );


            Util.DOM.setStyle(this.toolbarEl, {
                left: 0,
                position: 'absolute',
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });

            if (this.settings.target === window){
                Util.DOM.appendToBody(this.toolbarEl);
            }
            else{
                Util.DOM.appendChild(this.toolbarEl, this.settings.target);
            }
            Util.DOM.hide(this.toolbarEl);

            this.closeEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.close, this.toolbarEl)[0];
            if (this.settings.preventHide && !Util.isNothing(this.closeEl)){
                Util.DOM.hide(this.closeEl);
            }

            this.playEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.play, this.toolbarEl)[0];
            if (this.settings.preventSlideshow && !Util.isNothing(this.playEl)){
                Util.DOM.hide(this.playEl);
            }

            this.nextEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.next, this.toolbarEl)[0];
            this.previousEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.previous, this.toolbarEl)[0];


            // Caption
            cssClass = PhotoSwipe.Toolbar.CssClasses.caption;
            if (this.settings.captionAndToolbarFlipPosition){
                cssClass = cssClass + ' ' + PhotoSwipe.Toolbar.CssClasses.captionBottom;
            }

            this.captionEl = Util.DOM.createElement(
                'div',
                {
                    'class': cssClass
                },
                ''
            );
            Util.DOM.setStyle(this.captionEl, {
                left: 0,
                position: 'absolute',
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });

            if (this.settings.target === window){
                Util.DOM.appendToBody(this.captionEl);
            }
            else{
                Util.DOM.appendChild(this.captionEl, this.settings.target);
            }
            Util.DOM.hide(this.captionEl);

            this.captionContentEl = Util.DOM.createElement(
                'div',
                {
                    'class': PhotoSwipe.Toolbar.CssClasses.captionContent
                },
                ''
            );
            Util.DOM.appendChild(this.captionContentEl, this.captionEl);


            // Description
            cssClass = PhotoSwipe.Toolbar.CssClasses.description;

            this.descriptionEl = Util.DOM.createElement(
                'div',
                {
                    'class': cssClass
                },
                ''
            );
            Util.DOM.setStyle(this.descriptionEl, {
                left: 0,
                position: 'absolute',
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });

            if (this.settings.target === window){
                Util.DOM.appendToBody(this.descriptionEl);
            }
            else{
                Util.DOM.appendChild(this.descriptionEl, this.settings.target);
            }
            Util.DOM.hide(this.descriptionEl);

            this.descriptionContentEl = Util.DOM.createElement(
                'div',
                {
                    'class': PhotoSwipe.Toolbar.CssClasses.descriptionContent
                },
                ''
            );
            Util.DOM.appendChild(this.descriptionContentEl, this.descriptionEl);

            this.addEventHandlers();

        },



        /*
         * Function: resetPosition
         */
        resetPosition: function(){

            var width, toolbarTop, captionTop, descriptionTop;

            if (this.settings.target === window){
                if (this.settings.captionAndToolbarFlipPosition){
                    toolbarTop = Util.DOM.windowScrollTop();
                    descriptionTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.descriptionEl);
                    captionTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.descriptionEl) - Util.DOM.height(this.captionEl);
                }
                else {
                    toolbarTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.toolbarEl);
                    descriptionTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.descriptionEl) - Util.DOM.height(this.toolbarEl);
                    captionTop = Util.DOM.windowScrollTop();
                }
                width = Util.DOM.windowWidth();
            }
            else{
                if (this.settings.captionAndToolbarFlipPosition){
                    toolbarTop = '0';
                    descriptionTop = Util.DOM.height(this.settings.target) - Util.DOM.height(this.captionEl);
                    captionTop = Util.DOM.height(this.settings.target) - Util.DOM.height(this.captionEl) - Util.DOM.height(this.descriptionEl);
                }
                else{
                    toolbarTop = Util.DOM.height(this.settings.target) - Util.DOM.height(this.toolbarEl);
                    descriptionTop = Util.DOM.height(this.settings.target) - Util.DOM.height(this.toolbarEl) - Util.DOM.height(this.descriptionTop);
                    captionTop = 0;
                }
                width = Util.DOM.width(this.settings.target);
            }

            Util.DOM.setStyle(this.toolbarEl, {
                top: toolbarTop + 'px',
                width: width
            });

            Util.DOM.setStyle(this.captionEl, {
                top: captionTop + 'px',
                width: width
            });

            Util.DOM.setStyle(this.descriptionEl, {
                top: descriptionTop + 'px',
                width: width
            });
        },



        /*
         * Function: toggleVisibility
         */
        toggleVisibility: function(index){

            if (this.isVisible){
                this.fadeOut();
            }
            else{
                this.show(index);
            }

        },



        /*
         * Function: show
         */
        show: function(index){

            Util.Animation.stop(this.toolbarEl);
            Util.Animation.stop(this.captionEl);
            Util.Animation.stop(this.descriptionEl);

            this.resetPosition();
            this.setToolbarStatus(index);

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onBeforeShow,
                target: this
            });

            this.showToolbar();
            this.setCaption(index);
            this.showCaption();
            this.setDescription(index);
            this.showDescription();

            this.isVisible = true;

            this.setTimeout();

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onShow,
                target: this
            });

        },



        /*
         * Function: setTimeout
         */
        setTimeout: function(){

            if (this.settings.captionAndToolbarAutoHideDelay > 0){
                // Set a timeout to hide the toolbar
                this.clearTimeout();
                this.timeout = window.setTimeout(this.fadeOut.bind(this), this.settings.captionAndToolbarAutoHideDelay);
            }

        },



        /*
         * Function: clearTimeout
         */
        clearTimeout: function(){

            if (!Util.isNothing(this.timeout)){
                window.clearTimeout(this.timeout);
                this.timeout = null;
            }

        },



        /*
         * Function: fadeOut
         */
        fadeOut: function(){

            this.clearTimeout();

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onBeforeHide,
                target: this
            });

            Util.Animation.fadeOut(this.toolbarEl, this.settings.fadeOutSpeed);
            Util.Animation.fadeOut(this.captionEl, this.settings.fadeOutSpeed, this.fadeOutHandler);
            Util.Animation.fadeOut(this.descriptionEl, this.settings.fadeOutSpeed);

            this.isVisible = false;

        },



        /*
         * Function: addEventHandlers
         */
        addEventHandlers: function(){

            if (Util.Browser.isTouchSupported){
                if (!Util.Browser.blackberry){
                    // Had an issue with touchstart, animation and Blackberry. BB will default to click
                    Util.Events.add(this.toolbarEl, 'touchstart', this.touchStartHandler);
                }
                Util.Events.add(this.toolbarEl, 'touchmove', this.touchMoveHandler);
                Util.Events.add(this.captionEl, 'touchmove', this.touchMoveHandler);
                Util.Events.add(this.descriptionEl, 'touchmove', this.touchMoveHandler);
            }
            Util.Events.add(this.toolbarEl, 'click', this.clickHandler);

        },



        /*
         * Function: removeEventHandlers
         */
        removeEventHandlers: function(){

            if (Util.Browser.isTouchSupported){
                if (!Util.Browser.blackberry){
                    // Had an issue with touchstart, animation and Blackberry. BB will default to click
                    Util.Events.remove(this.toolbarEl, 'touchstart', this.touchStartHandler);
                }
                Util.Events.remove(this.toolbarEl, 'touchmove', this.touchMoveHandler);
                Util.Events.remove(this.captionEl, 'touchmove', this.touchMoveHandler);
                Util.Events.remove(this.descriptionEl, 'touchmove', this.touchMoveHandler);
            }
            Util.Events.remove(this.toolbarEl, 'click', this.clickHandler);

        },



        /*
         * Function: handleTap
         */
        handleTap: function(e){

            this.clearTimeout();

            var action;

            if (e.target === this.nextEl || Util.DOM.isChildOf(e.target, this.nextEl)){
                action = PhotoSwipe.Toolbar.ToolbarAction.next;
            }
            else if (e.target === this.previousEl || Util.DOM.isChildOf(e.target, this.previousEl)){
                action = PhotoSwipe.Toolbar.ToolbarAction.previous;
            }
            else if (e.target === this.closeEl || Util.DOM.isChildOf(e.target, this.closeEl)){
                action = PhotoSwipe.Toolbar.ToolbarAction.close;
            }
            else if (e.target === this.playEl || Util.DOM.isChildOf(e.target, this.playEl)){
                action = PhotoSwipe.Toolbar.ToolbarAction.play;
            }

            this.setTimeout();

            if (Util.isNothing(action)){
                action = PhotoSwipe.Toolbar.ToolbarAction.none;
            }

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onTap,
                target: this,
                action: action,
                tapTarget: e.target
            });

        },



        /*
         * Function: setCaption
         */
        setCaption: function(index){

            Util.DOM.removeChildren(this.captionContentEl);

            this.currentCaption = Util.coalesce(this.cache.images[index].caption, '\u00A0');

            if (Util.isObject(this.currentCaption)){
                Util.DOM.appendChild(this.currentCaption, this.captionContentEl);
            }
            else{
                if (this.currentCaption === ''){
                    this.currentCaption = '\u00A0';
                }
                Util.DOM.appendText(this.currentCaption, this.captionContentEl);
            }

            this.currentCaption = (this.currentCaption === '\u00A0') ? '' : this.currentCaption;
            this.resetPosition();

        },

        /*
         * Function: setDescription
         */
        setDescription: function(index){

            Util.DOM.removeChildren(this.descriptionContentEl);

            this.currentDescription = Util.coalesce(this.cache.images[index].description, '\u00A0');

            if (Util.isObject(this.currentDescription)){
                Util.DOM.appendChild(this.currentDescription, this.descriptionContentEl);
            }
            else{
                if (this.currentDescription === ''){
                    this.currentDescription = '\u00A0';
                }
                Util.DOM.appendText(this.currentDescription, this.descriptionContentEl);
            }

            this.currentDescription = (this.currentDescription === '\u00A0') ? '' : this.currentDescription;
            this.resetPosition();

        },



        /*
         * Function: showToolbar
         */
        showToolbar: function(){

            Util.DOM.setStyle(this.toolbarEl, {
                opacity: this.settings.captionAndToolbarOpacity
            });
            Util.DOM.show(this.toolbarEl);

        },



        /*
         * Function: showCaption
         */
        showCaption: function(){

            if (this.currentCaption === '' || this.captionContentEl.childNodes.length < 1){
                // Empty caption
                if (!this.settings.captionAndToolbarShowEmptyCaptions){
                    Util.DOM.hide(this.captionEl);
                    return;
                }
            }
            Util.DOM.setStyle(this.captionEl, {
                opacity: this.settings.captionAndToolbarOpacity
            });
            Util.DOM.show(this.captionEl);

        },



        /*
         * Function: showCaption
         */
        showDescription: function(){

            if (this.currentDescription === '' || this.descriptionContentEl.childNodes.length < 1){
                // Empty caption
                if (!this.settings.captionAndToolbarShowEmptyCaptions){
                 Util.DOM.hide(this.descriptionEl);
                 return;
                }
            }
            Util.DOM.setStyle(this.descriptionEl, {
                opacity: this.settings.captionAndToolbarOpacity
            });
            Util.DOM.show(this.descriptionEl);

        },



        /*
         * Function: setToolbarStatus
         */
        setToolbarStatus: function(index){

            if (this.settings.loop){
                return;
            }

            Util.DOM.removeClass(this.previousEl, PhotoSwipe.Toolbar.CssClasses.previousDisabled);
            Util.DOM.removeClass(this.nextEl, PhotoSwipe.Toolbar.CssClasses.nextDisabled);
            Util.DOM.removeClass(this.playEl, PhotoSwipe.Toolbar.CssClasses.playDisabled);

            if (index > 0 && index < this.cache.images.length-1){
                return;
            }

            if (index === 0 && index === this.cache.images.length-1){
                if (!Util.isNothing(this.playEl)){
                    Util.DOM.addClass(this.playEl, PhotoSwipe.Toolbar.CssClasses.playDisabled);
                }
            }

            if (index === 0){
                if (!Util.isNothing(this.previousEl)){
                    Util.DOM.addClass(this.previousEl, PhotoSwipe.Toolbar.CssClasses.previousDisabled);
                }
            }

            if (index === this.cache.images.length-1){
                if (!Util.isNothing(this.nextEl)){
                    Util.DOM.addClass(this.nextEl, PhotoSwipe.Toolbar.CssClasses.nextDisabled);
                }
            }

        },



        /*
         * Function: onFadeOut
         */
        onFadeOut: function(){

            Util.DOM.hide(this.toolbarEl);
            Util.DOM.hide(this.captionEl);
            Util.DOM.hide(this.descriptionEl);

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onHide,
                target: this
            });

        },



        /*
         * Function: onTouchStart
         */
        onTouchStart: function(e){

            e.preventDefault();
            Util.Events.remove(this.toolbarEl, 'click', this.clickHandler);
            this.handleTap(e);

        },



        /*
         * Function: onTouchMove
         */
        onTouchMove: function(e){

            e.preventDefault();

        },



        /*
         * Function: onClick
         */
        onClick: function(e){

            e.preventDefault();
            this.handleTap(e);

        }


    });



}
(
    window,
    window.klass,
    window.Code.Util
));