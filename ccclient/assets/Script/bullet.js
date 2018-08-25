import cfg from "./Constants";
import MathToolkit from "./MathToolkit";

cc.Class({
    extends: cc.Component,

    properties: {
        sound: { type: cc.AudioClip, default: null },
        tik: { type: cc.Node, default: null },
        tok: { type: cc.Node, default: null },
        velocity: new cc.Vec2(),
        sticked: false,
        launchTime: -1,
        savedx: 0,
        savedy: 0,
        uselessCollide: 0
    },

    update(dt) {
        if (this.sticked === true) {
            this.node.x = window.controller.player.x;
            this.node.y = window.controller.player.y + cfg.BULLET_PLAYER_OFFSET;
        }
        if (this.node.y < -660 || this.node.y > 660 || this.node.x < -380 || this.node.x > 380) {
            const index = window.controller.bullets.indexOf(this.node);
            if (index != -1) {
                window.controller.bullets.splice(index, 1);
            } else {
                console.warn("bullets not in controller");
            }
            window.controller.recyclePrefab(cfg.KEY.BULLET, this.node);
            window.controller.updateAllStickState();
        }
        if (this.launchTime > 0) {
            this.launchTime -= dt;
            if (this.launchTime <= 0) {
                this.sticked = false;
                this.velocity = new cc.Vec2(this.savedx, this.savedy);
                const rigidbody = this.node.getComponent(cc.RigidBody);
                rigidbody.awake = true;
                rigidbody.linearVelocity = this.velocity;
                window.controller.updateAllStickState();
            }
        }
    },

    freeze() {
        this.velocity = new cc.Vec2(0, 0);
        const rigidbody = this.node.getComponent(cc.RigidBody);
        rigidbody.awake = false;
        rigidbody.linearVelocity = this.velocity;
        this.sticked = true;
        this.resetTiktok();
        window.controller.updateAllStickState();
    },

    launchIn(x, y, time) {
        this.launchTime = time;
        this.savedx = x;
        this.savedy = y;
    },

    onPostSolve(contact, selfCollider, otherCollider) {
        cc.audioEngine.play(this.sound, false, 1);
        if (otherCollider.tag === 0 || otherCollider.tag === 1) {
            if (otherCollider.tag === 0) {
                otherCollider.node.getComponent("brick").takeHit(this);
            }
            const rigidBody = this.node.getComponent(cc.RigidBody);
            let cVelo = rigidBody.linearVelocity.clone();
            if (Math.abs(cVelo.y) / Math.abs(cVelo.x) < 0.26794919243112270647255365849413) {
                const xSign = cVelo.x < 0 ? -1 : 1;
                const ySign = cVelo.y < 0 ? -1 : 1;
                cVelo = new cc.Vec2(0.9659258262890682867497431997289 * (cfg.BULLET_SPEED + window.controller.currentLevel * cfg.BULLET_SPEED_INC) * xSign, 0.25881904510252076234889883762405 * (cfg.BULLET_SPEED + window.controller.currentLevel * cfg.BULLET_SPEED_INC) * ySign);
                rigidBody.linearVelocity = cVelo;
            }
            window.controller.tiktokFrame.getComponent("animeBlock").shadeOnce();
        }
        if (otherCollider.tag === 2) {
            this.freeze();
        }
        // tiktok
        if (window.controller.tiktok && otherCollider.tag !== 2) {
            const rigidbody = this.node.getComponent(cc.RigidBody);
            const dir = rigidbody.linearVelocity.clone();
            dir.normalizeSelf().mulSelf(4.5);
            this.tik.x = dir.x;
            this.tik.y = dir.y;
            this.tok.x = -dir.x;
            this.tok.y = -dir.y;
        }
    },

    resetTiktok() {
        this.tik.x = 0;
        this.tik.y = 0;
        this.tok.x = 0;
        this.tok.y = 0;
    },

});
