import sdk from "./sdk/sdk";
import Utils from "./Utils";

module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        boardName:        {type: cc.Label,  default: null},
        container:        {type: cc.Node,   default: null},
        scoreEntryPrefab: {type: cc.Prefab, default: null},
    },

    show() {
        this.node.active = true;
        sdk.fetchFriendOpenData(["score"], (res) => {
            console.log("game received data", res);
            for (let i = 0; i < this.container.children.length; i++) {
                this.container.children[i].destroy();
            }
            this.container.height = 108 * res.length + 50;
            for (let i = 0; i < res.length; i++) {
                const scoreEntry = cc.instantiate(this.scoreEntryPrefab);
                scoreEntry.getComponent("scoreBehaviour").setValues(res[i].nickname, Utils.safeParseObj(res[i].data.score).wxgame.score, i + 1, res[i].avatarUrl);
                this.container.addChild(scoreEntry);
                scoreEntry.y = -1 * (scoreEntry.height * (i + 0.5));
                scoreEntry.x = 0;
            }
        }, (reason) => {
            console.warn(reason);
        }, [
            { key: "score", path: ["wxgame", "score"] }
        ], [
            { key: "score", path: ["wxgame", "score"], asc: false }
        ]);
    },

    dismiss() {
        this.node.active = false;
    }

});
