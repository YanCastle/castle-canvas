import DashedLine from './Utils';
import { ConnectorType } from './Common';
import LineConnector from './LineConnector';
export default class RightAngleDrager {
    newX = 0;
    newY = 0;
    newX2 = 0;
    newY2 = 0;
    preX = 0;
    preY = 0;
    nextX = 0;
    nextY = 0;
    preMoveType = 0;
    nextMoveType = 0;
    ct; pre; next; lastY; lastMoveX; lastMoveY; lastX;
    _dashLine = new DashedLine();

    _init() {
        this.preMoveType = 0;
        this.nextMoveType = 0; //0:can not be moved  1:move in horizontal line   2: move in virtical line

        if (this.ct.type == ConnectorType.Endpoint) {
        } else if (this.ct.type == ConnectorType.RightAngle) {
            if (this.pre == null || this.next == null) return;
            if (this.pre.attachTo == null) {
                if (this.lastY == this.pre.y) this.preMoveType = 2;
                else this.preMoveType = 1;
            }
            if (this.next.attachTo == null) {
                if (this.lastY == this.next.y) this.nextMoveType = 2;
                else this.nextMoveType = 1;
            }
        } else if (this.ct.type == ConnectorType.Middle) {
            if (this.pre != null && this.next != null) {
                if (this.pre.y == this.next.y) {
                    this.preMoveType = 2;
                    this.nextMoveType = 2;
                } else {
                    this.preMoveType = 1;
                    this.nextMoveType = 1;
                }
            }
        }

        if (this.pre != null) {
            this.newX = this.preX = this.pre.x;
            this.newY = this.preY = this.pre.y;
        }
        if (this.next != null) {
            this.newX2 = this.nextX = this.next.x;
            this.newY2 = this.nextY = this.next.y;
        }
    }

    paint(context) {
        context.strokeStyle = 'black';
        this._dashLine.context = context;
        context.beginPath();

        if (this.ct.type == ConnectorType.Endpoint) {
        } else if (this.ct.type == ConnectorType.RightAngle) {
            if (this.preMoveType != 0) {
                this._dashLine.moveTo(this.preX, this.preY);
                this._dashLine.lineTo(this.lastMoveX, this.lastMoveY);
                if (this.nextMoveType != 0) {
                    this._dashLine.lineTo(this.nextX, this.nextY);
                    this._dashLine.moveTo(this.lastMoveX, this.lastMoveY);
                }
                this._dashLine.lineTo(this.lastX, this.lastY);
            } else if (this.nextMoveType != 0) {
                this._dashLine.moveTo(this.nextX, this.nextY);
                this._dashLine.lineTo(this.lastMoveX, this.lastMoveY);
                this._dashLine.lineTo(this.lastX, this.lastY);
            }
        } else if (this.ct.type == ConnectorType.Middle) {
            //connectors trace
            this._dashLine.moveTo(this.lastMoveX, this.lastMoveY);
            this._dashLine.lineTo(this.lastX, this.lastY);

            //new line
            this._dashLine.moveTo(this.newX, this.newY);
            this._dashLine.lineTo(this.newX2, this.newY2);

            //pre:old point and new point
            if (this.pre.attachTo != null
                || this.pre.type != ConnectorType.Endpoint) {
                this._dashLine.moveTo(this.pre.x, this.pre.y);
                this._dashLine.lineTo(this.newX, this.newY);
            }

            //next:old point and new point
            if (this.next.attachTo != null
                || this.next.type != ConnectorType.Endpoint) {
                this._dashLine.moveTo(this.next.x, this.next.y);
                this._dashLine.lineTo(this.newX2, this.newY2);
            }
        }

        context.stroke();
    }

    move(x, y) {
        this.lastMoveX = this.lastMoveX + x;
        this.lastMoveY = this.lastMoveY + y;

        if (this.ct.type == ConnectorType.Endpoint) {
        } else if (this.ct.type == ConnectorType.RightAngle) {
            this._onRightAngleMove();
        } else if (this.ct.type == ConnectorType.Middle) {
            this._onMiddleMove();
        } else {
            return;
        }
    }

    _onMiddleMove() {
        this.newX = this.pre.x;
        this.newY = this.pre.y;

        if (this.preMoveType == 1) this.newX = this.lastMoveX;
        else this.newY = this.lastMoveY;

        if (this.pre.attachTo == null) {
            if (this.preMoveType == 1) this.preX = this.lastMoveX;
            else this.preY = this.lastMoveY;
        }

        this.newX2 = this.next.x;
        this.newY2 = this.next.y;

        if (this.nextMoveType == 1) this.newX2 = this.lastMoveX;
        else this.newY2 = this.lastMoveY;

        if (this.next.attachTo == null) {
            if (this.nextMoveType == 1) this.nextX = this.lastMoveX;
            else this.nextY = this.lastMoveY;
        }
    }

    _onRightAngleMove() {
        if (this.preMoveType == 1) {
            this.preX = this.lastMoveX;
        } else if (this.preMoveType == 2) {
            this.preY = this.lastMoveY;
        } else {
            if (this.lastX == this.pre.x) this.lastMoveX = this.lastX;
            else this.lastMoveY = this.lastY;
        }

        if (this.nextMoveType == 1) {
            this.nextX = this.lastMoveX;
        } else if (this.nextMoveType == 2) {
            this.nextY = this.lastMoveY;
        } else {
            if (this.lastX == this.next.x) this.lastMoveX = this.lastX;
            else this.lastMoveY = this.lastY;
        }
    }

    commit() {
        if (this.ct == null) return;

        var cn = this.ct.parent;
        cn._connectorDrager = null;

        var i = cn.connectors.indexOf(this.ct);
        if (i < 0) return;

        if (this.ct.type == ConnectorType.Endpoint) {
        } else if (this.ct.type == ConnectorType.RightAngle) {
            if (this.preMoveType != 0) {
                this.pre.x = this.preX;
                this.pre.y = this.preY; //change pre-point
            }
            if (this.nextMoveType != 0) {
                this.next.x = this.nextX;
                this.next.y = this.nextY; //change next-point
            }
        } else if (this.ct.type == ConnectorType.Middle) {
            if (this.preMoveType == 0) return;

            this.pre.x = this.preX;
            this.pre.y = this.preY;
            this.next.x = this.nextX;
            this.next.y = this.nextY;

            if (this.next.attachTo != null) {
                cn.insertConnector(i + 1, new LineConnector(this.newX2, this.newY2, ConnectorType.RightAngle));
            }
            if (this.pre.attachTo != null) {
                cn.insertConnector(i, new LineConnector(this.newX, this.newY, ConnectorType.RightAngle));
            }
        }

        this.ct.x = this.lastMoveX;
        this.ct.y = this.lastMoveY;

        cn.adjust();
    }

    cancel() {
        if (this.ct == null) return;
        //ct._connectorDrager = null;
        this.ct.parent._connectorDrager = null;
        this.ct = null;
    }

    movable() { return this.preMoveType != 0 || this.nextMoveType != 0; }

    static beginDrag(ct) {
        if (ct == null || ct.type == ConnectorType.Endpoint
            || ct.type == ConnectorType.Attachable) {
            return null;
        }

        var cts = ct.parent.connectors;
        var idx = cts.indexOf(ct);
        if (idx < 0) return null;

        var step = 0;
        if (ct.type == ConnectorType.RightAngle) {
            step = 2;
        } else if (ct.type == ConnectorType.Middle) {
            step = 1;
        } else return null;

        var pre = null, next = null;
        var i = idx - step;
        if (i < 0 || i >= cts.length) return;
        pre = cts[i];

        i = idx + step;
        if (i < 0 || i >= cts.length) return;
        next = cts[i];

        //if (next == null && pre == null) return null;

        var ret = new RightAngleDrager();
        ret.ct = ct;
        ret.next = next;
        ret.pre = pre;

        ret.lastX = ct.x;
        ret.lastY = ct.y;
        ret.lastMoveX = ct.x;
        ret.lastMoveY = ct.y;

        ret._init();

        if (ct.parent._connectorDrager != null) {
            ct.parent._connectorDrager.cancel();  //it is abnormal!!
        }
        ct.parent._connectorDrager = ret;

        return ret;
    }
}