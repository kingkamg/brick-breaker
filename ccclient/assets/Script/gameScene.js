cc.Class({
    extends: cc.Component,

    properties: {
    },

    onExitClicked() {
        cc.director.loadScene("login");
    },
});
