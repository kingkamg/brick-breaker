cc.Class({
    extends: cc.Component,

    properties: {
        bullet: {
            default: null,
            type: cc.Prefab
        }
    },

    takeHit(ball) {
        this.node.getComponent("brick").kaboom();
        
        const newBullet = cc.instantiate(this.bullet);
        window.controller.canvas.addChild(newBullet);
        newBullet.x = this.node.x;
        newBullet.y = this.node.y;
        window.controller.bullets.push(newBullet);
    }

});
