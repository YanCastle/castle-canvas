import UIElement from './UIElement';
import { ItemState, AttachType, ConnectorType } from './Common';
import Point from './Point';
export default class Connector extends UIElement {
    /*static members*/
    static width: 4
    static strokeStyle: 'rgba(175,175,170,255)'
    static fillStyle: 'rgba(0, 255, 0,255)'
    static stressdBrush: 'red'
    type; draggable; attachable; attachTo; _state
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.type = ConnectorType.Attachable;
        this.visible = false;
        this.draggable = true;
        this.attachable = AttachType.Both;
        this.attachTo = null;
        this._state = ItemState.Normal;
    }

    getState() { return this._state; }

    onHovered(flag) {
        this._state = (flag && this.visible ? ItemState.Hover : ItemState.Normal);
    }

    canAttached(ct) {
        if (this.attachable == AttachType.None || ct == null
            || ct.type != ConnectorType.Endpoint) {
            return false;
        }

        if (this.attachable == AttachType.Both) return true;

        var isOut = ct.isStartPoint();
        if ((isOut && this.attachable == AttachType.Out)
            || (!isOut && this.attachable == AttachType.In)) {
            return true;
        }

        return false;
    }

    onSelectedStateChanged(flag) {
        this.visible = flag;
    }
    stress(flag) { }
    beginDrag() { return null; }
    getPoint() { return new Point(this.parent.x + this.x, this.parent.y + this.y); }

}