cc.Class({
    extends: cc.Component,

    properties: {
        hp: 1,
        number: {
            default: null,
            type: cc.Label
        }
    },

    onLoad () {
        this.updateHP();
    },

    updateHP() {
        this.number.string = "" + this.hp;
    },

    takeHit(ball) {
        this.hp -= 1;
        if (this.hp <= 0) {
            this.node.getComponent("brick").kaboom();
        } else {
            this.updateHP();
        }
    }

});
