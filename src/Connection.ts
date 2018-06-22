import DiagramItem from './DiagramItem';
import { LineType, ConnectorType, ItemState } from './Common';
import Point from './Point';
import LineConnector from './LineConnector';
import Shape from './Sharp';
import ConvertConnectionCommand from './Command/ConvertConnectionCommand';
export default class Connection extends DiagramItem {
    points; type; strokeStyle; _connectorDrager;
    constructor(points, type) {
        if (points == null || points.lenght < 2) {
            throw Error("new Connection:illegal arguments!");
        }

        super();
        this.points = points;
        if (!type) this.type = LineType.RightAngle;
        else this.type = type;

        this.strokeStyle = 'black';
        this._connectorDrager = null;
        this._easyHit = true;  //make to select connection easily

        this._init();
    }

    getPointsString() {
        var points = this.points;
        if (this.connectors.length <= 0 && points.length <= 2) return '';

        if (this.connectors.length > 0) {
            var points: any = [];
            for (var i = 0; i < this.connectors.length; i++) {
                var ct = this.connectors[i];
                if (ct.type == ConnectorType.Endpoint
                    || ct.type == ConnectorType.RightAngle) {
                    points.push(new Point(ct.x, ct.y));
                }
            }
            this.points = points;
        }

        if (points.length <= 2) return '';

        var p1 = points[0], p2 = points[1], p3 = null;
        var s = '';
        var len = null;
        for (var i = 2; i < points.length; i++) {
            p3 = points[i]
            if (p1.x == p2.x) {
                if (p1.y == p2.y) {
                    p1 = p2;
                    p2 = p3;
                    continue;
                }

                if (len !== null) {
                    s = s + (len + ',');
                    len = null;
                }
                s = s + 'v';
                len = p2.y - p1.y;
            } else {
                if (len !== null) {
                    s = s + (len + ',');
                    len = null;
                }
                s = s + 'h';
                len = p2.x - p1.x;
            }

            p1 = p2;
            p2 = p3;
        }

        return s;
    }

    _init() {
        /*check points*/
        var isAngle = (LineType.RightAngle == this.type);
        var pre = this.points[0];
        var i = 1;
        while (i < this.points.length - 1) {
            var current = this.points[i];
            if (isAngle) {
                if (i == this.points.length - 2) {
                    var mTo = this.points[this.points.length - 1];
                    if (mTo.x != current.x && mTo.y != current.y) {
                        if (pre.x != current.x && mTo.y != current.y) {
                            if (Math.abs(pre.x - mTo.x) < Math.abs(pre.y - mTo.y)) {
                                current = new Point(mTo.x, pre.y);
                            }
                            else {
                                current = new Point(pre.x, mTo.y);
                            }
                        }
                    }
                } else if (current.x != pre.x && current.y != pre.y) {
                    if (Math.abs(current.x - pre.x) <= Math.abs(current.y - pre.y)) {
                        current.x = pre.x;
                    } else {
                        current.y = pre.y;
                    }
                }

                this.points[i] = current;
            }

            if (current.x == pre.x && current.y == pre.y) {
                //it is no use!
                this.points.splice(i, 1);
                continue;
            } else {
                pre = current;
                if (i >= 2) {
                    var first = this.points[i - 2];
                    var second = this.points[i - 1];
                    if (((first.x == second.x) && (second.x == current.x))  //in one horizontal line
                        || ((first.y == second.y) && (second.y == current.y))) {
                        this.points.splice(i - 1, 1);  //it is no use!
                        continue;
                    }
                }
            }

            i++;
        }
    }

    _createConnectors() {
        var isAngle = (LineType.RightAngle == this.type);
        for (var i = 0; i < this.points.length; i++) {
            if (isAngle && i > 0) {
                this.addConnector(new LineConnector((this.points[i].x + this.points[i - 1].x) / 2,
                    (this.points[i].y + this.points[i - 1].y) / 2,
                    ConnectorType.Middle
                ));
            }

            if (i == 0 || i == this.points.length - 1) {
                this.addConnector(new LineConnector(this.points[i].x, this.points[i].y, ConnectorType.Endpoint));
            } else {
                this.addConnector(new LineConnector(this.points[i].x, this.points[i].y, ConnectorType.RightAngle));
            }
        }
    }

    paint(context) {
        //connectors
        if (this.connectors.length <= 0) {
            this._createConnectors();
        } else {
            //adjust?
        }

        if (this.connectors.length < 2) return;

        //draw line
        context.strokeStyle = this.strokeStyle;
        context.beginPath();
        context.moveTo(this.connectors[0].x, this.connectors[0].y);  //first point

        if (2 == this.connectors.length) {
            //it is only a Straight line
            context.lineTo(this.connectors[1].x, this.connectors[1].y);
        } else {
            for (var i = 1; i < this.connectors.length; i++) {
                if (this.connectors[i].type == ConnectorType.Middle) continue;
                context.lineTo(this.connectors[i].x, this.connectors[i].y);
            }
        }

        //draw the Arrow
        this._createArrow(context);

        context.stroke();

        if (this._connectorDrager != null) {
            this._connectorDrager.paint(context);
        }

        super.paint.call(this, context);
    }

    _onStateChanged(lastState) {
        if (this._state == ItemState.Selected
            || lastState == ItemState.Selected) {
            var childVisible = this._state == ItemState.Selected;
            for (var i = 0; i < this.connectors.length; i++) {
                this.connectors[i].visible = childVisible;
            }
        }

        if (this._state == ItemState.Selected
            || this._state == ItemState.Hover) {
            this.strokeStyle = 'blue';
        } else {
            this.strokeStyle = 'black';
        }
    }

    draggable() {
        if (this._state == ItemState.Selected) {
            if (this.connectors.length >= 2) {
                var from = this.connectors[0].attachTo;
                var to = this.connectors[this.connectors.length - 1].attachTo;
                if ((from != null && !from.parent.isSelected())
                    || (to != null && !to.parent.isSelected())) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    move(x, y) {
        if (!this.draggable()) return;

        for (var i = 0; i < this.connectors.length; i++) {
            var ct = this.connectors[i];
            ct.x += x;
            ct.y += y;
        }
    }

    getStartShape() {
        if (this.connectors && this.connectors.length > 0) {
            var ct = this.connectors[0].attachTo;
            if (ct && ct.parent instanceof Shape) {
                return ct.parent;
            }
        }
        return null;
    }
    getEndShape() {
        if (this.connectors && this.connectors.length > 1) {
            var ct = this.connectors[this.connectors.length - 1].attachTo;
            if (ct && ct.parent instanceof Shape) {
                return ct.parent;
            }
        }
        return null;
    }

    convert(type) {
        if (type === this.type || this.connectors.length <= 0) return;

        var diagram = this.getDiagram();
        if (diagram) {
            var cmd = new ConvertConnectionCommand(this);
            diagram.undoManager.addCommand(cmd);
            cmd.redo();
        }
    }

    adjust() {
        if (this.connectors.length < 2) return;
        var isAngle = (LineType.RightAngle == this.type);
        var pre = this.connectors[0];

        var step = 1, i = 1;
        if (isAngle) step++;  //ingore middle connector
        while (i < this.connectors.length) {
            var current = this.connectors[i];
            //force to make a Right Angle Line? 
            if (isAngle) {
                if (current.type == ConnectorType.Middle) {
                    i++;
                    continue;
                }

                if (i == this.connectors.length - 2) {
                    var mTo = this.connectors[this.connectors.length - 1];
                    if (mTo.x != current.x && pre.y != current.y) {
                        if (pre.x != current.x && mTo.y != current.y) {
                            if (Math.abs(pre.x - mTo.x) < Math.abs(pre.y - mTo.y)) {
                                current.x = mTo.x;
                                current.y = pre.y;
                            } else {
                                current.x = pre.x;
                                current.y = mTo.y;
                            }
                        }
                    }
                } else if (current.x != pre.x && current.y != pre.y && (i != this.connectors.length - 1)) {
                    if (Math.abs(current.x - pre.x) <= Math.abs(current.y - pre.y)) {
                        current.x = pre.x;
                    } else {
                        current.y = pre.y;
                    }
                }

                var last = this.connectors[i - 1];
                if (last.type != ConnectorType.Middle) {
                    this.insertConnector(i, new LineConnector((last.x + current.x) / 2, (last.y + current.y) / 2, ConnectorType.Middle));
                    i++;
                } else {
                    var last2 = this.connectors[i - 2];
                    last.x = (last2.x + current.x) / 2;
                    last.y = (last2.y + current.y) / 2;
                }
            }

            if (current.x != pre.x || current.y != pre.y) {
                pre = current;
                if (i >= step + step) {
                    var first = this.connectors[i - step - step];
                    var second = this.connectors[i - step];
                    if (((first.x == second.x) && (second.x == current.x))  //in one horizontal line
                        || ((first.y == second.y) && (second.y == current.y))) {
                        var rct = this.connectors[i - step];
                        this.removeConnectorAt(i - step); //it is no use!
                        if (isAngle) {
                            i--;
                            this.connectors[i - 1].x = second.x;
                            this.connectors[i - 1].y = second.y;

                            rct = this.connectors[i - step];
                            this.removeConnectorAt(i - step);
                        }

                        continue;
                    }
                }
            } else {
                //it is no use!
                var rct = this.connectors[i];
                var _i = i - 1;
                if (!pre.attachTo && rct.attachTo) {
                    this.removeConnector(pre);
                    _i--;
                } else this.removeConnectorAt(i);

                if (isAngle) {
                    i--;
                    //rct = this.connectors[_i];
                    this.removeConnectorAt(_i);
                }
                continue;
            }

            i++;
        }
    }

    _createArrow(context) {

        var arrowWidth = 4;   //arrowSize
        var arrowHeight = 8;

        var idx = this.connectors.length - 2;
        var x1 = this.connectors[idx].x;
        var y1 = this.connectors[idx].y;
        var x2 = this.connectors[idx + 1].x;
        var y2 = this.connectors[idx + 1].y;

        var cpX1, cpX2, cpY1, cpY2;

        if (0 == x1 - x2) {
            if (y1 < y2) {
                cpX1 = x2 - arrowWidth;
                cpX2 = x2 + arrowWidth;
                cpY1 = cpY2 = y2 - arrowHeight;
            } else {
                cpX1 = x2 - arrowWidth;
                cpX2 = x2 + arrowWidth;
                cpY1 = cpY2 = y2 + arrowHeight;
            }
        } else if (0 == y1 - y2) {
            if (x1 < x2) {
                cpX1 = cpX2 = x2 - arrowHeight;
                cpY1 = y2 - arrowWidth;
                cpY2 = y2 + arrowWidth;
            } else {
                cpX1 = cpX2 = x2 + arrowHeight;
                cpY1 = y2 - arrowWidth;
                cpY2 = y2 + arrowWidth;
            }
        } else {
            var k = (1.0 * (y1 - y2)) / (x1 - x2);
            var xOffset = arrowHeight / (Math.sqrt(1 + k * k));

            cpX1 = x2 + xOffset;
            cpY1 = y2 + k * xOffset;
            cpX2 = x2 - xOffset;
            cpY2 = y2 - k * xOffset;

            k = (-1.0) / k;
            xOffset = arrowWidth / (Math.sqrt(1 + k * k));

            var d1 = (cpX1 - x1) * (cpX1 - x1) + (cpY1 - y1) * (cpY1 - y1);
            var d2 = (cpX2 - x1) * (cpX2 - x1) + (cpY2 - y1) * (cpY2 - y1);
            if (d1 < d2) {
                cpX2 = Math.round(cpX1 - xOffset);
                cpY2 = Math.round(cpY1 - k * xOffset);

                cpX1 = Math.round(cpX1 + xOffset);  //note: cpX1 changed
                cpY1 = Math.round(cpY1 + k * xOffset);
            } else {
                cpX1 = Math.round(cpX2 + xOffset);
                cpY1 = Math.round(cpY2 + k * xOffset);

                cpX2 = Math.round(cpX2 - xOffset);
                cpY2 = Math.round(cpY2 - k * xOffset);
            }

        }

        context.moveTo(cpX1, cpY1);
        context.lineTo(x2, y2);
        context.lineTo(cpX2, cpY2);
    }
}