var TouchMenuLA = function (options) {
    var self,
        defaults,
		menuClassName = '',
		mask,
		handle,
		menuHammer,
		maskHammer,
		newPos = 0,
		currentPos = 0,
		startPoint = 0,
		countStart = 0,
		velocity = 0.0;

    options.target.classList.add('transition');

    var TouchMenuLA = function () {
        self = this;

        defaults = {
            width: 280,
            zIndex: 99999,
            disableSlide: false,
            handleSize: 20,
            disableMask: false,
            maxMaskOpacity: 0.5
        };

        this.isVisible = false;

        this.initialize();
    };

    TouchMenuLA.prototype.setDefaultsOptions = function () {
        for (var key in defaults) {
            if (!options[key]) {
                options[key] = defaults[key];
            }
        }
    };

    TouchMenuLA.prototype.initElements = function () {
        options.target.style.zIndex = options.zIndex;
        options.target.style.width = options.width + 'px';
        options.target.style.left = -options.width + 'px';

        handle = document.createElement('div');
        handle.className = "tmla-handle";
        handle.style.width = options.handleSize + 'px';
        handle.style.right = -options.handleSize + 'px';

        options.target.appendChild(handle);

        if (!options.disableMask) {
            mask = document.createElement('div');
            mask.className = 'tmla-mask';
            document.body.appendChild(mask);

            maskHammer = new Hammer(mask, null);
        }
    };

    TouchMenuLA.prototype.touchStartMenu = function () {
        menuHammer.on('panstart panmove', function (ev) {
            if (Math.abs(ev.deltaY) <= 70) {
                options.target.classList.remove('transition');
                newPos = currentPos + ev.deltaX;
                self.changeMenuPos();
            }
            velocity = Math.abs(ev.velocity);
        });
    };

    TouchMenuLA.prototype.animateToPosition = function (pos) {

        if (pos) {
            options.target.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
            options.target.style.WebkitTransform = 'translate3d(' + pos + 'px, 0, 0)';
            options.target.style.MozTransform = 'translate3d(' + pos + 'px, 0, 0)';
        } else {
            options.target.style.transform = 'none';
            options.target.style.WebkitTransform = 'none';
            options.target.style.MozTransform = 'none';
        }
    };

    TouchMenuLA.prototype.changeMenuPos = function () {
        if (newPos <= options.width) {
            this.animateToPosition(newPos);

            if (!options.disableMask) {
                this.setMaskOpacity(newPos);
            }
        }
    };

    TouchMenuLA.prototype.setMaskOpacity = function (newMenuPos) {
        var opacity = parseFloat((newMenuPos / options.width) * options.maxMaskOpacity);

        mask.style.opacity = opacity;

        if (opacity === 0) {
            mask.style.zIndex = -1;
        } else {
            mask.style.zIndex = options.zIndex - 1;
        }
    };

    TouchMenuLA.prototype.touchEndMenu = function () {
        menuHammer.on('panend pancancel', function (ev) {
            options.target.classList.add('transition');
            currentPos = ev.deltaX;
            self.checkMenuState(ev.deltaX);
        });
    };

    TouchMenuLA.prototype.eventStartMask = function () {
        maskHammer.on('panstart panmove', function (ev) {
            if (ev.center.x <= options.width && self.isVisible) {
                countStart++;

                if (countStart == 1) {
                    startPoint = ev.deltaX;
                }

                if (ev.deltaX < 0) {
                    newPos = (ev.deltaX - startPoint) + options.width;
                    self.changeMenuPos();
                    velocity = Math.abs(ev.velocity);
                }
            }
        });
    };

    TouchMenuLA.prototype.eventEndMask = function () {
        maskHammer.on('panend pancancel', function (ev) {
            self.checkMenuState(ev.deltaX);
            countStart = 0;
        });
    };

    TouchMenuLA.prototype.clickMaskClose = function () {
        mask.addEventListener('click', function () {
            self.close();
        });
    };

    TouchMenuLA.prototype.checkMenuState = function (deltaX) {
        if (velocity >= 1.0) {
            if (deltaX >= -80) {
                self.open();
            } else {
                self.close();
            }
        } else {
            if (newPos >= 100) {
                self.open();
            } else {
                self.close();
            }
        }
    };

    TouchMenuLA.prototype.open = function () {
        this.animateToPosition(options.width);

        currentPos = options.width;
        this.isVisible = true;

        self.showMask();
        self.invoke(options.onOpen);
    };

    TouchMenuLA.prototype.close = function () {
        this.animateToPosition(0);
        currentPos = 0;
        self.isVisible = false;

        self.hideMask();
        self.invoke(options.onClose);
    };

    TouchMenuLA.prototype.toggle = function () {
        if (self.isVisible) {
            self.close();
        } else {
            self.open();
        }
    };

    TouchMenuLA.prototype.showMask = function () {
        mask.className = "tmla-mask transition";
        mask.style.opacity = options.maxMaskOpacity;
        mask.style.zIndex = options.zIndex - 1;
    };

    TouchMenuLA.prototype.hideMask = function () {
        mask.className = "tmla-mask transition";
        mask.style.opacity = 0;
        mask.style.zIndex = -1;
    };

    TouchMenuLA.prototype.setMenuClassName = function () {
        menuClassName = options.target.className;
    };

    TouchMenuLA.prototype.invoke = function (fn) {
        if (fn) {
            fn.apply(self);
        }
    };

    TouchMenuLA.prototype.initialize = function () {
        if (options.target) {
            menuHammer = Hammer(options.target, null);

            self.setDefaultsOptions();
            self.setMenuClassName();
            self.initElements();

            if (!options.disableSlide) {
                self.touchStartMenu();
                self.touchEndMenu();
                self.eventStartMask();
                self.eventEndMask();
            }

            if (!options.disableMask) {
                self.clickMaskClose();
            }
        } else {
            console.error('TouchMenuLA: The option \'target\' is required.');
        }
    };

    return new TouchMenuLA();
};