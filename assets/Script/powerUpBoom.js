cc.Class({
    extends: cc.Component,

    takeHit(ball) {
        this.node.getComponent("brick").kaboom();
        window.controller.addScore(2);
        window.controller.deleteOneRow();
    }

});
