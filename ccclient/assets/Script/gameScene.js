import LoginUIAnime from "./LoginUIAnime";
import cfg from "./Constants";
import MToggle from "./MToggle";
const leaderboardBehaviour = require("./leaderboard");

cc.Class({
    extends: cc.Component,

    properties: {
        loginUI:     {type: LoginUIAnime, default: null},
        gameUINode:  {type: cc.Node, default: null},
        leaderboard: {type: leaderboardBehaviour, default: null},
        bgm: {type: cc.AudioSource, default: null},
        muteToggle: {type: MToggle, default: null},
    },

    onLoad() {
        this.bgmPlaying = true;
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

    onClickedShare() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.shareAppMessage(window.controller.getRandomShareProfile());
        }
    },

    onClicedMoreGames() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.navigateToMiniProgram({
                appId: "wxe653759d1db46e02",
                extraData: {},
                path: "pages/index/index",
            });
        }
    },

    onClickedExitGame() {
        this.loginUI.show(true);
        this.gameUINode.active = false;
        window.controller.destroyAllLevels();
        window.controller.player.x = 0;
        window.controller.player.active = false;
        window.controller.recycleAllBullets();
        window.controller.gameRunning = false;
    },

    onClickedToggleSound() {
        this.bgm.mute = this.bgmPlaying;
        this.muteToggle.toggle(this.bgmPlaying);
        this.bgmPlaying = !this.bgmPlaying;
    },

});
