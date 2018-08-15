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
        let index = Math.floor(this.hp / 4);
        const ratio = (4 - this.hp % 4) / 4.0;
        let target = new cc.color(255, 255, 255);
        if (index >= window.controller.colors.length) {
            index = window.controller.colors.length - 1;
        }
        if (index > 0) {
            target = window.controller.colors[index - 1];
        }
        this.node.color = window.controller.colors[index].lerp(target, ratio);
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
