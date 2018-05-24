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
        bullets: {
            default: [],
            type: [cc.Node]
        }
    },

    onLoad() {
        this.gameRunning = false;
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            this.player.getComponent("player").setPosition(e.getDeltaX());
        });
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (this.gameRunning == false) {
                this.gameRunning = true;
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchRelease.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchRelease.bind(this));
        window.controller = this;
    },

    touchRelease(e) {
        let count = 0;
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].getComponent("bullet").sticked == true) {
                count += 1;
            }
        }
        if (count === this.bullets.length) {
            const dir = new cc.Vec2(Math.random() * 400 - 200, 800);
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].getComponent("bullet").launchIn(dir.x, dir.y, (i + 1) * 0.1);
            }
        }
    },

    update() {
        for (let i = 0; i < this.bullets.length; i++) {
            const elem = this.bullets[i].getComponent("bullet");
            if (elem.sticked === true) {
                this.bullets[i].x = this.player.x;
                this.bullets[i].y = this.player.y + 32;
            }
        }
    },

    isGameRunning() {
        return this.gameRunning;
    }

});
