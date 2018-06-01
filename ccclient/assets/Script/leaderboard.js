cc.Class({
    extends: cc.Component,

    properties: {
        boardName: {
            default: null,
            type: cc.Label
        },
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
            console.log(`current context = ${FBInstant.context.getID()}`);
            let leaderboardPromise;
            if (FBInstant.context.getID() == null) {
                // single player playing global leaderboard
                this.boardName.string = "Global Score";
                leaderboardPromise = FBInstant.getLeaderboardAsync("global_highscore");
            } else {
                // playing in a group, context-scoped leaderboard
                this.boardName.string = "Group Score";
                leaderboardPromise = FBInstant.getLeaderboardAsync(`highscore.${FBInstant.context.getID()}`);
            }
            leaderboardPromise.then((leaderboard) => {
                console.log(`get score, getLeaderboardAsync OK`);
                leaderboard.getEntriesAsync(10, 0).then((entries) => {
                    console.log("get score, getEntriesAsync OK", entries);
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
            }, (rejected) => {
                console.log(rejected);
            });
        }
    }

});
