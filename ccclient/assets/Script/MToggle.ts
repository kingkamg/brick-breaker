const {ccclass, property} = cc._decorator;

@ccclass
export default class MToggle extends cc.Component {

    @property(cc.Node) public checkMark: cc.Node = null;

    public toggle(flag: boolean) {
        this.checkMark.active = flag;
    }

}
