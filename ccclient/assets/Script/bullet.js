import cfg from "./Constants";

cc.Class({
    extends: cc.Component,

    properties: {
        sound: {type: cc.AudioClip, default: null},
        tik:   {type: cc.Node, default: null},
        tok:   {type: cc.Node, default: null},
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

    updateManually(dt) {
        if (this.sticked === true) {
            this.node.x = window.controller.player.x;
            this.node.y = window.controller.player.y + cfg.BULLET_PLAYER_OFFSET;
        } else {
            this.node.x += this.velocity.x * dt;
            this.node.y += this.velocity.y * dt;
            if (this.node.y < -660 || this.node.y > 660 || this.node.x < -380 || this.node.x > 380) {
                const index = window.controller.bullets.indexOf(this.node);
                if (index != -1) {
                    window.controller.bullets.splice(index, 1);
                } else {
                    console.warn("bullets not in controller");
                }
                window.controller.recyclePrefab(cfg.KEY.BULLET, this.node);
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
        this.resetTiktok();
        window.controller.updateAllStickState();
    },

    launchIn(x, y, time) {
        this.launchTime = time;
        this.savedx = x;
        this.savedy = y;
    },

    reflect(p, box) {
        let normal = new cc.Vec2(0, 1);
        if (p.x > box[0].x && p.x < box[2].x && p.y > box[2].y && p.y < box[0].y) {
            const ldis = p.x - box[0].x;
            const rdis = box[2].x - p.x;
            const udis = box[0].y - p.y;
            const ddis = p.y - box[2].y;
            if (ldis < rdis && ldis < udis && ldis < ddis) {
                normal = new cc.Vec2(-1, 0);
            } else if (rdis < ldis && rdis < udis && rdis < ddis) {
                normal = new cc.Vec2(1, 0);
            } else if (udis < ldis && udis < rdis && udis < ddis) {
                normal = new cc.Vec2(0, 1);
            } else {
                normal = new cc.Vec2(0, -1);
            }
        } else {
            if (p.x < box[0].x) {
                if (p.y < box[1].y) {
                    // bottom left
                    normal = new cc.Vec2(p.x - box[1].x, p.y - box[1].y);
                } else if (p.y <= box[0].y) {
                    // left
                    normal = new cc.Vec2(-1, 0);
                } else {
                    // top left
                    normal = new cc.Vec2(p.x - box[0].x, p.y - box[0].y);
                }
            } else if (p.x <= box[3].x) {
                if (p.y <= box[1].y) {
                    // down
                    normal = new cc.Vec2(0, -1);
                } else if (p.y >= box[0].y) {
                    // up
                    normal = new cc.Vec2(0, 1);
                }
            } else {
                if (p.y < box[1].y) {
                    // bottom right
                    normal = new cc.Vec2(p.x - box[2].x, p.y - box[2].y);
                } else if (p.y <= box[0].y) {
                    // right
                    normal = new cc.Vec2(1, 0);
                } else {
                    // top right
                    normal = new cc.Vec2(p.x - box[3].x, p.y - box[3].y);
                }
            }
        }
        normal.normalizeSelf();
        let reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
        if (Math.abs(reflection.y) / Math.abs(reflection.x) < 0.26794919243112270647255365849413) {
            const xSign = reflection.x < 0 ? -1 : 1;
            const ySign = reflection.y < 0 ? -1 : 1;
            reflection = new cc.Vec2(724.44436971680121506230739979667 * xSign, 194.11428382689057176167412821804 * ySign);
        }
        this.velocity = reflection;
    },

    onCollisionEnter(other, self) {
        cc.audioEngine.play(this.sound, false, 1);
        const p = cc.v2(self.node.x, self.node.y);
        const ox = other.node.x;
        const oy = other.node.y;
        const ow = other.node.width;
        const oh = other.node.height;
        const box0 = cc.v2(ox - ow, oy + oh);
        const box1 = cc.v2(ox - ow, oy - oh);
        const box2 = cc.v2(ox + ow, oy - oh);
        const box3 = cc.v2(ox + ow, oy + oh);
        this.reflect(p, [box0, box1, box2, box3]);
        // tiktok
        if (window.controller.tiktok && other.tag !== 99) {
            const dir = this.velocity.clone();
            dir.normalizeSelf().mulSelf(4.5);
            this.tik.x = dir.x;
            this.tik.y = dir.y;
            this.tok.x = -dir.x;
            this.tok.y = -dir.y;
            window.controller.bgAnime.tiktok(8);
        }
    },

    resetTiktok() {
        this.tik.x = 0;
        this.tik.y = 0;
        this.tok.x = 0;
        this.tok.y = 0;
    }

});
