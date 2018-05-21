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
        window.canvas = this.canvas;
        window.controller = this;
    },

    isGameRunning() {
        return this.gameRunning;
    }

});
