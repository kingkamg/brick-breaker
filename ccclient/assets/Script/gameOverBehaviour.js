cc.Class({
    extends: cc.Component,

    properties: {
        commentText: {
            default: null,
            type: cc.Label
        },
        extendedText: {
            default: null,
            type: cc.Label
        },
        buttonText: {
            default: null,
            type: cc.Label
        },
        trophy: {
            default: null,
            type: cc.Node
        },
        star: {
            default: null,
            type: cc.Node
        }
    },
    
    show(contexted, level) {
        console.log(contexted, level);
        switch (level) {
            case 0:
                this.trophy.active = true;
                this.star.active = false;
                this.commentText.string = window.getRandomFromArray(window.gameOverStrings.commentGreat);
                if (contexted === false) {
                    this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.nullNo1);
                } else {
                    this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.contextedOwning);
                }
                break;
            case 1:
                this.trophy.active = true;
                this.star.active = false;
                this.commentText.string = window.getRandomFromArray(window.gameOverStrings.commentGreat);
                if (contexted === false) {
                    this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.nullNo1);
                } else {
                    this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.contextedNo1);
                }
                break;
            case 2:
                this.trophy.active = false;
                this.star.active = true;
                this.commentText.string = window.getRandomFromArray(window.gameOverStrings.commentGood);
                this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.failText);
                break;
            case 3:
                this.trophy.active = false;
                this.star.active = true;
                this.commentText.string = window.getRandomFromArray(window.gameOverStrings.commentBad);
                this.extendedText.string = window.getRandomFromArray(window.gameOverStrings.failText);
                break;
        
            default:
                break;
        }
        this.buttonText.string = window.getRandomFromArray(window.gameOverStrings.oks);
        this.node.active = true;
    }

});
