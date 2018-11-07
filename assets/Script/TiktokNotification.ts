const {ccclass, property} = cc._decorator;

@ccclass
export default class TiktokNotification extends cc.Component {

    @property(cc.Node) public text: cc.Node = null;

    public show() {
        this.text.x = -760;
        this.node.active = true;
        const moveIn: cc.ActionInterval = cc.moveTo(0.2, cc.v2(0, 0));
        const delay: cc.ActionInterval = cc.delayTime(1.3);
        const moveOut: cc.ActionInterval = cc.moveTo(0.2, cc.v2(760, 0));
        const begone: cc.ActionInstant = cc.callFunc(() => {
            this.node.active = false;
        });
        this.text.runAction(cc.sequence(moveIn, delay, moveOut, begone));
    }

}
