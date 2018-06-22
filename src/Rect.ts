export default class Rect {
    x; y; width; height;
    constructor(x1, y1, x2, y2) {
        this.x = x2 >= x1 ? x1 : x2;
        this.y = y2 >= y1 ? y1 : y2;
        this.width = Math.abs(x2 - x1);
        this.height = Math.abs(y2 - y1);
    }
}