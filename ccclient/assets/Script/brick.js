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
        window.canvas.addChild(explosion);
        explosion.x = this.node.x;
        explosion.y = this.node.y;
        this.node.destroy();
    },

    onCollisionEnter(other, self) {
        this.node.getComponent(this.brickType).takeHit(other);
    }

});
