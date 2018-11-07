import LoginUIAnime from "./LoginUIAnime";
import MToggle from "./MToggle";
const leaderboardBehaviour = require("./leaderboard");
const getBannerRectWithHeight = require("./interaction").getBannerRectWithHeight

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
        if (sdk.supportBannerAd()) {
            sdk.showBannerAd("GAME_BANNER", getBannerRectWithHeight(200))
        }
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
        if (sdk.supportBannerAd()) {
          sdk.showBannerAd("HOME_BANNER", getBannerRectWithHeight(200))
        }
    },

    onClickedToggleSound() {
        this.bgm.mute = this.bgmPlaying;
        this.muteToggle.toggle(this.bgmPlaying);
        this.bgmPlaying = !this.bgmPlaying;
    },

});
