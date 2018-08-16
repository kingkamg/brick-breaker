cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    onCollisionEnter(other, self) {
        const bullet = other.node.getComponent("bullet");
        bullet.reflect(other.world.position, self.world.points)
    }

});
