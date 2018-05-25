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
        allSticked: true
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchRelease.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchRelease.bind(this));
        window.controller = this;
    },

    onDragged(e) {
        if (this.allSticked === true) {
            this.arrow.active = true;
            this.arrow.rotation = 75;
        } else {
            this.player.getComponent("player").setPosition(e.getDeltaX());
        }
    },

    touchRelease(e) {
        if (this.allSticked === true) {
            const dir = new cc.Vec2(Math.random() * 400 - 200, 800);
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].getComponent("bullet").launchIn(dir.x, dir.y, (i + 1) * 0.1);
            }
            this.allSticked = false;
            this.arrow.active = false;
        }
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
