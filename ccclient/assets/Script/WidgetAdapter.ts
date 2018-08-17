const {ccclass, property} = cc._decorator;

@ccclass
export default class WidgetAdapter extends cc.Component {

    @property public alignTopWider: number = 0;
    @property public alignTopNarrower: number = 0;
    @property public alignBottomWider: number = 0;
    @property public alignBottomNarrower: number = 0;
    @property public alignLeftWider: number = 0;
    @property public alignLeftNarrower: number = 0;
    @property public alignRightWider: number = 0;
    @property public alignRightNarrower: number = 0;
    @property public enableScaleAdapter: boolean = false;
    @property public scaleWider: number = 1;
    @property public scaleNarrower: number = 1;

    protected onLoad() {
        const screen: cc.Rect = cc.view.getViewportRect();
        const ratio: number = screen.width / screen.height;
        if (Math.abs(ratio - 0.5625) > 0.001) {
            const widget: cc.Widget = this.node.getComponent(cc.Widget);
            if (ratio > 0.5625) {
                // wide
                if (widget !== null) {
                    widget.top = this.alignTopWider;
                    widget.bottom = this.alignBottomWider;
                    widget.left = this.alignLeftWider;
                    widget.right = this.alignRightWider;
                }
                if (this.enableScaleAdapter) {
                    this.node.scale = this.scaleWider;
                }
            } else {
                // narrow
                if (widget !== null) {
                    widget.top = this.alignTopNarrower;
                    widget.bottom = this.alignBottomNarrower;
                    widget.left = this.alignLeftNarrower;
                    widget.right = this.alignRightNarrower;
                }
                if (this.enableScaleAdapter) {
                    this.node.scale = this.scaleNarrower;
                }
            }
        }
    }

}
