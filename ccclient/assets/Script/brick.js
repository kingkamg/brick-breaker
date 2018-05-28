cc.Class({
    extends: cc.Component,

    properties: {
        boom: {
            default: null,
            type: cc.Prefab
        },
        brickType: "brickNormal"
    },

    onLoad () {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    kaboom() {
        const explosion = cc.instantiate(this.boom);
        explosion.getComponent(cc.ParticleSystem).startColor = this.node.color;
        window.controller.canvas.addChild(explosion);
        explosion.x = this.node.x;
        explosion.y = this.node.y;
        const index = window.controller.bricks.indexOf(this.node);
        if (index != -1) {
            window.controller.bricks.splice(index, 1);
        } else {
            console.warn("Removing inexisting brick");
        }
        this.node.destroy();
    },

    onCollisionEnter(other, self) {
        window.controller.addScore(1);
        this.node.getComponent(this.brickType).takeHit(other);
    }

});
