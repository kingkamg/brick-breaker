cc.Class({
    extends: cc.Component,

    properties: {
        block: {
            default: null,
            type: cc.Prefab
        },
        blocks: {
            default: [],
            type: [cc.Node]
        },
        level: {
            default: null,
            type: cc.Node
        },
        rows: 5,
        cols: 5,
        gap: 190,
        rotationSpeed: 1,
        rhythm: 0.7,
        rotationBeats: 8,
        flipSizeBeats: 4,
        bulgeOnceBeats: 1,
    },

    onLoad () {
        this.rotate = 0;
        this.rotationSum = 0;
        this.flipSizeSum = 0;
        this.bulgeSum = 0;
        let i = 0;
        for (let r = -this.rows; r <= this.rows; r++) {
            for (let c = -this.cols; c <= this.cols; c++) {
                const brick = cc.instantiate(this.block);
                this.level.addChild(brick);
                brick.x = this.node.x + this.gap * r;
                brick.y = this.node.y + this.gap * c;
                this.blocks.push(brick);
                if (i % 2 == 1) {
                    brick.getComponent("animeBlock").setScale(0.5);
                }
                i += 1;
            }
        }
    },

    update (dt) {
        this.rotate += dt;
        let angle = (this.rotate * this.rotationSpeed) % 360;
        this.level.rotation = angle;

        this.rotationSum += dt;
        if (this.rotationSum > this.rhythm * this.rotationBeats) {
            this.rotationSum -= this.rhythm * this.rotationBeats;
            for (let i = 0; i < this.blocks.length; i++) {
                const element = this.blocks[i];
                if (i % 2 == 1) {
                    element.getComponent("animeBlock").initiateSpin();
                }
            }
        }

        this.flipSizeSum += dt;
        if (this.flipSizeSum > this.rhythm * this.flipSizeBeats) {
            this.flipSizeSum -= this.rhythm * this.flipSizeBeats;
            for (let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].getComponent("animeBlock").flipSize();
            }
        }

        this.bulgeSum += dt;
        if (this.bulgeSum > this.rhythm * this.bulgeOnceBeats) {
            this.bulgeSum -= this.rhythm * this.bulgeOnceBeats;
            for (let i = 0; i < this.blocks.length; i++) {
                this.blocks[i].getComponent("animeBlock").bulgeOnce();
            }
        }
    },
});
