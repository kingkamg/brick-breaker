const {ccclass, property} = cc._decorator;

@ccclass
export default class BHButton extends cc.Component {

    @property            public yOffset: number = 10;
    @property(cc.Node)   public moveable: cc.Node[] = [];
    @property(cc.Label)  public textLabel: cc.Label = null;
    @property([cc.Node]) public states: cc.Node[] = [];
    @property(cc.AudioClip) public sound: cc.AudioClip = null;

    private originalColors: cc.Color[] = [];
    private originalPoses: cc.Vec2[] = [];
    private interactable: boolean = true;

    public setActive(flag: boolean) {
        this.node.getComponent(cc.Button).interactable = flag;
        if (flag) {
            for (let i = 0; i < this.node.children.length; i ++) {
                this.node.children[i].color = this.originalColors[i];
            }
        } else {
            for (let i = 0; i < this.node.children.length; i ++) {
                const luma: number = (0.2126 * this.originalColors[i].getR() / 255 + 0.7152 * this.originalColors[i].getG() / 255 + 0.0722 * this.originalColors[i].getB() / 255);
                this.node.children[i].color = new cc.Color(luma * 255, luma * 255, luma * 255, this.originalColors[i].getA());
            }
        }
        this.interactable = flag;
    }

    public isInteractable(): boolean {
        return this.interactable;
    }

    public setText(text: string) {
        this.textLabel.string = text;
    }

    public setState(index: number) {
        for (let i = 0; i < this.states.length; i++) {
            const element = this.states[i];
            if (i === index) {
                element.active = true;
            } else {
                element.active = false;
            }
        }
    }

    protected onLoad() {
        // colors
        for (const elem of this.node.children) {
            this.originalColors.push(elem.color);
        }
        // positions
        for (const elem of this.moveable) {
            this.originalPoses.push(cc.v2(elem.x, elem.y));
        }
        // states
        if (this.states.length > 0) {
            this.states[0].active = true;
            for (let i = 1; i < this.states.length; i++) {
                this.states[i].active = false;
            }
        }
    }

    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onKeyPressed);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onKeyReleased);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onKeyReleased);
    }

    private onKeyPressed: () => void = () => {
        cc.audioEngine.play(this.sound, false, 1);
        for (const elem of this.moveable) {
            elem.x = 0;
            elem.y = 0;
        }
    }

    private onKeyReleased: () => void = () => {
        for (let i = 0; i < this.moveable.length; i++) {
            const elem = this.moveable[i];
            elem.x = this.originalPoses[i].x;
            elem.y = this.originalPoses[i].y;
        }
    }

}
