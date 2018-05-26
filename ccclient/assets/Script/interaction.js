cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node
        },
        canvas: {
            default: null,
            type: cc.Node
        },
        arrow: {
            default: null,
            type: cc.Node
        },
        bullets: {
            default: [],
            type: [cc.Node]
        },
        allSticked: true,
        touchPressed: false,
        touchLoc: null
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchRelease.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchRelease.bind(this));
        window.controller = this;
    },

    update(dt) {
        if (this.touchPressed === true && this.allSticked === true) {
            this.updateArrow();
        }
    },

    updateArrow() {
        this.arrow.x = this.player.x;
        this.arrow.active = true;

        this.arrowRad = Math.atan2(this.touchLoc.y - 640 - this.arrow.y, this.touchLoc.x - 360 - this.arrow.x);
        let deg = 90 - this.arrowRad / Math.PI * 180.0;
        if ((deg >= -90 && deg < -75) || (deg <= 270 && deg > 255)) {
            deg = -75;
        } else if (deg > 75 && deg < 105) {
            deg = 75
        } else if (deg >= 105 && deg <= 255) {
            deg -= 180;
        }
        this.arrow.rotation = deg;
    },

    onDragged(e) {
        this.touchLoc = e.getLocation();
        if (this.allSticked === false) {
            this.player.getComponent("player").setPosition(e.getDeltaX());
        }
        this.touchPressed = true;
    },

    touchRelease(e) {
        if (this.allSticked === true) {
            const rad = (90 - this.arrow.rotation) / 180.0 * Math.PI;
            const dir = new cc.Vec2(Math.cos(rad) * 800, Math.sin(rad) * 800);
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].getComponent("bullet").launchIn(dir.x, dir.y, (i + 1) * 0.1);
            }
            this.allSticked = false;
            this.arrow.active = false;
        }
        this.touchPressed = false;
    },

    updateAllStickState() {
        let count = 0;
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].getComponent("bullet").sticked === true) {
                count += 1;
            }
        }
        if (count === this.bullets.length) {
            this.allSticked = true;
        }
    }

});
