import cfg from "./Constants";
import MathToolkit, { IInterRes } from "./MathToolkit";
const { gm } = require("./interaction");

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    @property(cc.AudioClip) public sound: cc.AudioClip = null;
    @property(cc.Node) public tik: cc.Node = null;
    @property(cc.Node) public tok: cc.Node = null;

    private velocity: cc.Vec2 = new cc.Vec2(0, 0);
    private sticked: boolean = false;
    private launchTime: number = -1;
    private savedx: number = 0;
    private savedy: number = 0;
    private hitThisFrame: cc.Node[] = [];
    private prevPos: cc.Vec2 = null;

    public freeze() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.sticked = true;
        this.resetTiktok();
        gm().updateAllStickState();
    }

    public launchIn(x: number, y: number, time: number) {
        this.launchTime = time;
        this.savedx = x;
        this.savedy = y;
    }

    public updateManually(dt: number) {
        this.hitThisFrame.length = 0;
        if (this.sticked === true) {
            this.node.x = gm().player.x;
            this.node.y = gm().player.y + cfg.BULLET_PLAYER_OFFSET;
        } else if (this.node.y < -660 || this.node.y > 660 || this.node.x < -380 || this.node.x > 380) {
            const index = gm().bullets.indexOf(this);
            if (index !== -1) {
                gm().bullets.splice(index, 1);
            } else {
                console.warn("bullets not in controller");
            }
            gm().recyclePrefab(cfg.KEY.BULLET, this.node);
            gm().updateAllStickState();
        } else {
            this.prevPos = cc.v2(this.node.x, this.node.y);
            const endPos: cc.Vec2 = cc.v2(this.node.x + this.velocity.x * dt, this.node.y + this.velocity.y * dt);
            this.node.position = endPos;
            // this.collisionCheck(startPos, endPos);
        }
        if (this.launchTime > 0) {
            this.launchTime -= dt;
            if (this.launchTime <= 0) {
                this.sticked = false;
                this.velocity.x = this.savedx;
                this.velocity.y = this.savedy;
                gm().updateAllStickState();
            }
        }
    }

    protected onLoad() {
        const manager: cc.CollisionManager = cc.director.getCollisionManager();
        manager.enabled = true;
    }

    protected lateUpdate() {
        let normal: cc.Vec2 = null;
        if (this.hitThisFrame.length > 3) {
            console.error("overlap with more than 3 objects");
        } else if (this.hitThisFrame.length === 1) {
            if (this.hitThisFrame[0].getComponent(cc.BoxCollider).tag === 99) {
                this.freeze();
                return;
            }
            const ps: cc.Vec2[] = [];
            const cx: number = this.hitThisFrame[0].x;
            const cy: number = this.hitThisFrame[0].y;
            const cw: number = this.hitThisFrame[0].width * 0.5;
            const ch: number = this.hitThisFrame[0].height * 0.5;
            ps.push(cc.v2(cx - cw, cy + ch));
            ps.push(cc.v2(cx - cw, cy - ch));
            ps.push(cc.v2(cx + cw, cy - ch));
            ps.push(cc.v2(cx + cw, cy + ch));
            if (this.prevPos.x < ps[0].x) {
                if (this.prevPos.y < ps[1].y) {
                    // bottom left
                    normal = cc.v2(-cfg.C_SQRT_2, -cfg.C_SQRT_2);
                } else if (this.prevPos.y <= ps[0].y) {
                    // left
                    normal = cc.v2(-1, 0);
                } else {
                    // top left
                    normal = cc.v2(-cfg.C_SQRT_2 , cfg.C_SQRT_2);
                }
            } else if (this.prevPos.x <= ps[3].x) {
                if (this.prevPos.y <= ps[1].y) {
                    // down
                    normal = cc.v2(0, -1);
                } else if (this.prevPos.y >= ps[0].y) {
                    // up
                    normal = cc.v2(0, 1);
                } else {
                    console.error("fucking prev not trigger???");
                }
            } else {
                if (this.prevPos.y < ps[1].y) {
                    // bottom right
                    normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
                } else if (this.prevPos.y <= ps[0].y) {
                    // right
                    normal = cc.v2(1, 0);
                } else {
                    // top right
                    normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
                }
            }
            const brickBehaviour = this.hitThisFrame[0].getComponent("brick");
            if (brickBehaviour !== null) {
                brickBehaviour.takeHit(this);
            }
        } else if (this.hitThisFrame.length === 2) {
            const col0: cc.BoxCollider = this.hitThisFrame[0].getComponent(cc.BoxCollider);
            const col1: cc.BoxCollider = this.hitThisFrame[1].getComponent(cc.BoxCollider);
            if (col0.tag === 11 && col1.tag === 11) {
                if (this.hitThisFrame[0].x < -200 || this.hitThisFrame[1].x < -200) {
                    normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
                } else {
                    normal = cc.v2(-cfg.C_SQRT_2, -cfg.C_SQRT_2);
                }
            } else if (col0.tag === 11 || col1.tag === 11) {
                if ((this.node.x > this.prevPos.x) === (this.node.y > this.prevPos.y)) {
                    normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
                } else {
                    normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
                }
                if (col0.tag === 11) {
                    this.hitThisFrame[1].getComponent("brick").takeHit(this);
                } else {
                    this.hitThisFrame[0].getComponent("brick").takeHit(this);
                }
            } else {
                if (MathToolkit.almostEqual(this.hitThisFrame[0].x, this.hitThisFrame[1].x, 5)) {
                    normal = cc.v2(1, 0);
                } else if (MathToolkit.almostEqual(this.hitThisFrame[0].y, this.hitThisFrame[1].y, 5)) {
                    normal = cc.v2(0, 1);
                } else {
                    if ((this.hitThisFrame[0].x > this.hitThisFrame[1].x) === (this.hitThisFrame[0].y > this.hitThisFrame[1].y)) {
                        normal = cc.v2(-cfg.C_SQRT_2, cfg.C_SQRT_2);
                    } else {
                        normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
                    }
                }
                this.hitThisFrame[0].getComponent("brick").takeHit(this);
                this.hitThisFrame[1].getComponent("brick").takeHit(this);
            }
        } else if (this.hitThisFrame.length === 3) {
            if ((this.node.x > this.prevPos.x) === (this.node.y > this.prevPos.y)) {
                normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
            } else {
                normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
            }
            let brickBehav = this.hitThisFrame[0].getComponent("brick");
            if (brickBehav !== null) { brickBehav.takeHit(this); }
            brickBehav = this.hitThisFrame[1].getComponent("brick");
            if (brickBehav !== null) { brickBehav.takeHit(this); }
            brickBehav = this.hitThisFrame[2].getComponent("brick");
            if (brickBehav !== null) { brickBehav.takeHit(this); }
        }
        if (normal !== null) {
            const speed: number = cfg.BULLET_SPEED + gm().currentLevel * cfg.BULLET_SPEED_INC;
            let reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
            const tan = Math.abs(reflection.y) / Math.abs(reflection.x);
            if (tan < cfg.C_TAN_15) {
                const xSign = reflection.x < 0 ? -1 : 1;
                const ySign = reflection.y < 0 ? -1 : 1;
                reflection = new cc.Vec2(cfg.C_COS_15 * speed * xSign, cfg.C_SIN_15 * speed * ySign);
            } else if (tan > cfg.C_TAN_89) {
                const xSign = reflection.x < 0 ? -1 : 1;
                const ySign = reflection.y < 0 ? -1 : 1;
                reflection = new cc.Vec2(cfg.C_COS_89 * speed * xSign, cfg.C_SIN_89 * speed * ySign);
            }
            this.velocity = reflection;
        }
    }

    private resetTiktok() {
        this.tik.x = 0;
        this.tik.y = 0;
        this.tok.x = 0;
        this.tok.y = 0;
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        this.hitThisFrame.push(other.node);
    }

    private collisionCheck(startPos: cc.Vec2, endPos: cc.Vec2) {
        const overlaps: cc.Node[] = [];
        const playerNode: cc.Node = gm().player;
        if (MathToolkit.circleOverlapRect({x: endPos.x, y: endPos.y, r: cfg.BULLET_RADIUS}, {x: playerNode.x, y: playerNode.y, w: playerNode.width, h: playerNode.height})) {
            this.freeze();
            return;
        }
        for (const elem of gm().bricks) {
            if (!MathToolkit.circleOverlapRect({x: endPos.x, y: endPos.y, r: cfg.BULLET_RADIUS}, {x: elem.x, y: elem.y, w: elem.width, h: elem.height})) {
                continue;
            }
            overlaps.push(elem);
        }
        for (const elem of gm().walls) {
            if (!MathToolkit.circleOverlapRect({x: endPos.x, y: endPos.y, r: cfg.BULLET_RADIUS}, {x: elem.x, y: elem.y, w: elem.width, h: elem.height})) {
                continue;
            }
            overlaps.push(elem);
        }
        let normal: cc.Vec2 = null;
        if (overlaps.length > 3) {
            console.error("overlap with more than 3 objects");
        } else if (overlaps.length === 1) {
            const ps: cc.Vec2[] = [];
            const cx: number = overlaps[0].x;
            const cy: number = overlaps[0].y;
            const cw: number = overlaps[0].width * 0.5;
            const ch: number = overlaps[0].height * 0.5;
            ps.push(cc.v2(cx - cw, cy + ch));
            ps.push(cc.v2(cx - cw, cy - ch));
            ps.push(cc.v2(cx + cw, cy - ch));
            ps.push(cc.v2(cx + cw, cy + ch));
            let shortest: number = Infinity;
            let side: number = 0;
            for (let i = 0; i < ps.length; i++) {
                let ni: number = i + 1;
                if (ni > 3) { ni = 0; }
                const inter: IInterRes = MathToolkit.lineSegsIntersection(startPos, endPos, ps[i], ps[ni]);
                if (inter !== null) {
                    if (inter.tV < shortest) {
                        shortest = inter.tV;
                        side = i;
                    }
                }
            }
            if (shortest !== Infinity) {
                if (side === 0) {
                    normal = cc.v2(-1, 0);
                } else if (side === 1) {
                    normal = cc.v2(0, -1);
                } else if (side === 2) {
                    normal = cc.v2(1, 0);
                } else if (side === 3) {
                    normal = cc.v2(0, 1);
                }
                if (overlaps[0].group === "bricks") {
                    overlaps[0].getComponent("brick").takeHit(this);
                }
            } else {
                console.warn("overlap but center ray not intersect, ignore");
            }
        } else if (overlaps.length === 2) {
            if (overlaps[0].group === "wall" && overlaps[1].group === "wall") {
                if (overlaps[0].x < -200 || overlaps[1].x < -200) {
                    normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
                } else {
                    normal = cc.v2(-cfg.C_SQRT_2, -cfg.C_SQRT_2);
                }
            } else if (overlaps[0].group === "wall" || overlaps[1].group === "wall") {
                if ((endPos.x > startPos.x) === (endPos.y > startPos.y)) {
                    normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
                } else {
                    normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
                }
                if (overlaps[0].group === "wall") {
                    overlaps[1].getComponent("brick").takeHit(this);
                } else {
                    overlaps[0].getComponent("brick").takeHit(this);
                }
            } else {
                if (MathToolkit.almostEqual(overlaps[0].x, overlaps[1].x, 5)) {
                    normal = cc.v2(0, 1);
                } else if (MathToolkit.almostEqual(overlaps[0].y, overlaps[1].y, 5)) {
                    normal = cc.v2(1, 0);
                } else {
                    if ((overlaps[0].x > overlaps[1].x) === (overlaps[0].y > overlaps[1].y)) {
                        normal = cc.v2(-cfg.C_SQRT_2, cfg.C_SQRT_2);
                    } else {
                        normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
                    }
                }
                overlaps[0].getComponent("brick").takeHit(this);
                overlaps[1].getComponent("brick").takeHit(this);
            }
        } else if (overlaps.length === 3) {
            if ((endPos.x > startPos.x) === (endPos.y > startPos.y)) {
                normal = cc.v2(cfg.C_SQRT_2, cfg.C_SQRT_2);
            } else {
                normal = cc.v2(cfg.C_SQRT_2, -cfg.C_SQRT_2);
            }
            overlaps[0].getComponent("brick").takeHit(this);
            overlaps[1].getComponent("brick").takeHit(this);
            overlaps[2].getComponent("brick").takeHit(this);
        }
        if (normal !== null) {
            const speed: number = cfg.BULLET_SPEED + gm().currentLevel * cfg.BULLET_SPEED_INC;
            let reflection = this.velocity.sub(normal.mulSelf(2 * normal.dot(this.velocity)));
            const tan = Math.abs(reflection.y) / Math.abs(reflection.x);
            if (tan < cfg.C_TAN_15) {
                const xSign = reflection.x < 0 ? -1 : 1;
                const ySign = reflection.y < 0 ? -1 : 1;
                reflection = new cc.Vec2(cfg.C_COS_15 * speed * xSign, cfg.C_SIN_15 * speed * ySign);
            } else if (tan > cfg.C_TAN_89) {
                const xSign = reflection.x < 0 ? -1 : 1;
                const ySign = reflection.y < 0 ? -1 : 1;
                reflection = new cc.Vec2(cfg.C_COS_89 * speed * xSign, cfg.C_SIN_89 * speed * ySign);
            }
            this.velocity = reflection;
        } else {
            this.node.position = endPos;
        }
    }

}
