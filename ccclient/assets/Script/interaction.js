import sdk from "./sdk/sdk";
import Arrow from "./Arrow";
import cfg from "./Constants";
import BHButton from "./BHButton";

cc.Class({
    extends: cc.Component,

    properties: {
        player:               {type: cc.Node,    default: null},
        canvas:               {type: cc.Node,    default: null},
        arrow:                {type: Arrow,      default: null},
        bullets:              {type: [cc.Node],  default: []},
        bricks:               {type: [cc.Node],  default: []},
        walls:                {type: [cc.Node],  default: []},
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
        bgAnime:              {type: cc.Node,  default: null},
        tiktokFrame:          {type: cc.Node,  default: null},
        startButton:          {type: BHButton, default: null},
        maxBalls:             1,
        colors:               {type: [cc.color], default: []},
        scoreValue:           0,
        gameRunning:          false,
        memScore:             0,
        currentLevel:         0,
        frameCounter:         0,
        fixedFPS:             30,
        frameCap:             0,
        tiktok:               false,
        tiktokTime:           10,
    },

    onLoad() {
        this.wechatShareProfiles = [
            {
                imageUrl: "sdkAssets/longzhu.jpg",
                query: "",
                title: "好气，差一点就集齐了，帮帮我！",
            },
            {
                imageUrl: "sdkAssets/share_2.jpg",
                query: "",
                title: "小哥哥说，每一颗弹球都是爱我的心跳",
            },
        ];
        this.bricksPool = [
            3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5,
            6, 6, 6,
            7,
        ];
        this.powerupsPool = [
            0,
            1, 1, 1, 1, 1,
            2, 2, 2
        ];
        this.colors = [
            new cc.color(255, 252, 0),
            new cc.color(255, 199, 66),
            new cc.color(237, 154, 24),
            new cc.color(205, 121, 0),
            new cc.color(255, 93, 49),
            new cc.color(255, 72, 102),
            new cc.color(232, 0, 44),
            new cc.color(179, 0, 46),
            new cc.color(255, 136, 255),
            new cc.color(209, 85, 255),
            new cc.color(165, 24, 224),
            new cc.color(172, 0, 209),
            new cc.color(14, 224, 255),
            new cc.color(109, 150, 255),
            new cc.color(101, 26, 255),
            new cc.color(0, 69, 226),
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
        // Arrow
        this.arrow.init();
        // physics
        const physics = cc.director.getPhysicsManager();
        physics.enabled = true;
        physics.gravity = cc.v2(0);
        physics.enabledAccumulator = true;
        physics.FIXED_TIME_STEP = 1/30;
        physics.PTM_RATIO = 32;
        // sdk
        sdk.init();
        sdk.onUserNoLogin();
        // wechat share
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            sdk.setShareInfoCallback(() => {
                return this.getRandomShareProfile();
            });
        }
    },

    getRandomShareProfile() {
        return window.getRandomFromArray(this.wechatShareProfiles);
    },

    getLeaderboardData() {
        return sdk.fetchLeaderboardData("score", 0);
    },

    fetchHighScore() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            sdk.fetchLeaderboardData("score", 2).then((res) => {
                console.log(res);
                this.startButton.setText("最高分:" + res.toString());
            }).catch((reason) => {
                const obj = cc.sys.localStorage.getItem("score");
                if (obj !== null && obj !== "") {
                    this.startButton.setText("最高分:" + obj);
                } else {
                    this.startButton.setText("最高分:0");
                }
                console.warn(reason);
            });
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
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            sdk.fetchLeaderboardData("score", 0).then((data) => {
                console.log("load game received data");
                console.log(data);
                this.leaderboardScores.scores = [];
                for (const elem of data) {
                    this.leaderboardScores.scores.push({
                        score: parseInt(JSON.parse(elem.KVDataList[0].value).wxgame.score, 10),
                    });
                }
                this.leaderboardScores.scores.sort((a, b) => {
                    if (a.score > b.score) {
                        return -1;
                    } else if (a.score < b.score) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }).catch((reason) => {
                console.log(">>>>>> promise rejected " + reason);
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
            this.loadLeaderboardScores();
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            sdk.fetchLeaderboardData("score", 2).then((data) => {
                console.log("wx fetch user data success");
                this.bestScore.string = data.toString();
                this.memScore = data;
                this.loadLeaderboardScores();
            }).catch((reason) => {
                console.log("wx loadBestScore failed, reason: " + reason);
                this.loadLeaderboardScores();
            });
        } else {
            let score = cc.sys.localStorage.getItem("score");
            if (score !== null && score !== "") {
                this.bestScore.string = score;
                this.memScore = parseInt(score, 10);
            } else {
                this.bestScore.string = "0";
            }
            this.loadLeaderboardScores();
        }
    },

    restart() {
        this.currentLevel = 0;
        this.player.active = true;
        this.player.getComponent("player").setLengthz(cfg.PLAYER_LENGTH);
        this.loadBestScore();
        this.guide.getComponent("guideBehaviour").phase(1);
        this.gameRunning = true;
        this.gameOver.active = false;
        this.destroyAllLevels();
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
        this.frameCounter = 0;
    },

    recycleAllBullets() {
        let bullet = this.bullets.pop();
        while (bullet !== undefined) {
            this.recyclePrefab(cfg.KEY.BULLET, bullet);
            bullet = this.bullets.pop();
        }
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
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            console.log("start to upload score");
            this.startButton.setText("最高分:" + this.memScore.toString());
            sdk.updateLeaderboardScore("score", this.memScore).then(() => {
                console.log("score uploaded");
            }).catch((reason) => {
                console.log("score upload failed: " + reason);
            });
        } else {
            cc.sys.localStorage.setItem("score", this.memScore.toString());
        }
    },

    resetMyScore() {
        if (cfg.TEST) {
            sdk.updateLeaderboardScore("score", 0).then(() => {
                console.log("score reset");
            }).catch((reason) => {
                console.log("score reset failed: " + reason);
            });
        }
    },

    gameEnd() {
        if (this.gameRunning === false) return;
        this.guide.active = false;
        this.recycleAllBullets();
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
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if (this.leaderboardScores.scores.length > 1) {
                this.leaderboardScores.isContexed = true;
            } else {
                this.leaderboardScores.isContexed = false;
            }
            if (this.scoreValue < this.leaderboardScores.scores[0].score) {
                level = 2;
            } else if (this.scoreValue > this.leaderboardScores.scores[0].score * 2) {
                level = 0;
            }
            if (this.scoreValue < 5) {
                level = 3;
            }
            if (this.memScore < this.scoreValue) {
                this.memScore = this.scoreValue;
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
                const brickBehav = element.getComponent("brick");
                if (brickBehav.brickType === cfg.KEY.BRICK) {
                    this.addScore(element.getComponent("brickNormal").hp);
                }
                brickBehav.kaboom();
            }
        }
    },

    addOneLevel() {
        // move downward
        this.currentLevel += 1;
        console.log(this.currentLevel);
        let enlarge = false;
        if (this.currentLevel % cfg.PU_ENLARGE_GAP === 0) {
            enlarge = true;
        }
        let lowest = 1000;
        for (let i = 0; i < this.bricks.length; i++) {
            const element = this.bricks[i];
            element.runAction(cc.moveBy(0.00, cc.v2(0, -100)));
            if (element.y < lowest) {
                lowest = element.y
            }
        }
        if (lowest < -180) {
            this.gameEnd();
        }
        // add one layer
        let n = this.bricksPool[Math.floor(Math.random() * this.bricksPool.length)];
        const powerUp = this.powerupsPool[Math.floor(Math.random() * this.powerupsPool.length)];
        n -= powerUp;
        const pool = [];
        for (let i = 0; i < n; i++) {
            pool.push(1);
        }
        let alreadyPutBoom = false;
        for (let i = 0; i < powerUp; i++) {
            if (this.currentLevel > 15 && alreadyPutBoom === false) {
                if (Math.random() < cfg.PU_BOOM_PROB) {
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
        let halfed = false;
        for (let i = 0; i < 8; i++) {
            const index = Math.floor(Math.random() * pool.length);
            let brick = null;
            switch (pool[index]) {
                case 1: {
                    brick = this.instantiatePrefab(cfg.KEY.BRICK, this.levelContainer);
                    let hp = this.bullets.length * 0.75 + (this.maxBalls - this.bullets.length) * (this.currentLevel * 0.005);
                    if (doubled === false) {
                        if (Math.random() < 0.15) {
                            hp *= 2;
                            doubled = true;
                        }
                    }
                    if (doubled === false && halfed === false) {
                        let halfProb = this.bullets.length / this.maxBalls;
                        if (halfProb < 0.4) {
                            halfProb = 0.4;
                        }
                        if (Math.random() > halfProb) {
                            hp *= 0.5;
                            halfed = true;
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

    start() {
        this.fetchHighScore();
    },

    update(dt) {
        if (this.touchPressed === true && this.allSticked === true && this.state == "ready") {
            this.arrow.updateArrow(cc.v2(this.player.x, this.player.y), cc.v2(this.touchLoc.x - 360, this.touchLoc.y - 640));
        }
        if (this.scoreBuldge > 0) {
            this.scoreBuldge -= dt * dt * 150;
            if (this.scoreBuldge < 0) {
                this.scoreBuldge = 0;
            }
            this.score.node.scaleX = this.scoreBuldge + 1;
            this.score.node.scaleY = this.scoreBuldge + 1;
        }
        // tik tok effect
        if (this.tiktokTimer > 0) {
            this.tiktokTimer -= dt;
            if (this.tiktokTimer <= 0) {
                this.tiktok = true;
                this.tiktokFrame.opacity = 255;
                this.tiktokFrame.active = true;
                console.log("tiktok enabled");
            }
        }
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
            const dir = this.arrow.getDirection();
            dir.normalizeSelf().mulSelf(cfg.BULLET_SPEED + this.currentLevel * cfg.BULLET_SPEED_INC);
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].getComponent("bullet").launchIn(dir.x, dir.y, (i + 1) * cfg.BULLET_LAUNCH_INTV);
            }
            this.tiktokTimer = this.tiktokTime;
            this.allSticked = false;
            this.arrow.dismiss();
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
            if (count === this.bullets.length) {
                this.allSticked = true;
                if (this.gameRunning === true) {
                    this.addOneLevel();
                    // notif
                    if (this.tiktok) {
                        console.log("tiktok end");
                        const fadeout = cc.fadeOut(0.3);
                        const clearup = cc.callFunc(() => {
                            this.tiktokFrame.active = false;
                        })
                        this.tiktokFrame.runAction(cc.sequence(fadeout, clearup));
                    }
                    this.tiktokTimer = 0;
                    this.tiktok = false;
                }
            }
        }
    },

});
