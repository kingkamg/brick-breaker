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

});
