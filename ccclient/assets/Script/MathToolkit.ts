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

    public static calculateContactInfo(collider: cc.Collider, startPoint: cc.Vec2, endedPoint: cc.Vec2, radius: number): { move, normal } {
        if (collider instanceof cc.BoxCollider || collider instanceof cc.PolygonCollider) {
            const polygon: cc.Vec2[] = collider.world.points;
            console.log(polygon);
            if (cc.Intersection.pointInPolygon(startPoint, polygon)) {
                cc.error(">>>>>>>>>>>>>>>>>>> why start point in polygon:  ", collider.name);
                cc.log("============================", startPoint, endedPoint, collider);
            }
            return this.calculateNearstContact(polygon, startPoint, endedPoint, radius, collider.tag !== 0);
        } else if (collider instanceof cc.CircleCollider) {
            const center: cc.Vec2 = collider.world.position;
            const centerOffset: cc.Vec2 = center.sub(startPoint);
            const distance2: number = centerOffset.magSqr();
            const radiusSum2: number = Math.pow(radius + collider.radius, 2);
            if (distance2 <= radiusSum2) {
                return {
                    move: 0,
                    normal: collider.tag === 0 ? cc.Vec2.ZERO : centerOffset.normalize(),
                };
            } else {
                let normal: cc.Vec2 = cc.Vec2.ZERO;
                const cdis: number = cc.Intersection.pointLineDistance(center, startPoint, endedPoint, false);
                // let angle: number = offset.angle(centerOffset)
                // move = Math.sqrt(radiusSum2 - distance2 * Math.pow(Math.sin(angle), 2)) + Math.cos(angle) * Math.sqrt(distance2)
                const cdis2: number = cdis * cdis;
                const move: number = Math.sqrt(distance2 - cdis2) - Math.sqrt(radiusSum2 - cdis2);
                if (collider.tag !== 0) {
                    const offset: cc.Vec2 = endedPoint.sub(startPoint);
                    const dp: cc.Vec2 = offset.normalize().mul(move).add(startPoint);
                    normal = dp.sub(center).normalize();
                }
                return { move, normal };
            }
        }
    }

    public static calculateNearstContact(polygon: cc.Vec2[], startPoint: cc.Vec2, endedPoint: cc.Vec2, radius: number, calculateNormal: boolean): { move, normal } {
        const contatInfoList: Array<{ move, normal }> = [];
        const moffset: cc.Vec2 = endedPoint.sub(startPoint);
        for (let i = 0, l = polygon.length; i < l; i++) {
            let start = i === 0 ? polygon[polygon.length - 1] : polygon[i - 1];
            let end = polygon[i];

            const loffset: cc.Vec2 = end.sub(start);
            let radian: number = loffset.angle(moffset);
            if (radian > Math.PI / 2) {
                // swap start and end point
                radian = Math.PI - radian;
                loffset.negSelf();
                const temp = start;
                start = end;
                end = temp;
            }

            const sinval: number = Math.sin(radian);
            const cosval: number = Math.cos(radian);
            const startVDistance: number = cc.Intersection.pointLineDistance(start, startPoint, endedPoint, false);
            const endedVDistance: number = cc.Intersection.pointLineDistance(end, startPoint, endedPoint, false);
            if (startVDistance / cosval >= radius) {
                // 判断是否相交或相切
                let cross: boolean = false;
                if (cc.Intersection.lineLine(start, end, startPoint, endedPoint)) {
                    cross = true;
                } else {
                    if (endedVDistance / cosval < radius) {
                        cross = true;
                    } else {
                        const ended2VlineDistance: number = cc.Intersection.pointLineDistance(endedPoint, start, end, false);
                        const ended2NlineDistance: number = cc.Intersection.pointLineDistance(endedPoint, start, end, true);
                        if (ended2VlineDistance <= radius && ended2NlineDistance === ended2VlineDistance) {
                            cross = true;
                        }
                    }
                }
                if (cross) {
                    // 相交相切
                    const distance: number = cc.Intersection.pointLineDistance(startPoint, start, end, false);
                    const move: number = (distance - radius) / sinval;
                    let normal: cc.Vec2 = cc.Vec2.ZERO;
                    if (calculateNormal) {
                        const sin: number = Math.sin(moffset.signAngle(loffset));
                        if (sin < 0) {
                            normal = loffset.rotate(-Math.PI / 2).normalize();
                        } else if (sin > 0) {
                            normal = loffset.rotate(Math.PI / 2).normalize();
                        }
                    }
                    contatInfoList.push({ move, normal });
                    continue;
                }
            }

            const startDistance: number = cc.Intersection.pointLineDistance(start, startPoint, endedPoint, true);
            if (startDistance < radius) {
                // 与前点相触
                const dsqr: number = startVDistance * startVDistance;
                const move: number = Math.sqrt(start.sub(startPoint).magSqr() - dsqr) - Math.sqrt(radius * radius - dsqr);
                let normal: cc.Vec2 = cc.Vec2.ZERO;
                if (calculateNormal && startVDistance !== radius) {
                    const targetPos: cc.Vec2 = moffset.normalize().mul(move).add(startPoint);
                    normal = targetPos.sub(start).normalize();
                }
                contatInfoList.push({ move, normal });
                continue;
            }

            const endedDistance: number = cc.Intersection.pointLineDistance(end, startPoint, endedPoint, true);
            if (endedDistance < radius) {
                // 与后点相触
                const dsqr: number = endedVDistance * endedVDistance;
                const move: number = Math.sqrt(end.sub(startPoint).magSqr() - dsqr) - Math.sqrt(radius * radius - dsqr);
                let normal: cc.Vec2 = cc.Vec2.ZERO;
                if (calculateNormal && endedVDistance !== radius) {
                    const targetPos: cc.Vec2 = moffset.normalize().mul(move).add(startPoint);
                    normal = targetPos.sub(end).normalize();
                }
                contatInfoList.push({ move, normal });
                continue;
            }
        }

        if (contatInfoList.length <= 0) {
            return { move: 0, normal: cc.Vec2.ZERO };
        }
        // console.log('=====================', startPoint, endedPoint, '\n===polygon====', polygon, '\n==== list ====', contatInfoList)
        let move0: number = 0;
        const normal0: cc.Vec2 = new cc.Vec2(0, 0);
        contatInfoList.sort((a, b) => a.move - b.move);
        for (let i = 0; i < contatInfoList.length; i++) {
            const info = contatInfoList[i];
            if (info.move > move0 && !normal0.equals(cc.Vec2.ZERO)) {
                break;
            }
            move0 = info.move;
            normal0.addSelf(info.normal);
        }
        if (!normal0.equals(cc.Vec2.ZERO)) {
            normal0.normalizeSelf();
        }
        return { move: move0, normal: normal0 };
    }

    private static equalPoints(point1: cc.Vec2, point2: cc.Vec2) {
        return ((point1.x === point2.x) && (point1.y === point2.y));
    }

    private static allEqual(b1: boolean, b2: boolean, b3: boolean, b4: boolean) {
        return ((b1 === b2) && (b2 === b3) && (b3 === b4));
    }

}
