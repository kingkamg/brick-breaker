cc.Class({
    extends: cc.Component,

    properties: {
        container: {
            default: null,
            type: cc.Node
        },
        scoreEntryPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    show() {
        this.node.active = true;
        if (typeof (FBInstant) != "undefined") {
            FBInstant.getLeaderboardAsync(`highscore.${FBInstant.context.getID()}`).then((leaderboard) => {
                console.log(`leaderboard OK`);
                return leaderboard.getEntriesAsync(10, 0);
            }, (rejected) => {
                console.log(rejected);
            }).then((entries) => {
                console.log(entries);
                for (let i = 0; i < this.container.children.length; i++) {
                    this.container.children[i].destroy();
                }
                this.container.height = 108 * entries.length + 50;
                for (let i = 0; i < entries.length; i++) {
                    const scoreEntry = cc.instantiate(this.scoreEntryPrefab);
                    scoreEntry.getComponent("scoreBehaviour").setValues(entries[i].getPlayer().getName(), entries[i].getScore(), entries[i].getRank());
                    this.container.addChild(scoreEntry);
                    scoreEntry.y = -80 - 108 * i;
                    scoreEntry.x = 0;
                }
            }, (rejected) => {
                console.log(rejected);
            });
        }
    }

});
