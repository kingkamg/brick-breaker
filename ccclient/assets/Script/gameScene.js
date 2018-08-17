import LoginUIAnime from "./LoginUIAnime";

cc.Class({
    extends: cc.Component,

    properties: {
        loginUI:    {type: LoginUIAnime, default: null},
        gameUINode: {type: cc.Node, default: null},
        display:    {type: cc.Sprite, default: null},
    },

    onRestartClicked() {
        window.controller.restart();
    },

    onClickedStartGame() {
        this.loginUI.show(false);
        this.gameUINode.active = true;
        window.controller.restart();
    },

    start () {
        this.tex = new cc.Texture2D();
    },

    // 刷新开放数据域的纹理
    _updateSubDomainCanvas () {
        if (!this.tex) {
            return;
        }
        var openDataContext = wx.getOpenDataContext();
        var sharedCanvas = openDataContext.canvas;
        console.log(sharedCanvas);
        this.tex.initWithElement(sharedCanvas);
        this.tex.handleLoadedTexture();
        this.display.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    update () {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this._updateSubDomainCanvas();
        }
    },

    onClickedExitGame() {
        this.loginUI.show(true);
        this.gameUINode.active = false;
        window.controller.destroyAllLevels();
        window.controller.player.x = 0;
        window.controller.player.getComponent("player").setLengthz(210)
        window.controller.gameRunning = false;
    }

});
