cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node
        },
        canvas: {
            default: null,
            type: cc.Node
        },
        arrow: {
            default: null,
            type: cc.Node
        },
        bullets: {
            default: [],
            type: [cc.Node]
        },
        bricks: {
            default: [],
            type: [cc.Node]
        },
        levelContainer: {
            default: null,
            type: cc.Node
        },
        score: {
            default: null,
            type: cc.Label
        },
        state: "ready", // ready, moving
        allSticked: true,
        touchPressed: false,
        touchLoc: null,
        brickPrefab: {
            default: null,
            type: cc.Prefab
        },
        powerUpBallsPrefab: {
            default: null,
            type: cc.Prefab
        },
        maxBalls: 1,
        colors: {
            default: [],
            type: [cc.color]
        },
        scoreValue: 0
    },

    onLoad() {
        this.bricksPool = [
            3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5,
            6, 6, 6,
            7, 7,
            8,
        ];
        this.colors = [
            new cc.color(241, 196, 15),
            new cc.color(243, 156, 18),
            new cc.color(230, 126, 34),
            new cc.color(211, 84, 0),
            new cc.color(52, 152, 219),
            new cc.color(41, 128, 185),
            new cc.color(155, 89, 182),
            new cc.color(142, 68, 173),
            new cc.color(231, 76, 60),
            new cc.color(192, 57, 43)
        ];

        this.node.on(cc.Node.EventType.TOUCH_START, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchRelease.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchRelease.bind(this));
        window.controller = this;
    },

    start() {
        this.addOneLevel();
        this.addScore(0);
    },

    addScore(val) {
        this.scoreValue += val;
        this.score.string = this.scoreValue + "";
    },

    addOneLevel() {
        // move downward
        for (let i = 0; i < this.bricks.length; i++) {
            const element = this.bricks[i];
            element.y -= 100;
        }
        // add one layer
        let n = this.bricksPool[Math.floor(Math.random() * this.bricksPool.length)];
        const powerUp = Math.floor(Math.random() * 3);
        n -= powerUp;
        const pool = [];
        for (let i = 0; i < n; i++) {
            pool.push(1);
        }
        for (let i = 0; i < powerUp; i++) {
            pool.push(2);
        }
        for (let i = n + powerUp; i < 8; i++) {
            pool.push(0);
        }
        let doubled = false;
        for (let i = 0; i < 8; i++) {
            const index = Math.floor(Math.random() * pool.length);
            let brick = null;
            switch (pool[index]) {
                case 1:
                    brick = cc.instantiate(this.brickPrefab);
                    let hp = this.maxBalls;
                    if (hp > this.bullets.length) {
                        hp = hp * 0.8;
                    }
                    if (doubled === false) {
                        if (Math.random() < 0.15) {
                            hp *= 2;
                            doubled = true;
                        }
                    }
                    hp = Math.ceil(hp * (1 + Math.random() * 0.6 - 0.3));
                    if (hp < 1) {
                        hp = 1;
                    }
                    brick.getComponent("brickNormal").hp = hp;
                    break;
                case 2:
                    brick = cc.instantiate(this.powerUpBallsPrefab);
                    break;
                default:
                    break;
            }
            if (brick != null) {
                this.bricks.push(brick);
                this.levelContainer.addChild(brick);
                brick.x = -314 + i * 90;
                brick.y = 430;
            }
            pool.splice(index, 1);
        }
    },

    update(dt) {
        if (this.touchPressed === true && this.allSticked === true && this.state == "ready") {
            this.updateArrow();
        }
    },

    updateArrow() {
        this.arrow.x = this.player.x;
        this.arrow.active = true;

        this.arrowRad = Math.atan2(this.touchLoc.y - 640 - this.arrow.y, this.touchLoc.x - 360 - this.arrow.x);
        let deg = 90 - this.arrowRad / Math.PI * 180.0;
        if ((deg >= -90 && deg < -75) || (deg <= 270 && deg > 255)) {
            deg = -75;
        } else if (deg > 75 && deg < 105) {
            deg = 75
        } else if (deg >= 105 && deg <= 255) {
            deg -= 180;
        }
        this.arrow.rotation = deg;
    },

    onDragged(e) {
        this.touchLoc = e.getLocation();
        if (this.state == "moving") {
            this.player.getComponent("player").setPosition(e.getDeltaX());
        }
        this.touchPressed = true;
    },

    touchRelease(e) {
        if (this.allSticked === true && this.state == "ready") {
            const rad = (90 - this.arrow.rotation) / 180.0 * Math.PI;
            const dir = new cc.Vec2(Math.cos(rad) * 800, Math.sin(rad) * 800);
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].getComponent("bullet").launchIn(dir.x, dir.y, (i + 1) * 0.1);
            }
            this.allSticked = false;
            this.arrow.active = false;
            this.state = "moving";
        } else if (this.state == "moving" && this.allSticked === true) {
            this.state = "ready";
        }
        this.touchPressed = false;
    },

    updateAllStickState() {
        let count = 0;
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].getComponent("bullet").sticked === true) {
                count += 1;
            }
        }
        this.player.getComponent("player").updateNumber(count);
        if (this.maxBalls < count) {
            this.maxBalls = count;
        }
        if (count === this.bullets.length) {
            this.allSticked = true;
            this.addOneLevel();
        }
    }

});
