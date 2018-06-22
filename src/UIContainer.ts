import UIElement from './UIElement';
export default class UIContainer extends UIElement {
    children = [];
    constructor() {
        super();
        this.children = [];
    }
    paint(context) {
        var count = this.children.length;
        for (var i = 0; i < count; i++) {
            this.children[i]._onPaint(context);
        }
    }
    findElementsIn(x, y, width, height, handler) {
        var ret: any = [];

        x -= this.x;
        y -= this.y;

        for (var i = this.children.length - 1; i >= 0; i--) {
            var child = this.children[i];
            if (child == null || !child.visible) continue;

            if ((child instanceof UIContainer) && child.children.length > 0) {
                var objs = child.findElementsIn(x, y, width, height, handler);
                if (objs && objs.length > 0) {
                    if (handler) {
                        if (!handler(objs)) return false;
                        ret = true;
                    } else {
                        ret = ret.concat(objs);
                    }
                } else if (objs === false) {
                    return false;
                }
            }

            if (child.testInRect(x, y, width, height, true)) {
                if (handler) {
                    if (!handler(child)) return false;
                    ret = true;
                } else {
                    ret.push(child);
                }
            }
        }

        return ret;
    }
    insertChild(index, child) {
        if (this.children.indexOf(child) >= 0) return child;
        if (child.parent) child.parent.removeChild(child);

        child.parent = this;
        if (index < 0 || index >= this.children.length) this.children.push(child);
        else this.children.splice(index, 0, child);

        if (this._events) {
            this._events.trigger('onAdded', child);
        }
        return child;
    }
    addChild(child) {
        return this.insertChild(-1, child);
    }
    removeChild(child) {
        var index = this.children.indexOf(child);
        if (index < 0 || index > this.children.length - 1) return false;

        this.children[index].parent = null;
        this.children.splice(index, 1);
        if (this._events) {
            this._events.trigger('onRemoved', child);
        }
        return true;
    }
    removeAllChildren() {
        for (var i = this.children.length - 1; i >= 0; i--) {
            this.children[i].parent = null;
        }
        this.children.splice(0);
    }
}