cc.Class({
    extends: cc.Component,

    properties: {
        leaderboardPage: {
            default: null,
            type: cc.Node
        }
    },

    onStartClicked() {
        cc.director.loadScene("game");
    },

    onLeaderboardClicked() {
        this.leaderboardPage.active = true;
    },

    onLeaderboardDismiss() {
        this.leaderboardPage.active = false;
    }
});
