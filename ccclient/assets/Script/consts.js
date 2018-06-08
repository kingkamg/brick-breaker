window.gameOverStrings = {
    nullNo1: [
        "You have reached a new height.",
        "New highscore."
    ],
    contextedNo1: [
        "You have beaten all your friends.",
        "You are now the new No. 1."
    ],
    contextedOwning: [
        "Your friends can't get even close.",
        "You played way better than your friends."
    ],
    failText: [
        "Another game.",
        "Restart game.",
        "New round."
    ],
    commentGreat: [
        "Marvelous!",
        "Fantastic!",
        "Awesome!",
        "Wonderful!",
        "Great job!"
    ],
    commentGood: [
        "Good job",
        "Good game",
        "Well played",
        "Not bad"
    ],
    commentBad: [
        "Don't worry",
        "Come on",
        "Cheer up",
        "Don't give up"
    ],
    oks: [
        "Okay",
        "OK"
    ]
};

window.getRandomFromArray = function(arr) {
    if (arr.length == 0) {
        return undefined;
    } else {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};