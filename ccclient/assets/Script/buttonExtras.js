cc.Class({
    extends: cc.Component,

    properties: {
        sound: {
            type: cc.AudioClip,
            default: null
        }
    },

    pressed() {
        cc.audioEngine.play(this.sound, false, 1);
    },
});
