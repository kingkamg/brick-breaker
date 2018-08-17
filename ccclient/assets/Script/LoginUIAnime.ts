const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginUIAnime extends cc.Component {

    @property(cc.Node) public title: cc.Node = null;
    @property(cc.Node) public leaderboardButton: cc.Node = null;
    @property(cc.Node) public startButton: cc.Node = null;

    private interval: number = 0.3;
    private savedTitleY: number = 0;
    private savedButtonY: number = 0;
    private savedLeaderboardX: number = 0;
    private savedStartX: number = 0;

    public show(flag: boolean) {
        if (flag === false) {
            const moveUp: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(0, 900));
            const moveDownL: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(this.savedLeaderboardX, -900));
            const moveDownS: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(this.savedStartX, -900));
            const delay: cc.ActionInterval = cc.delayTime(this.interval);
            const hide: cc.ActionInstant = cc.callFunc(() => {
                this.node.active = false;
            });
            this.title.stopAllActions();
            this.title.runAction(moveUp);
            this.leaderboardButton.stopAllActions();
            this.leaderboardButton.runAction(moveDownL);
            this.startButton.stopAllActions();
            this.startButton.runAction(moveDownS);
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(delay, hide));
        } else {
            this.node.stopAllActions();
            this.node.active = true;
            const moveDown: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(0, this.savedTitleY));
            const moveUpL: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(this.savedLeaderboardX, this.savedButtonY));
            const moveUpS: cc.ActionInterval = cc.moveTo(this.interval, cc.v2(this.savedStartX, this.savedButtonY));
            this.title.stopAllActions();
            this.title.runAction(moveDown);
            this.leaderboardButton.stopAllActions();
            this.leaderboardButton.runAction(moveUpL);
            this.startButton.stopAllActions();
            this.startButton.runAction(moveUpS);
        }
    }

    protected onLoad() {
        this.savedButtonY = this.startButton.y;
        this.savedTitleY = this.title.y;
        this.savedLeaderboardX = this.leaderboardButton.x;
        this.savedStartX = this.startButton.x;
    }

}
