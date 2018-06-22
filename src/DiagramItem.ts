import UIContainer from './UIContainer';
import { ItemState } from './Common';
export default class DiagramItem extends UIContainer {
    _state; connectors = [];
    constructor() {
        super();
        this._state = ItemState.Normal;
    }

    move(offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
    }

    addConnector(child) {
        return this.insertConnector(-1, child);
    }

    insertConnector(index, child) {
        if (this.connectors.indexOf(child) >= 0) {
            child.parent = this;
            return child;
        }

        if (child.parent) child.parent.removeConnector(child);
        if (index < 0 || index >= this.connectors.length) this.connectors.push(child);
        else this.connectors.splice(index, 0, child);

        child.parent = this;
        return child;
    }

    removeConnector(child) {
        return this.removeConnectorAt(this.connectors.indexOf(child));
    }

    removeConnectorAt(index) {
        if (index < 0 || index > this.connectors.length - 1) return false;

        var child = this.connectors[index];
        if (child != null) {
            child.parent = null;
            if (child.attachTo) {
                child.attachTo.removeAttached(child);
            }
        }
        this.connectors.splice(index, 1);
        return true;
    }

    isDraggable() {
        return this._state == ItemState.Selected;
    }

    isSelected() {
        return this._state == ItemState.Selected;
    }

    getState() {
        return this._state;
    }

    stress(flag) {
        for (var i = 0; i < this.connectors.length; i++) {
            this.connectors[i].visible = flag;
        }
    }

    _onStateChanged(lastState) {
        var flag = (this._state == ItemState.Selected || this._state == ItemState.Hover);
        this.stress(flag);
    }

    onSelectedStateChanged(flag) {
        var s = flag ? ItemState.Selected : ItemState.Normal;
        if (s != this._state) {
            var last = this._state;
            this._state = s;
            this._onStateChanged(last);
        }
    }

    onHovered(flag) {
        if (this._state != ItemState.Selected) {
            var s = flag ? ItemState.Hover : ItemState.Normal;
            if (s != this._state) {
                var last = this._state;
                this._state = s;
                this._onStateChanged(last);
            }
        }
    }

    findConnector(x1, y1, x2, y2) {
        if (0 == x2 && 0 == y2) { //hit test
            var bak = this.children;
            this.children = this.connectors;
            var ct = null;
            this.parent.findElementsIn.call(this, x1 - 2, y1 - 2, 4, 4, function (child) {
                ct = child;
                return false;
            });
            this.children = bak;
            return ct;
        } else {   //find the near connector
            var distance = 0;
            var ret = null;
            x1 = x1 - this.x;
            y1 = y1 - this.y;

            for (var i = 0; i < this.connectors.length; i++) {
                var x = this.connectors[i].x - x1;
                var y = this.connectors[i].y - y1;
                x = x * x + y * y;
                if (x < distance || distance == 0) {
                    distance = x;
                    ret = this.connectors[i];
                }
            }
            return ret;
        }
    }

    paint(context) {
        for (var i = 0, len = this.connectors.length; i < len; i++) {
            var child = this.connectors[i];
            child._onPaint(context);
        }

        super.paint.call(this, context);
    }
}