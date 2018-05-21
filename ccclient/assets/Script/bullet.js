cc.Class({
    extends: cc.Component,

    properties: {
        velocity: new cc.Vec2()
    },

    onLoad() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    start() {

    },

    update(dt) {
        if (window.controller.isGameRunning()) {
            const dx = this.velocity.x * dt;
            const dy = this.velocity.y * dt;
            this.node.x += dx;
            this.node.y += dy;
        }
    },

    onCollisionEnter(other, self) {
        const sp = self.world.position;
        const ops = other.world.points;
        let normal = new cc.Vec2(0, 1);
        if (sp.x < ops[0].x) {
            if (sp.y < ops[1].y) {
                // bottom left
                normal = new cc.Vec2(sp.x - ops[1].x, sp.y - ops[1].y);
            } else if (sp.y <= ops[0].y) {
                // left
                normal = new cc.Vec2(-1, 0);
            } else {
                // top left
                normal = new cc.Vec2(sp.x - ops[0].x, sp.y - ops[0].y);
            }
        } else if (sp.x <= ops[3].x) {
            if (sp.y < ops[1].y) {
                // down
                normal = new cc.Vec2(0, -1);
            } else {
                // up
                normal = new cc.Vec2(0, 1);
            }
        } else {
            if (sp.y < ops[1].y) {
                // bottom right
                normal = new cc.Vec2(sp.x - ops[2].x, sp.y - ops[2].y);
            } else if (sp.y <= ops[0].y) {
                // right
                normal = new cc.Vec2(1, 0);
            } else {
                // top right
                normal = new cc.Vec2(sp.x - ops[3].x, sp.y - ops[3].y);
            }
        }
        normal.normalizeSelf();
        const reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
        this.velocity = reflection;
    }
});
