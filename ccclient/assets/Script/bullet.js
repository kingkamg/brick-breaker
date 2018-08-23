import cfg from "./Constants";
import MathToolkit from "./MathToolkit";

cc.Class({
    extends: cc.Component,

    properties: {
        sound: { type: cc.AudioClip, default: null },
        tik: { type: cc.Node, default: null },
        tok: { type: cc.Node, default: null },
        velocity: new cc.Vec2(),
        sticked: false,
        launchTime: -1,
        savedx: 0,
        savedy: 0,
        uselessCollide: 0
    },

    update(dt) {
        if (this.sticked === true) {
            this.node.x = window.controller.player.x;
            this.node.y = window.controller.player.y + cfg.BULLET_PLAYER_OFFSET;
        }
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
        if (this.launchTime > 0) {
            this.launchTime -= dt;
            if (this.launchTime <= 0) {
                this.sticked = false;
                this.velocity = new cc.Vec2(this.savedx, this.savedy);
                const rigidbody = this.node.getComponent(cc.RigidBody);
                rigidbody.awake = true;
                rigidbody.linearVelocity = this.velocity;
                window.controller.updateAllStickState();
            }
        }
    },

    freeze() {
        this.velocity = new cc.Vec2(0, 0);
        const rigidbody = this.node.getComponent(cc.RigidBody);
        rigidbody.awake = false;
        rigidbody.linearVelocity = this.velocity;
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

    onPostSolve(contact, selfCollider, otherCollider) {
        cc.audioEngine.play(this.sound, false, 1);
        if (otherCollider.tag === 0) {
            otherCollider.node.getComponent("brick").takeHit(this);
        }
        if (otherCollider.tag === 2) {
            this.freeze();
        }
        // tiktok
        if (window.controller.tiktok && otherCollider.tag !== 2) {
            const rigidbody = this.node.getComponent(cc.RigidBody);
            const dir = rigidbody.linearVelocity.clone();
            dir.normalizeSelf().mulSelf(4.5);
            console.log("tiktok?")
            this.tik.x = dir.x;
            this.tik.y = dir.y;
            this.tok.x = -dir.x;
            this.tok.y = -dir.y;
        }
    },

    resetTiktok() {
        this.tik.x = 0;
        this.tik.y = 0;
        this.tok.x = 0;
        this.tok.y = 0;
    },

});
