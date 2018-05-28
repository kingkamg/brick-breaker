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
        window.controller.addScore(2);
        
        const newBullet = cc.instantiate(this.bullet);
        window.controller.canvas.addChild(newBullet);
        newBullet.x = this.node.x;
        newBullet.y = this.node.y;
        newBullet.getComponent("bullet").velocity = ball.getComponent("bullet").velocity.clone();
        window.controller.bullets.push(newBullet);
    }

});
