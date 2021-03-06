cc.Class({
    extends: cc.Component,

    properties: {
        avatarImage: {
            default: null,
            type: cc.Sprite
        },
        score: {
            default: null,
            type: cc.Label
        },
        playerName: {
            default: null,
            type: cc.Label
        },
        rank: {
            default: null,
            type: cc.Label
        },
        rankBack: {
            default: null,
            type: cc.Node
        },
    },

    setValues(name, score, rank, avatar) {
        this.score.string = score + "";
        this.playerName.string = name + "";
        this.rank.string = rank + "";
        if (rank == 1) {
            this.rankBack.color = new cc.color(241, 196, 15);
        } else if (rank == 2) {
            this.rankBack.color = new cc.color(189, 195, 199);
        } else if (rank == 3) {
            this.rankBack.color = new cc.color(211, 84, 0);
        } else {
            this.rankBack.color = new cc.color(44, 62, 80);
        }

        cc.loader.load({url: avatar, type: "png"}, (err, tex) => {
            if (err) {
                console.log("load avatar failed", err);
            } else {
                this.avatarImage.spriteFrame = new cc.SpriteFrame(tex);
            }
        });
    }

});
