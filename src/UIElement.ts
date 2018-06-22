import Point from './Point'
import Events from './Events';
import Diagram from './Diagram';
export default class UIElement {
    static __hitTestTolerance = 50;
    static __hitTestContext;
    _events: Events = new Events();
    _easyHit;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    visible = true;
    parent = null;
    _onPaint(context, isLocal) {
        if (!this.visible) return;
        context.save();
        if (!isLocal) context.translate(this.x, this.y);
        this.paint(context);
        context.restore();
    }
    paint(context) { }
    pointToGlobal(x, y) {
        var X = this.x + x;
        var Y = this.y + y;
        var p = this.parent;
        while (p != null) {
            X += p.x;
            Y += p.y;
            p = p.parent;
        }
        return new Point(X, Y);
    }
    pointToLocal(x, y) {
        var X = x - this.x;
        var Y = y - this.y;
        var p = this.parent;
        while (p != null) {
            X -= p.x;
            Y -= p.y;
            p = p.parent;
        }
        return new Point(X, Y);
    }
    testInRect(x, y, width, height, isLocal) {
        if (isLocal) {
            x -= this.x;
            y -= this.y;
        } else {
            var p = this.pointToLocal(x, y);
            x = p.x;
            y = p.y;
        }

        return this._testInRect(x, y, width, height);
    }
    _testInRect(x, y, width, height) {
        if (this.width > 0 && this.height > 0) { //Rectangle
            return x <= this.width && y <= this.height && x + width >= 0 && y + height >= 0;
        }

        //not Rectangle!!
        var context = UIElement.__hitTestContext;
        if (this._easyHit && 1 == width && 1 == height) { //point hit test, make to select element easily
            context.canvas.width = context.canvas.height = width = height = 4;
            context.setTransform(1, 0, 0, 1, -x + 2, -y + 2);
        } else {
            context.canvas.width = width;
            context.canvas.height = height;
            context.setTransform(1, 0, 0, 1, -x, -y);
        }

        this._onPaint(context, true);
        try {
            var data = context.getImageData(0, 0, width, height).data;
            for (var j = 3; j < data.length; j += 4) {
                if (data[j] > UIElement.__hitTestTolerance) return true;
            }
        } catch (e) { }

        context.canvas.width = 0;
        context.canvas.width = 1;
        return false;
    }
    getDiagram(): Diagram {
        var p = this;
        while (p) {
            if (p instanceof Diagram) return p;
            p = p.parent;
        }
    }
    copy() {
        return this;
    }
}