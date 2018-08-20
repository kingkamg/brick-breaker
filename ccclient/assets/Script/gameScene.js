import LoginUIAnime from "./LoginUIAnime";
const leaderboardBehaviour = require("./leaderboard");

cc.Class({
    extends: cc.Component,

    properties: {
        loginUI:     {type: LoginUIAnime, default: null},
        gameUINode:  {type: cc.Node, default: null},
        leaderboard: {type: leaderboardBehaviour, default: null},
    },

    onRestartClicked() {
        window.controller.restart();
    },

    onClickedStartGame() {
        this.loginUI.show(false);
        this.gameUINode.active = true;
        window.controller.restart();
    },

    onClickedLeaderboard() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.leaderboard.show();
        }
    },

    onClickedExitGame() {
        this.loginUI.show(true);
        this.gameUINode.active = false;
        window.controller.destroyAllLevels();
        window.controller.player.x = 0;
        window.controller.player.getComponent("player").setLengthz(210)
        window.controller.gameRunning = false;
    }

});
