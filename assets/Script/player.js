import cfg from "./Constants";

cc.Class({
    extends: cc.Component,

    properties: {
        lengthz: 210,
        left: {
            default: null,
            type: cc.Node
        },
        center: {
            default: null,
            type: cc.Node
        },
        right: {
            default: null,
            type: cc.Node
        },
        number: {
            default: null,
            type: cc.Label
        },
    },

    enlarge() {
        this.setLengthz(this.lengthz + cfg.PLAYER_LENGTH_STEP);
    },

    updateNumber(val) {
        this.number.string = "" + val;
    },

    setLengthz(val) {
        if (val < 90) {
            val = 90;
        }
        if (val > cfg.PLAYER_LENGTH_MAX) {
            val = cfg.PLAYER_LENGTH_MAX;
        }
        this.lengthz = val;
        this.left.x = (this.lengthz - 30) * -0.5;
        this.right.x = (this.lengthz - 30) * 0.5;
        this.center.width = this.lengthz - 30;
        this.node.getComponent(cc.BoxCollider).size.width = this.lengthz;
    },

    setPosition(deltaX) {
        let target = this.node.x + deltaX;
        if (target < -360 + this.lengthz / 2) {
            target = -360 + this.lengthz / 2;
        }
        if (target > 360 - this.lengthz / 2) {
            target = 360 - this.lengthz / 2;
        }
        this.node.x = target;
    }

});
