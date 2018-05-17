cc.Class({
    extends: cc.Component,

    properties: {
        player: {
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
    },

    isGameRunning() {
        return this.gameRunning;
    }

});
