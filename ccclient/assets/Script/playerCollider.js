cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    start () {

    },

    onCollisionEnter(other, self) {
        other.node.getComponent("bullet").freeze();
    }

});
