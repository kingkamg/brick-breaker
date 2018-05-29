cc.Class({
    extends: cc.Component,

    properties: {
        sound: {
            url: cc.AudioClip,
            default: null
        }
    },

    pressed() {
        cc.audioEngine.play(this.sound, false, 1);
    },
});
