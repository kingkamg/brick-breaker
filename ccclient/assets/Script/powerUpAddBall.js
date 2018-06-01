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
        const bulletBehaviour = newBullet.getComponent("bullet");
        bulletBehaviour.velocity = ball.getComponent("bullet").velocity.clone();
        bulletBehaviour.sticked = false;
        window.controller.bullets.push(newBullet);
    }

});
    