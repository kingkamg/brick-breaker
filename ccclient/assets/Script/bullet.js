cc.Class({
    extends: cc.Component,

    properties: {
        sound: {
            type: cc.AudioClip,
            default: null
        },
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

    update(dt) {
        if (this.sticked === true) {
            this.node.x = window.controller.player.x;
            this.node.y = window.controller.player.y + 32;
        } else {
            const velo = this.velocity.clone();
            velo.mulSelf(dt);
            // inside test
            const next = new cc.Vec2(this.node.x + velo.x, this.node.y + velo.y);
            for (const brick of window.controller.bricks) {
                if (next.x >= brick.x - brick.width / 2 && next.x <= brick.x + brick.width / 2 && next.y >= brick.y - brick.height / 2 && next.y <= brick.y + brick.height / 2) {
                    const xDiff = Math.abs(next.x - brick.x);
                    const yDiff = Math.abs(next.y - brick.y);
                    const boxes = [];
                    boxes.push(new cc.Vec2(brick.x - xDiff, brick.y + yDiff));
                    boxes.push(new cc.Vec2(brick.x - xDiff, brick.y - yDiff));
                    boxes.push(new cc.Vec2(brick.x + xDiff, brick.y - yDiff));
                    boxes.push(new cc.Vec2(brick.x + xDiff, brick.y + yDiff));
                    this.reflect(new cc.Vec2(this.node.x, this.node.y), boxes);
                }
            }
            this.node.x += this.velocity.x * dt;
            this.node.y += this.velocity.y * dt;
            if (this.node.y < -660 || this.node.y > 660 || this.node.x < -380 || this.node.x > 380) {
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

    reflect(p, box) {
        let normal = new cc.Vec2(0, 1);
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
            } else if (p.y >= box[1].y) {
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
        normal.normalizeSelf();
        const reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
        this.velocity = reflection;

    },

    onCollisionEnter(other, self) {
        cc.audioEngine.play(this.sound, false, 1);
        if (other.tag == 0) {
            this.uselessCollide = 0;
        } else if (other.tag == 1) {
            this.uselessCollide += 1;
            if (this.uselessCollide > 7) {
                this.velocity.y += 300;
            }
        }
        this.reflect(self.world.position, other.world.points);
    },

    onCollisionStay(other, self) {
        const sp = self.world.position;
        const ops = other.world.points;
        if (sp.x > ops[0].x && sp.x < ops[2].x && sp.y > ops[2].y && sp.y < ops[0].y) {
            this.reflect(self.world.position, other.world.points);
        }
    }

});
