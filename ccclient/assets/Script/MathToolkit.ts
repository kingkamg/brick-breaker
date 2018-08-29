export interface ICircle {
    x: number;
    y: number;
    r: number;
}

export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface IInterRes {
    point: cc.Vec2;
    tV: number;
}

export default class MathToolkit {

    public static almostEqual(a: number, b: number, precision: number): boolean {
        return (Math.abs(a - b) < precision);
    }

    public static circleOverlapRect(circle: ICircle, rect: IRect) {
        const distX: number = Math.abs(circle.x - rect.x);
        const distY: number = Math.abs(circle.y - rect.y);

        if (distX > (rect.w * 0.5 + circle.r)) { return false; }
        if (distY > (rect.h * 0.5 + circle.r)) { return false; }

        if (distX <= (rect.w * 0.5)) { return true; }
        if (distY <= (rect.h * 0.5)) { return true; }

        const distCornerSq = (distX - rect.w * 0.5) * (distX - rect.w * 0.5) + (distY - rect.h * 0.5) * (distY - rect.h * 0.5);
        return (distCornerSq <= (circle.r * circle.r));
    }

    /**
     * @author Peter Kelley, Nef.
     * @author pgkelley4@gmail.com
     * See if two line segments intersect. This uses the
     * vector cross product approach described below:
     * http://stackoverflow.com/a/565282/786339
     *
     * @param {cc.Vec2} p point object with x and y coordinates
     *  representing the start of the 1st line.
     * @param {cc.Vec2} p2 point object with x and y coordinates
     *  representing the end of the 1st line.
     * @param {cc.Vec2} q point object with x and y coordinates
     *  representing the start of the 2nd line.
     * @param {cc.Vec2} q2 point object with x and y coordinates
     *  representing the end of the 2nd line.
     */
    public static lineSegsIntersection(p: cc.Vec2, p2: cc.Vec2, q: cc.Vec2, q2: cc.Vec2): IInterRes {
        const r: cc.Vec2 = p2.sub(p);
        const s: cc.Vec2 = q2.sub(q);

        const uNumerator: number = q.sub(p).cross(r);
        const denominator: number = r.cross(s);

        if (uNumerator === 0 && denominator === 0) {
            // They are coLlinear

            // Do they touch? (Are any of the points equal?)
            if (p.equals(q) || p.equals(q2)) { return {point: p.clone(), tV: 0}; }
            if (p2.equals(q) || p2.equals(q2)) { return {point: p2.clone(), tV: 1}; }
            // Do they overlap? (Are all the point differences in either direction the same sign)
            if (!MathToolkit.allEqual((q.x - p.x < 0), (q.x - p2.x < 0), (q2.x - p.x < 0), (q2.x - p2.x < 0)) || !MathToolkit.allEqual((q.y - p.y < 0), (q.y - p2.y < 0), (q2.y - p.y < 0), (q2.y - p2.y < 0))) {
                const minx: number = Math.min(p.x, p2.x, q.x, q2.x);
                const maxx: number = Math.max(p.x, p2.x, q.x, q2.x);
                if (minx < p.x && p.x < maxx) { return {point: p.clone(), tV: 0}; }
                if (minx < p2.x && p2.x < maxx) { return {point: p2.clone(), tV: 1}; }
                if (minx < q.x && q.x < maxx) { return {point: q.clone(), tV: 0}; }
                if (minx < q2.x && q2.x < maxx) { return {point: q2.clone(), tV: 1}; }
            } else {
                return null;
            }
        }

        if (denominator === 0) {
            // lines are paralell
            return null;
        }

        const u: number = uNumerator / denominator;
        const t: number = q.sub(p).cross(s) / denominator;
        if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
            r.mulSelf(t).addSelf(p);
            return {point: r, tV: t};
        } else {
            return null;
        }
    }

    private static allEqual(b1: boolean, b2: boolean, b3: boolean, b4: boolean) {
        return ((b1 === b2) && (b2 === b3) && (b3 === b4));
    }

}
