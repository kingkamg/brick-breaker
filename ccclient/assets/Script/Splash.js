import cfg from "./Constants";

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        cc.debug.setDisplayStats(cfg.TEST);
    },

    start() {
        cc.director.preloadScene("game");
        this.scheduleOnce(() => {
            cc.director.loadScene("game");
        }, cfg.SPLASH_TIME);
    }

});
