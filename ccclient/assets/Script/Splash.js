const config = require("./Constants");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        cc.debug.setDisplayStats(config.TEST);
    },

    start() {
        cc.director.preloadScene("game");
        this.scheduleOnce(() => {
            cc.director.loadScene("game");
        }, config.SPLASH_TIME);
    }

});
