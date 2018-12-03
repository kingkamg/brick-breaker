import sdk from "./sdk/sdk";

export interface IWXGameScoreData {
    [key: string]: string | object;
    wxgame: {
        score: number;
        update_time: number;
    };
}

export default class Utils {

    public static isWXGameScoreData(obj): obj is IWXGameScoreData {
        if (!obj) {
            return false;
        }
        if (typeof obj.wxgame !== "object") {
            return false;
        }
        if (typeof obj.wxgame.score !== "number") {
            return false;
        }
        if (typeof obj.wxgame.update_time !== "number") {
            return false;
        }
        return true;
    }

    public static showBannerAd(id: string) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            const info = wx.getSystemInfoSync();
            if (info.model.indexOf("iPhone 5") === -1 && info.model.indexOf("iPhone SE") === -1) {
                sdk.showBannerAd(id, this.getBannerRectWithHeight(200));
            }
        } else {
            sdk.showBannerAd(id, this.getBannerRectWithHeight(200));
        }
    }

    public static hideBannerAd(id: string) {
        sdk.hideBannerAd(id);
    }

    public static safeParseInt(str: string): number {
        let ret: number = parseInt(str, 10);
        if (isNaN(ret)) {
            ret = 0;
        }
        return ret;
    }

    public static safeParseObj(str: string): any {
        let ret = null;
        try {
            ret = JSON.parse(str);
        } catch (error) {
            console.warn("JSON.parse failed", str);
        }
        return ret;
    }

    private static getBannerRectWithHeight(maxHeight: number): cc.Rect {
        const frameSize = cc.view.getFrameSize();
        const visibleSize = cc.view.getVisibleSize();
        const designSize = cc.view.getDesignResolutionSize();
        const rect = cc.rect(0, 0, frameSize.width, 0);
        const height = maxHeight + (visibleSize.height - designSize.height) / 2;
        rect.height = height / designSize.height * frameSize.height;
        return rect;
    }

}
