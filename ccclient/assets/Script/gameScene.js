cc.Class({
    extends: cc.Component,

    properties: {
    },

    onExitClicked() {
        window.controller.updateScore();
        cc.director.loadScene("login");
    },

    onRestartClicked() {
        window.controller.restart();
    }
});
