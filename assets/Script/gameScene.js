import LoginUIAnime from "./LoginUIAnime";
import MToggle from "./MToggle";
import Utils from "./Utils";
const leaderboardBehaviour = require("./leaderboard");

cc.Class({
    extends: cc.Component,

    properties: {
        loginUI: { type: LoginUIAnime, default: null },
        gameUINode: { type: cc.Node, default: null },
        leaderboard: { type: leaderboardBehaviour, default: null },
        bgm: { type: cc.AudioSource, default: null },
        muteToggle: { type: MToggle, default: null },
        versionLabel: { type: cc.Label, default: null },
        adcdTimer: 0
    },

    onLoad() {
        this.bgmPlaying = true;
        cc.loader.loadRes("version", (err, jsonAsset) => {
            console.log(jsonAsset.json)
            this.versionLabel.string = `v${jsonAsset.json.version}-R${jsonAsset.json.build}`
        });
    },

    update(dt) {
        this.adcdTimer -= dt;
    },

    onRestartClicked() {
        window.controller.restart();
    },

    onClickedStartGame() {
        this.loginUI.show(false);
        this.gameUINode.active = true;
        window.controller.restart();
        if (sdk.supportBannerAd()) {
            Utils.hideBannerAd("HOME_BANNER");
            Utils.showBannerAd("GAME_BANNER");
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
            Utils.hideBannerAd("GAME_BANNER");
            Utils.showBannerAd("HOME_BANNER");
        }
    },

    onClickedToggleSound() {
        this.bgm.mute = this.bgmPlaying;
        this.muteToggle.toggle(this.bgmPlaying);
        this.bgmPlaying = !this.bgmPlaying;
    },

});
