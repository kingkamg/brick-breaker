cc.Class({
    extends: cc.Component,

    properties: {

    },

    onStartClicked() {
        cc.director.loadScene("game");
    }
});
