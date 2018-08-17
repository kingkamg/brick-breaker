export default class MathToolkit {

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
    public static lineSegsIntersection(p: cc.Vec2, p2: cc.Vec2, q: cc.Vec2, q2: cc.Vec2): cc.Vec2 {
        const r: cc.Vec2 = p2.sub(p);
        const s: cc.Vec2 = q2.sub(q);

        const uNumerator: number = q.sub(p).cross(r);
        const denominator: number = r.cross(s);

        if (uNumerator === 0 && denominator === 0) {
            // They are coLlinear

            // Do they touch? (Are any of the points equal?)
            if (MathToolkit.equalPoints(p, q) || MathToolkit.equalPoints(p, q2)) { return p.clone(); }
            if (MathToolkit.equalPoints(p2, q) || MathToolkit.equalPoints(p2, q2)) { return p2.clone(); }
            // Do they overlap? (Are all the point differences in either direction the same sign)
            if (!MathToolkit.allEqual((q.x - p.x < 0), (q.x - p2.x < 0), (q2.x - p.x < 0), (q2.x - p2.x < 0)) || !MathToolkit.allEqual((q.y - p.y < 0), (q.y - p2.y < 0), (q2.y - p.y < 0), (q2.y - p2.y < 0))) {
                const minx: number = Math.min(p.x, p2.x, q.x, q2.x);
                const maxx: number = Math.max(p.x, p2.x, q.x, q2.x);
                if (minx < p.x && p.x < maxx) { return p.clone(); }
                if (minx < p2.x && p2.x < maxx) { return p2.clone(); }
                if (minx < q.x && q.x < maxx) { return q.clone(); }
                if (minx < q2.x && q2.x < maxx) { return q2.clone(); }
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
            return r;
        } else {
            return null;
        }
    }

    private static equalPoints(point1: cc.Vec2, point2: cc.Vec2) {
        return ((point1.x === point2.x) && (point1.y === point2.y));
    }

    private static allEqual(b1: boolean, b2: boolean, b3: boolean, b4: boolean) {
        return ((b1 === b2) && (b2 === b3) && (b3 === b4));
    }

}
