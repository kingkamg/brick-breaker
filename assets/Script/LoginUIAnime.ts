const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginUIAnime extends cc.Component {

    @property([cc.Node]) public moveUps: cc.Node[] = [];
    @property([cc.Node]) public moveDowns: cc.Node[] = [];

    private savedUps: cc.Vec2[] = [];
    private savedDowns: cc.Vec2[] = [];
    private interval: number = 0.3;

    public show(flag: boolean) {
        if (flag === false) {
            // move up
            for (const elem of this.moveUps) {
                const moveUp: cc.ActionInterval = cc.moveBy(this.interval, cc.v2(0, 500));
                elem.stopAllActions();
                elem.runAction(moveUp);
            }
            // move down
            for (const elem of this.moveDowns) {
                const moveDown: cc.ActionInterval = cc.moveBy(this.interval, cc.v2(0, -500));
                elem.stopAllActions();
                elem.runAction(moveDown);
            }
            // hide all
            const hide: cc.ActionInstant = cc.callFunc(() => {
                this.node.active = false;
            });
            const delay: cc.ActionInterval = cc.delayTime(this.interval);
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(delay, hide));
        } else {
            this.node.stopAllActions();
            this.node.active = true;
            // move up
            for (const elem of this.moveDowns) {
                const moveUp: cc.ActionInterval = cc.moveBy(this.interval, cc.v2(0, 500));
                elem.stopAllActions();
                elem.runAction(moveUp);
            }
            // move down
            for (const elem of this.moveUps) {
                const moveDown: cc.ActionInterval = cc.moveBy(this.interval, cc.v2(0, -500));
                elem.stopAllActions();
                elem.runAction(moveDown);
            }
        }
    }

    protected onLoad() {
        for (const elem of this.moveUps) {
            this.savedUps.push(cc.v2(elem.x, elem.y));
        }
        for (const elem of this.moveDowns) {
            this.savedDowns.push(cc.v2(elem.x, elem.y));
        }
    }

}
