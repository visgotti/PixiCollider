(function () { 'use strict';
    function getSqDist(p1, p2) {
        const dx = p1.x - p2.x,
            dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    }
    function getSqSegDist(p, p1, p2) {
        let x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y;
        if (dx !== 0 || dy !== 0) {
            const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2.x;
                y = p2.y;
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p.x - x;
        dy = p.y - y;
        return dx * dx + dy * dy;
    }
    function simplifyRadialDist(points, sqTolerance) {
        let prevPoint = points[0],
            newPoints = [prevPoint],
            point;
        for (let i = 1, len = points.length; i < len; i++) {
            point = points[i];
            if (getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) newPoints.push(point);

        return newPoints;
    }

    function simplifyDPStep(points, first, last, sqTolerance, simplified) {
        let maxSqDist = sqTolerance,
            index;
        for (let i = first + 1; i < last; i++) {
            const sqDist = getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }
        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    }
    // simplification using Ramer-Douglas-Peucker algorithm
    function simplifyDouglasPeucker(points, sqTolerance) {
        var last = points.length - 1;
        var simplified = [points[0]];
        simplifyDPStep(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);
        return simplified;
    }
    function simplify(points, tolerance, highestQuality) {
        if (points.length <= 2) return points;
        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
        points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
        points = simplifyDouglasPeucker(points, sqTolerance);
        return points;
    }
    function getRenderTextureOutlines(renderTexture, renderer) {
        const s = new PIXI.Sprite(renderTexture);
        let data = renderer.extract.pixels(s)
        const width = Math.ceil(renderTexture.width);
        const height = Math.ceil(renderTexture.height);
        const not_outline = [];
        const pixelsList = [];
        for (let j = 0; j < data.length; j = j + 4) {
            const alpha = data[j + 3];
            if(!alpha) continue;
            const current_alpha_index = j + 3;
            const top_alpha = data[current_alpha_index - (width * 4)];
            const bottom_alpha = data[current_alpha_index + (width * 4)];
            const left_alpha = data[current_alpha_index - 4];
            const right_alpha = data[current_alpha_index + 4];
            if ((top_alpha === undefined || top_alpha == 0) ||
                (bottom_alpha === undefined || bottom_alpha == 0) ||
                (left_alpha === undefined || left_alpha == 0) ||
                (right_alpha === undefined || right_alpha == 0)) {
                const xv = ((j / 4) % width);
                const yv =(parseInt((j / 4) / width));
                pixelsList.push({
                    x: xv,
                    y: yv,
                    color: (data[j] / 255, data[j + 1] / 255, data[j + 2] / 255),
                    alpha: data[j + 3] / 255
                });
            } else {
                not_outline.push(j);
            }
        }
        // Remove not-outline pixels
        for (let i = 0; i < not_outline.length; i++) {
            data[not_outline[i]] = 0;
            data[not_outline[i] + 1] = 0;
            data[not_outline[i] + 2] = 0;
            data[not_outline[i] + 3] = 0;
        }
        // no longer need the render texture.
        renderTexture.destroy(true);
        s.destroy(true);
        const lines = [];
        let line = [];
        let pixelAdded = true;
        let skipDiagonals = true;
        line.push(pixelsList[0]);
        pixelsList.splice(0, 1);
        while (pixelsList.length != 0) {
            if (!pixelAdded && !skipDiagonals) {
                lines.push(line);
                line = [];
                line.push(pixelsList[0]);
                pixelsList.splice(0, 1);
            } else if (!pixelAdded) {
                skipDiagonals = false;
            }
            pixelAdded = false;
            for (let i = 0; i < pixelsList.length; i++) {
                if ((skipDiagonals && (
                    line[line.length - 1].x + 1 == pixelsList[i].x && line[line.length - 1].y == pixelsList[i].y ||
                    line[line.length - 1].x - 1 == pixelsList[i].x && line[line.length - 1].y == pixelsList[i].y ||
                    line[line.length - 1].x == pixelsList[i].x && line[line.length - 1].y + 1 == pixelsList[i].y ||
                    line[line.length - 1].x == pixelsList[i].x && line[line.length - 1].y - 1 == pixelsList[i].y)) || (!skipDiagonals && (
                    line[line.length - 1].x + 1 == pixelsList[i].x && line[line.length - 1].y + 1 == pixelsList[i].y ||
                    line[line.length - 1].x + 1 == pixelsList[i].x && line[line.length - 1].y - 1 == pixelsList[i].y ||
                    line[line.length - 1].x - 1 == pixelsList[i].x && line[line.length - 1].y + 1 == pixelsList[i].y ||
                    line[line.length - 1].x - 1 == pixelsList[i].x && line[line.length - 1].y - 1 == pixelsList[i].y
                ))) {
                    line.push(pixelsList[i]);
                    pixelsList.splice(i, 1);
                    i--;
                    pixelAdded = true;
                    skipDiagonals = true;
                }
            }
        }
        lines.push(line);
        return lines;
    }
    class PixiCollider {
        static isTexture(obj) {return obj instanceof PIXI.Texture;}
        static fromTexture(texture, simplified, renderer) {
            return PixiCollider.fromDisplayObject(new PIXI.Sprite(texture), simplified, renderer);
        }
        static fromSprite(sprite, simplified, renderer) {return PixiCollider.fromDisplayObject(sprite, simplified, renderer);}
        static fromContainer(container, simplified, renderer) {
            return PixiCollider.fromDisplayObject(sprite, simplified, renderer);
        }
        static fromImage(imageData, simplified) {
            return PixiCollider.fromTexture(PIXI.Texture.from(imageData), simplified)
        }
        static fromDisplayObject(displayObject, simplified, renderer) {
            renderer = renderer || new PIXI.CanvasRenderer();
            const { x: boundX, y: boundY } = displayObject.getLocalBounds();

            let oldX = displayObject.x;
            let oldY = displayObject.y;
            const diffX = oldX + boundX;
            const diffY = oldY + boundY;

            displayObject.position.x= -Math.ceil(boundX);
            displayObject.position.y= -Math.ceil(boundY);
            const rt = PIXI.RenderTexture.create(displayObject.width+1, displayObject.height+1);
            renderer.render(displayObject, rt, true);
            const outlines = getRenderTextureOutlines(rt, renderer).map(line => {
                return line.map(s => {
                    return {
                        x: s.x+diffX,
                        y: s.y+diffY,
                    }
                })
            });
            displayObject.position.x = oldX;
            displayObject.position.y = oldY;
            return {
                outlines,
                simplified: simplified ? outlines.map(o => simplify(o, simplified, true)) : null
            }
        }
    }
    if (typeof define === 'function' && define.amd) define(function() { return PixiCollider; });
    else if (typeof module !== 'undefined') {
        module.exports = PixiCollider;
        module.exports.default = PixiCollider;
    } else if (typeof self !== 'undefined') self.PixiCollider = PixiCollider;
    else window.PixiCollider = PixiCollider;
})();