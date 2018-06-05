cc.Class({
    extends: cc.Component,

    properties: {
        life: 1.0,
        speed: 200
    },

    start () {
        this.originalLife = this.life;
    },

    update (dt) {
        this.node.y += this.speed * dt;
        this.life -= dt;
        this.node.opacity = 255 * this.life / this.originalLife;
        if (this.life <= 0) {
            this.node.destroy();
        }
    },
});
