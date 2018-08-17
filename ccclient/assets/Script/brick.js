import cfg from "./Constants";

cc.Class({
    extends: cc.Component,

    properties: {
        brickType: "BRICK"
    },

    onLoad () {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    kaboom() {
        // create explosion
        const explosion = window.controller.instantiatePrefab(cfg.KEY.SFX_KABOOM, window.controller.canvas);
        const expParticle = explosion.getComponent(cc.ParticleSystem);
        expParticle.startColor = this.node.color;
        explosion.x = this.node.x;
        explosion.y = this.node.y;
        expParticle.resetSystem();
        // recycle particles
        expParticle.scheduleOnce(() => {
            window.controller.recyclePrefab(cfg.KEY.SFX_KABOOM, explosion);
        }, expParticle.life);

        // brick action
        const index = window.controller.bricks.indexOf(this.node);
        if (index != -1) {
            window.controller.bricks.splice(index, 1);
        } else {
            console.warn("Removing inexisting brick");
        }
        window.controller.recyclePrefab(this.brickType, this.node);
    },

    onCollisionEnter(other, self) {
        window.controller.addScore(1);
        let componentName = "brickNormal";
        switch (this.brickType) {
            case cfg.KEY.PU_BALL: {
                componentName = "powerUpAddBall";
                break;
            }
            case cfg.KEY.PU_ENLARGE: {
                componentName = "powerUpEnlarge";
                break;
            }
            case cfg.KEY.PU_BOOM: {
                componentName = "powerUpBoom";
                break;
            }
            default: {
                break;
            }
        }
        this.node.getComponent(componentName).takeHit(other);
    }

});
