module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        boardName:        {type: cc.Label,  default: null},
        container:        {type: cc.Node,   default: null},
        scoreEntryPrefab: {type: cc.Prefab, default: null},
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
                        scoreEntry.getComponent("scoreBehaviour").setValues(entries[i].getPlayer().getName(), entries[i].getScore(), entries[i].getRank(), entries[i].getPlayer().getPhoto());
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
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            window.controller.getLeaderboardData().then((data) => {
                console.log("game received data");
                console.log(data);
                for (let i = 0; i < this.container.children.length; i++) {
                    this.container.children[i].destroy();
                }
                this.container.height = 108 * data.length + 50;

                const entries = [];
                for (const elem of data) {
                    entries.push({
                        name: elem.nickname,
                        score: parseInt(JSON.parse(elem.KVDataList[0].value).wxgame.score, 10),
                        avatar: elem.avatarUrl,
                    });
                }
                entries.sort((a, b) => {
                    if (a.score > b.score) {
                        return -1;
                    } else if (a.score < b.score) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                for (let i = 0; i < entries.length; i++) {
                    const scoreEntry = cc.instantiate(this.scoreEntryPrefab);
                    scoreEntry.getComponent("scoreBehaviour").setValues(entries[i].name, entries[i].score, i + 1, entries[i].avatar);
                    this.container.addChild(scoreEntry);
                    scoreEntry.y = -1 * (scoreEntry.height * (i + 0.5));
                    scoreEntry.x = 0;
                }
            }).catch((reason) => {
                console.log(">>>>>> promise rejected " + reason)
            });
        }
    },

    dismiss() {
        this.node.active = false;
    }

});
