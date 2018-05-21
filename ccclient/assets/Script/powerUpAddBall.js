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
        window.canvas.addChild(newBullet);
        newBullet.x = this.node.x;
        newBullet.y = this.node.y;
        // const bulletBehaviour = newBullet.getComponent("bullet");
        // bulletBehaviour.velocity = ball.node.getComponent("bullet").velocity.clone();
        // const collider = 
    }

});
