import cfg from "./Constants";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Arrow extends cc.Component {

    private dots: cc.Node[] = [];

    public updateArrow(origin: cc.Vec2, touchLoc: cc.Vec2) {
        origin.y += cfg.BULLET_PLAYER_OFFSET;
        let dir: cc.Vec2 = touchLoc.sub(origin);
        if (dir.y < 0) {
            dir.mulSelf(-1);
        }
        const mag: number = dir.mag() * 2;
        if (Math.abs(dir.y) / Math.abs(dir.x) < 0.26794919243112270647255365849413) {
            const xSign = dir.x < 0 ? -1 : 1;
            const ySign = dir.y < 0 ? -1 : 1;
            dir = new cc.Vec2(Math.cos(cfg.BULLET_MIN_ANGLE) * mag * xSign, Math.sin(cfg.BULLET_MIN_ANGLE) * mag * ySign);
        }
        const diff: number = mag / (this.dots.length - 1);
        const adden: cc.Vec2 = dir.normalize().mulSelf(diff);
        this.dots[0].x = origin.x;
        this.dots[0].y = origin.y;
        for (let i = 1; i < this.dots.length; i++) {
            const dot = this.dots[i];
            origin.addSelf(adden);
            dot.x = origin.x;
            dot.y = origin.y;
        }
        this.node.active = true;
    }

    public getDirection(): cc.Vec2 {
        const head: cc.Node = this.dots[this.dots.length - 1];
        const tail: cc.Node = this.dots[0];
        return cc.v2(head.x - tail.x, head.y - tail.y);
    }

    public dismiss() {
        this.node.active = false;
    }

    public init() {
        for (const elem of this.node.children) {
            this.dots.push(elem);
        }
    }

}
