cc.Class({
    extends: cc.Component,

    properties: {
        bullet: {
            default: null,
            type: cc.Prefab
        },
        plusOne: {
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

        // visual effect + 1
        const visualPlus1 = cc.instantiate(this.plusOne);
        window.controller.canvas.addChild(visualPlus1);
        visualPlus1.x = this.node.x;
        visualPlus1.y = this.node.y + 40;
    }

});
