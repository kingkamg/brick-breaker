import cfg from "./Constants";

cc.Class({
    extends: cc.Component,

    properties: {
    },

    takeHit(ball) {
        this.node.getComponent("brick").kaboom();
        window.controller.addScore(2);
        
        const newBullet = window.controller.instantiatePrefab(cfg.KEY.BULLET, window.controller.canvas);
        newBullet.x = this.node.x;
        newBullet.y = this.node.y;
        const bulletBehaviour = newBullet.getComponent("bullet");
        bulletBehaviour.velocity = ball.getComponent("bullet").velocity.clone();
        bulletBehaviour.sticked = false;
        window.controller.bullets.push(newBullet);

        // add max balls
        window.controller.maxBalls ++;

        // visual effect + 1
        const visualPlus1 = window.controller.instantiatePrefab(cfg.KEY.PLUS_ONE, window.controller.canvas);
        visualPlus1.x = this.node.x;
        visualPlus1.y = this.node.y + 40;
    }

});
