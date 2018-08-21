cc.Class({
    extends: cc.Component,

    properties: {
        tik: {type: cc.Node, default: null},
        tok: {type: cc.Node, default: null},
    },

    onLoad () {
        this.time = -1;
        this.scale = 1;
        this.bulge = 0;
        this.tiktok = 0;
        this.dir = 0;
    },

    update (dt) {
        if (this.time >= 0) {
            this.time += dt;
            const angle = this.time * 500;
            if (angle < 180) {
                this.node.rotation = angle;
            } else {
                this.node.rotation = 0;
                this.time = -1;
            }
        }
        if (Math.abs(this.scale - this.node.scaleX) > 0.001) {
            let delta = this.scale - this.node.scaleX;
            if (delta > 0.1) {
                delta = 0.1;
            } else if (delta < -0.1) {
                delta = -0.1;
            }
            this.node.scaleX += delta;
            this.node.scaleY += delta;
        }
        if (this.bulge > -0.05) {
            if (this.bulge > 0) {
                this.node.scaleX += dt * 3.7;
                this.node.scaleY += dt * 3.7;
            } else {
                this.node.scaleX -= dt * 3.7;
                this.node.scaleY -= dt * 3.7;
            }
            this.bulge -= dt;
        }
        if (this.tiktok > 0) {
            this.tiktok -= dt;
            this.tik.x = this.dir * this.tiktok / 0.12;
            this.tik.y = this.dir * this.tiktok / 0.12;
            this.tok.x = -this.dir * this.tiktok / 0.12;
            this.tok.y = -this.dir * this.tiktok / 0.12;
        }
    },

    setScale(x) {
        this.scale = x;
    },

    flipSize() {
        if (this.scale < 1) {
            this.scale = 1;
        } else {
            this.scale = 0.5;
        }
    },

    initiateSpin() {
        this.time = 0;
    },

    bulgeOnce() {
        this.bulge = 0.05;
    },

    tiktokOnce(dir) {
        if (this.tiktok <= 0) {
            this.tiktok = 0.12;
            this.dir = dir;
            this.tik.x = dir;
            this.tik.y = dir;
            this.tok.x = -dir;
            this.tok.y = -dir;
        }
    },

});
