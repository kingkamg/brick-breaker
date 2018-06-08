cc.Class({
    extends: cc.Component,

    properties: {
        hand: {
            default: null,
            type: cc.Node
        },
        text: {
            default: null,
            type: cc.Label
        },
        stage: 0,
        handDir: 1,
        phase2Counter: 0
    },

    update (dt) {
        switch (this.stage) {
            case 1:
            case 2:
                this.hand.x += dt * 200 * this.handDir;
                if (this.hand.x > 200) {
                    this.handDir = -1;
                }
                if (this.hand.x < -200) {
                    this.handDir = 1;
                }
                break;
            default:
                break;
        }
        if (this.phase2Counter > 0) {
            this.phase2Counter -= dt;
            if (this.phase2Counter <= 0) {
                this.phase(0);
            }
        }
    },

    phase(which) {
        this.stage = which;
        switch (this.stage) {
            case 0:
                this.node.active = false;
                break;
            case 1:
                this.node.active = true;
                this.hand.active = true;
                this.hand.y = 0;
                this.text.string = "Aim to shoot";
                break;
            case 2:
                this.node.active = true;
                this.hand.active = false;
                this.text.string = "Catch the balls";
                this.phase2Counter = 4;
                break;
            default:
                break;
        }
    }

});
