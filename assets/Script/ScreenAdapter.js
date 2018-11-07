cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        const screen = cc.view.getViewportRect();
        const ratio = screen.width / screen.height;
        if (Math.abs(ratio - 0.5625) > 0.001) {
            if (ratio < 0.5625) {
                this.node.scale = ratio / 0.5625;
            }
        }
    }

});
