const cfg = require("./Constants");

let brickId = 1;

cc.Class({
    extends: cc.Component,

    properties: {
        player:               {type: cc.Node,    default: null},
        canvas:               {type: cc.Node,    default: null},
        arrow:                {type: cc.Node,    default: null},
        bullets:              {type: [cc.Node],  default: []},
        bricks:               {type: [cc.Node],  default: []},
        levelContainer:       {type: cc.Node,    default: null},
        score:                {type: cc.Label,   default: null},
        scoreBuldge:          0,
        bestScore:            {type: cc.Label,   default: null},
        gameOver:             {type: cc.Node,    default: null},
        guide:                {type: cc.Node,    default: null},
        state:                "ready", // ready, moving
        allSticked:           true,
        touchPressed:         false,
        touchLoc:             null,
        bulletPrefab:         {type: cc.Prefab,  default: null},
        sfxKaboomPrefab:      {type: cc.Prefab,  default: null},
        brickPrefab:          {type: cc.Prefab,  default: null},
        powerUpBallsPrefab:   {type: cc.Prefab,  default: null},
        powerUpEnlargePrefab: {type: cc.Prefab,  default: null},
        powerUpBoom:          {type: cc.Prefab,  default: null},
        plusOnePrefab:        {type: cc.Prefab,  default: null},
        maxBalls:             1,
        colors:               {type: [cc.color], default: []},
        scoreValue:           0,
        gameRunning:          false,
        memScore:             0,
        currentLevel:         0,
        frameCounter:         0,
        fixedFPS:             30,
        frameCap:             0,
    },

    onLoad() {
        this.bricksPool = [
            3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5,
            6, 6, 6,
            7,
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
        this.leaderboardScores = {
            isContexed: false,
            scores: []
        };
        this.frameCap = 1 / this.fixedFPS;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onDragged.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchRelease.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchRelease.bind(this));
        window.controller = this;
        // 对象池
        this.nodePools = {};
        for (const key of Object.keys(cfg.POOL_SIZES)) {
            this.nodePools[key] = new cc.NodePool();
            const whichPrefab = this.findPrefabByName(key);
            for (let i = 0; i < cfg.POOL_SIZES[key]; i++) {
                this.nodePools[key].put(cc.instantiate(whichPrefab));
            }
        }
    },

    findPrefabByName(key) {
        let whichPrefab = null;
        switch (key) {
            case cfg.KEY.BULLET: {
                whichPrefab = this.bulletPrefab;
                break;
            }
            case cfg.KEY.SFX_KABOOM: {
                whichPrefab = this.sfxKaboomPrefab;
                break;
            }
            case cfg.KEY.PLUS_ONE: {
                whichPrefab = this.plusOnePrefab;
                break;
            }
            case cfg.KEY.BRICK: {
                whichPrefab = this.brickPrefab;
                break;
            }
            case cfg.KEY.PU_BALL: {
                whichPrefab = this.powerUpBallsPrefab;
                break;
            }
            case cfg.KEY.PU_ENLARGE: {
                whichPrefab = this.powerUpEnlargePrefab;
                break;
            }
            case cfg.KEY.PU_BOOM: {
                whichPrefab = this.powerUpBoom;
                break;
            }
        }
        if (whichPrefab === null) {
            throw new Error("Corrupted Constant.js " + key);
        }
        return whichPrefab;
    },

    instantiatePrefab(prefabName, parentNode) {
        if (this.nodePools.hasOwnProperty(prefabName) === false) {
            throw new Error("creating prefab does not exist in pool " + prefabName);
        }
        if (this.nodePools[prefabName].size() <= 0) {
            const whichPrefab = this.findPrefabByName(prefabName);
            this.nodePools[prefabName].put(cc.instantiate(whichPrefab));
        }
        const obj = this.nodePools[prefabName].get();
        obj.parent = parentNode;
        return obj;
    },

    recyclePrefab(prefabName, obj) {
        if (this.nodePools.hasOwnProperty(prefabName) === false) {
            throw new Error("Recycling prefab does not exist in pool " + prefabName);
        }
        this.nodePools[prefabName].put(obj);
    },

    startGame() {
        this.addScore(0);
        this.loadBestScore();
        this.guide.getComponent("guideBehaviour").phase(1);
        this.loadLeaderboardScores();
        this.addOneLevel();
        this.gameRunning = true;
        const newBullet = this.instantiatePrefab(cfg.KEY.BULLET, this.canvas);
        this.bullets.push(newBullet);
        newBullet.x = this.player.x;
        newBullet.y = this.player.y + cfg.BULLET_PLAYER_OFFSET;
    },

    loadLeaderboardScores() {
        if (typeof (FBInstant) != "undefined") {
            console.log(`current context = ${FBInstant.context.getID()}`);
            let leaderboardPromise;
            if (FBInstant.context.getID() == null) {
                leaderboardPromise = FBInstant.getLeaderboardAsync("global_highscore");
            } else {
                leaderboardPromise = FBInstant.getLeaderboardAsync(`highscore.${FBInstant.context.getID()}`);
                this.leaderboardScores.isContexed = true;
            }
            leaderboardPromise.then((leaderboard) => {
                console.log(`get all scores, getLeaderboardAsync OK`);
                leaderboard.getEntriesAsync(10, 0).then((entries) => {
                    console.log("get all scores, getEntriesAsync OK", entries);
                    this.leaderboardScores.scores = [];
                    for (let i = 0; i < entries.length; i++) {
                        this.leaderboardScores.scores.push({
                            score: entries[i].getScore()
                        });
                    }
                }, (rejected) => {
                    console.log(rejected);
                });
            }, (rejected) => {
                console.log(rejected);
            });
        }
        console.log(this.leaderboardScores);
    },

    loadBestScore() {
        if (typeof (FBInstant) != "undefined") {
            console.log(`current context = ${FBInstant.context.getID()}`);
            let leaderboardPromise;
            if (FBInstant.context.getID() == null) {
                leaderboardPromise = FBInstant.getLeaderboardAsync("global_highscore");
            } else {
                leaderboardPromise = FBInstant.getLeaderboardAsync(`highscore.${FBInstant.context.getID()}`);
            }
            leaderboardPromise.then((leaderboard) => {
                console.log(`get best, getLeaderboardAsync OK`);
                leaderboard.getPlayerEntryAsync().then((entry) => {
                    console.log("get best, getPlayerEntryAsync OK", entry);
                    if (entry !== null) {
                        this.bestScore.string = "" + entry.getScore();
                    }
                }, (rejected) => {
                    console.log(rejected);
                });
            }, (rejected) => {
                console.log(rejected);
            });
        } else {
            console.log("read from localstorage")
            let score = cc.sys.localStorage.getItem("score");
            if (score !== null && score !== "") {
                this.bestScore.string = score;
                this.memScore = parseInt(score, 10);
            } else {
                this.bestScore.string = "0";
            }
        }
    },

    restart() {
        console.log("restart game");
        this.currentLevel = 0;
        this.player.getComponent("player").setLengthz(210);
        this.loadBestScore();
        this.guide.getComponent("guideBehaviour").phase(1);
        this.gameRunning = true;
        this.gameOver.active = false;
        this.destroyAllLevels();
        let bullet = this.bullets.pop();
        while (bullet !== undefined) {
            this.recyclePrefab(cfg.KEY.BULLET, bullet);
            bullet = this.bullets.pop();
        }
        this.player.x = 0;
        this.player.y = -400;

        const newBullet = this.instantiatePrefab(cfg.KEY.BULLET, this.canvas);
        newBullet.x = this.player.x;
        newBullet.y = this.player.y + cfg.BULLET_PLAYER_OFFSET;
        const bulletBehaviour = newBullet.getComponent("bullet");
        bulletBehaviour.sticked = true;
        this.bullets.push(newBullet);

        this.allSticked = true;
        this.state = "ready";
        this.maxBalls = 1;
        this.updateAllStickState();
        this.setScore(0);
        this.loadLeaderboardScores();
        this.frameCounter = 0;
    },

    setScore(val) {
        this.scoreValue = val;
        this.score.string = this.scoreValue + "";
    },

    addScore(val) {
        this.scoreValue += val;
        this.score.string = this.scoreValue + "";
        this.scoreBuldge = 0.55;
    },

    updateScore() {
        if (this.scoreValue > parseInt(this.bestScore.string)) {
            this.bestScore.string = "" + this.scoreValue;
        }
        if (typeof (FBInstant) != "undefined") {
            console.log(`current context = ${FBInstant.context.getID()}`);
            let leaderboardPromise;
            if (FBInstant.context.getID() == null) {
                leaderboardPromise = FBInstant.getLeaderboardAsync("global_highscore");
            } else {
                leaderboardPromise = FBInstant.getLeaderboardAsync(`highscore.${FBInstant.context.getID()}`);
            }
            leaderboardPromise.then((leaderboard) => {
                console.log("update score, getLeaderboardAsync OK");
                leaderboard.getPlayerEntryAsync().then((entry) => {
                    console.log("update score, getPlayerEntryAsync OK");
                    leaderboard.setScoreAsync(this.scoreValue).then(() => {
                        console.log("update score, setScoreAsync OK");
                        console.log(`${highscore} score saved ${this.scoreValue}`);
                    }, (rejected) => {
                        console.log(rejected);
                    });
                }, (rejected) => {
                    console.log(rejected);
                });
            }, (rejected) => {
                console.log(rejected);
            });
        } else {
            console.log("write to localstorage")
            cc.sys.localStorage.setItem("score", this.memScore.toString());
        }
    },

    gameEnd() {
        if (this.gameRunning === false) return;
        let level = 1;
        if (typeof (FBInstant) != "undefined") {
            if (this.leaderboardScores.isContexed === false) {
                if (this.scoreValue <= parseInt(this.bestScore.string)) {
                    level = 2;
                }
                if (this.scoreValue < 5) {
                    level = 3;
                }
            } else {
                if (this.leaderboardScores.scores.length > 0) {
                    if (this.scoreValue < this.leaderboardScores.scores[0].score) {
                        level = 2;
                    } else if (this.scoreValue > this.leaderboardScores.scores[0].score * 2) {
                        level = 0;
                    }
                    if (this.scoreValue < 5) {
                        level = 3;
                    }
                }
            }
        } else {
            if (this.scoreValue <= this.memScore) {
                level = 2;
            }
            if (this.scoreValue < 5) {
                level = 3;
            }
            if (this.memScore < this.scoreValue) {
                this.memScore = this.scoreValue;
            }
        }
        this.gameOver.getComponent("gameOverBehaviour").show(this.leaderboardScores.isContexed, level);
        this.updateScore();
    },

    destroyAllLevels() {
        let i = this.bricks.length;
        while (i --) {
            this.bricks[i].getComponent("brick").kaboom();
        }
    },

    deleteOneRow() {
        let lowest = 1000;
        for (let i = 0; i < this.bricks.length; i++) {
            const element = this.bricks[i];
            if (element.y < lowest) {
                lowest = element.y
            }
        }
        let i = this.bricks.length;
        while (i --) {
            const element = this.bricks[i];
            if (Math.abs(element.y - lowest) < 10) {
                element.getComponent("brick").kaboom();
            }
        }
    },

    addOneLevel() {
        // move downward
        this.currentLevel += 1;
        let enlarge = false;
        if (this.currentLevel % 10 === 0) {
            enlarge = true;
        }
        let lowest = 1000;
        for (let i = 0; i < this.bricks.length; i++) {
            const element = this.bricks[i];
            element.y -= 100;
            if (element.y < lowest) {
                lowest = element.y
            }
        }
        if (lowest < -270) {
            this.gameEnd();
        }
        // add one layer
        let n = this.bricksPool[Math.floor(Math.random() * this.bricksPool.length)];
        const powerUp = Math.floor(Math.random() * 3);
        n -= powerUp;
        const pool = [];
        for (let i = 0; i < n; i++) {
            pool.push(1);
        }
        let alreadyPutBoom = false;
        for (let i = 0; i < powerUp; i++) {
            if (this.currentLevel > 15 && alreadyPutBoom === false) {
                if (Math.random() < 0.5) {
                    pool.push(4);
                } else {
                    pool.push(2);
                }
                alreadyPutBoom = true;
            } else {
                pool.push(2);
            }
        }
        for (let i = n + powerUp; i < 8; i++) {
            pool.push(0);
        }
        if (enlarge === true) {
            pool[Math.floor(Math.random() * pool.length)] = 3;
        }
        let doubled = false;
        for (let i = 0; i < 8; i++) {
            const index = Math.floor(Math.random() * pool.length);
            let brick = null;
            switch (pool[index]) {
                case 1: {
                    brick = this.instantiatePrefab(cfg.KEY.BRICK, this.levelContainer);
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
                    const brickBehaviour = brick.getComponent("brickNormal");
                    brickBehaviour.hp = hp;
                    brickBehaviour.updateHP();
                    break;
                }
                case 2: {
                    brick = this.instantiatePrefab(cfg.KEY.PU_BALL, this.levelContainer);
                    break;
                }
                case 3: {
                    brick = this.instantiatePrefab(cfg.KEY.PU_ENLARGE, this.levelContainer);
                    break;
                }
                case 4: {
                    brick = this.instantiatePrefab(cfg.KEY.PU_BOOM, this.levelContainer);
                    break;
                }
            }
            if (brick != null) {
                this.bricks.push(brick);
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
        if (this.scoreBuldge > 0) {
            this.scoreBuldge -= dt * dt * 150;
            if (this.scoreBuldge < 0) {
                this.scoreBuldge = 0;
            }
            this.score.node.scaleX = this.scoreBuldge + 1;
            this.score.node.scaleY = this.scoreBuldge + 1;
        }
        // fixed manual frame
        this.frameCounter += dt;
        if (this.frameCounter >= this.frameCap) {
            this.frameCounter %= this.frameCap;
            for (const elem of this.bullets) {
                elem.getComponent("bullet").updateManually(this.frameCap);
            }
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
        if (this.state == "moving" && this.touchPressed == true) {
            this.player.getComponent("player").setPosition(e.getDeltaX());
        }
        this.touchPressed = true;
    },

    touchRelease(e) {
        if (this.allSticked === true && this.state == "ready") {
            const rad = (90 - this.arrow.rotation) / 180.0 * Math.PI;
            const dir = new cc.Vec2(Math.cos(rad) * 750, Math.sin(rad) * 750);
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
        if (this.guide.getComponent("guideBehaviour").stage === 1) {
            this.guide.getComponent("guideBehaviour").phase(2);
        }
    },

    updateAllStickState() {
        if (this.bullets.length == 0) {
            this.gameEnd();
        } else {
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
                if (this.gameRunning === true) {
                    this.addOneLevel();
                }
            }
        }
    }

});
