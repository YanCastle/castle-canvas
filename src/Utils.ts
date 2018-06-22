export default class DashedLine {
    context;
    dashArray;
    lastX;
    lastY;
    constructor(dashArray?, context?) {
        this.context = context;
        this.dashArray = dashArray;
        this.lastX = this.lastY = -1;
    }
    moveTo(x, y) {
        this.lastX = x;
        this.lastY = y;
    }
    lineTo(x, y) {
        let dashCount = this.dashArray.length;
        let dx = (x - this.lastX), dy = (y - this.lastY);
        if (0 == dx) var slope = 0;
        else var slope = dy / dx;
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0, draw = true;

        this.context.moveTo(this.lastX, this.lastY);

        while (distRemaining >= 0.1) {
            var dashLength = this.dashArray[dashIndex++ % dashCount];
            if (dashLength > distRemaining) dashLength = distRemaining;
            var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));

            if (0 != dx) {
                var signal = (x > this.lastX ? 1 : -1);
                this.lastX += xStep * signal;
                this.lastY += slope * xStep * signal;
            } else {
                var signal = (y > this.lastY ? 1 : -1);
                this.lastY += xStep * signal;
            }

            this.context[draw ? 'lineTo' : 'moveTo'](this.lastX, this.lastY);
            distRemaining -= dashLength;
            draw = !draw;
        }

        this.lastX = x;
        this.lastY = y;
    }
}