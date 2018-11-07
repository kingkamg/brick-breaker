window.gameOverStrings = {
    nullNo1: [
        "你又突破了自己！",
        "新纪录"
    ],
    contextedNo1: [
        "你击败了所有的好友",
        "你现在是新的王者"
    ],
    contextedOwning: [
        "你的好友们完全比不上你",
        "你比你的好友们玩得好多了"
    ],
    failText: [
        "再来一局",
        "重新开始",
        "继续游戏"
    ],
    commentGreat: [
        "强无敌！",
        "太棒了！",
        "厉害了！",
        "精彩！",
        "优秀！"
    ],
    commentGood: [
        "挺好的",
        "打得不错",
        "玩的可以",
        "还行"
    ],
    commentBad: [
        "没事的啦",
        "给点力",
        "加油嘛",
        "别放弃啊"
    ],
    oks: [
        "好",
        "好的"
    ]
};

window.getRandomFromArray = function(arr) {
    if (arr.length == 0) {
        return undefined;
    } else {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};