cc.Class({
    extends: cc.Component,

    properties: {
        loginUINode: {type: cc.Node, default: null},
        gameUINode:  {type: cc.Node, default: null},
    },

    onRestartClicked() {
        window.controller.restart();
    },

    onClickedStartGame() {
        this.loginUINode.active = false;
        this.gameUINode.active = true;
        window.controller.restart();
    },

    onClickedExitGame() {
        this.loginUINode.active = true;
        this.gameUINode.active = false;
        window.controller.destroyAllLevels();
        window.controller.player.x = 0;
        window.controller.player.getComponent("player").setLengthz(210)
        window.controller.gameRunning = false;
    }

});
