cc.Class({
    extends: cc.Component,

    properties: {
        velocity: new cc.Vec2(),
        sticked: false,
        launchTime: -1,
        savedx: 0,
        savedy: 0,
        uselessCollide: 0
    },

    onLoad() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    start() {

    },

    update(dt) {
        if (this.sticked === true) {
            this.node.x = window.controller.player.x;
            this.node.y = window.controller.player.y + 32;
        } else {
            const dx = this.velocity.x * dt;
            const dy = this.velocity.y * dt;
            this.node.x += dx;
            this.node.y += dy;
            if (this.node.y < -670 || this.node.y > 560 || this.node.x < -370 || this.node.x > 370) {
                const index = window.controller.bullets.indexOf(this.node);
                if (index != -1) {
                    window.controller.bullets.splice(index, 1);
                } else {
                    console.warn("bullets not in controller");
                }
                this.node.destroy();
                window.controller.updateAllStickState();
            }
        }
        if (this.launchTime > 0) {
            this.launchTime -= dt;
            if (this.launchTime <= 0) {
                this.sticked = false;
                this.velocity = new cc.Vec2(this.savedx, this.savedy);
                window.controller.updateAllStickState();
            }
        }
    },

    freeze() {
        this.velocity = new cc.Vec2(0, 0);
        this.sticked = true;
        window.controller.updateAllStickState();
    },

    launchIn(x, y, time) {
        this.launchTime = time;
        this.savedx = x;
        this.savedy = y;
    },

    onCollisionEnter(other, self) {
        const sp = self.world.position;
        const ops = other.world.points;
        let normal = new cc.Vec2(0, 1);
        const p0 = new cc.Vec2(ops[0].x + 15, ops[0].y);
        const p1 = new cc.Vec2(ops[1].x + 15, ops[1].y);
        const p2 = new cc.Vec2(ops[2].x - 15, ops[2].y);
        const p3 = new cc.Vec2(ops[3].x - 15, ops[3].y);
        if (other.tag == 0) {
            this.uselessCollide = 0;
        } else if (other.tag == 1) {
            this.uselessCollide += 1;
            if (this.uselessCollide > 7) {
                this.velocity.y += 300;
            }
        }
        if (sp.x < p0.x) {
            if (sp.y < p1.y) {
                // bottom left
                normal = new cc.Vec2(sp.x - p1.x, sp.y - p1.y);
            } else if (sp.y <= p0.y) {
                // left
                normal = new cc.Vec2(-1, 0);
            } else {
                // top left
                normal = new cc.Vec2(sp.x - p0.x, sp.y - p0.y);
            }
        } else if (sp.x <= p3.x) {
            if (sp.y < p1.y) {
                // down
                normal = new cc.Vec2(0, -1);
            } else {
                // up
                normal = new cc.Vec2(0, 1);
            }
        } else {
            if (sp.y < p1.y) {
                // bottom right
                normal = new cc.Vec2(sp.x - p2.x, sp.y - p2.y);
            } else if (sp.y <= p0.y) {
                // right
                normal = new cc.Vec2(1, 0);
            } else {
                // top right
                normal = new cc.Vec2(sp.x - p3.x, sp.y - p3.y);
            }
        }
        normal.normalizeSelf();
        const reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
        this.velocity = reflection;
    }
});
