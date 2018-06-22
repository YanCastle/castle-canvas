import Connector from './Connector';
import { ConnectorType, LineType, ItemState } from './Common';
import Connection from './Connection';
import Point from './Point';
export default class ShapeConnector extends Connector {
    draggable = false;
    attachedConnectors = [];
    __isStress = false;
    width; height;
    constructor(x, y) {
        super(x, y);
        this.width = this.height = Connector.width;
    }

    paint(context) {
        context.strokeStyle = Connector.strokeStyle;

        var w = this.width;
        if (this.__isStress || this._state == ItemState.Hover) {
            context.fillStyle = Connector.stressdBrush;
            w += w;
        } else {
            context.fillStyle = Connector.fillStyle;
        }

        context.strokeRect(-w, -w, w + w, w + w);
        context.fillRect(-w, -w, w + w, w + w);
    }

    onHovered(flag) {
        this._state = (flag ? ItemState.Hover : ItemState.Normal);
        if (flag) this.visible = true;
        else if (!this.parent.isSelected()) this.visible = false;
    }

    stress(flag) {
        this.__isStress = flag;
        //var w = Connector.width;
        //if(flag) w += w;
        //this.width = this.height = w;
    }

    move(x, y) {
        for (var i = 0; i < this.attachedConnectors.length; i++) {
            var ct = this.attachedConnectors[i];
            if (!ct.parent.draggable()) {
                ct.move(x, y);
            }
        }
    }

    addAttached(ct) {
        if (ct.attachTo != null) {
            if (ct.attachTo == this) return;
            ct.attachTo.removeAttached(ct);
        }

        ct.attachTo = this;
        this.attachedConnectors[this.attachedConnectors.length] = ct;
    }

    removeAttached(ct) {
        var idx = this.attachedConnectors.indexOf(ct);
        if (idx >= 0 && idx < this.attachedConnectors.length) {
            ct.attachTo = null;
            this.attachedConnectors.splice(idx, 1);
        }
    }

    connectTo(ct, polys) {
        if (ct == null || ct.type != ConnectorType.Attachable || this == ct) return null;

        var line = null;
        if (null == polys) {
            line = new Connection([this.getPoint(), ct.getPoint()], LineType.Straight);
        } else {
            polys = polys.split(',');
            var points = [this.getPoint()];

            var current = points[0];
            var last = ct.getPoint();
            for (var i = 0; i < polys.length; i++) {
                var s = polys[i];
                if (s == null || s == '') {
                    throw Error("connector.connectTo:illegal arguments!");
                }

                if (s == 'v') {
                    var p = new Point(current.x, last.y);
                    if (current.x != p.x || current.y != p.y) {
                        points.push(p);
                    }
                    break;
                }
                else if (s == 'h') {
                    var p = new Point(last.x, current.y);
                    if (current.x != p.x || current.y != p.y) {
                        points.push(p);
                    }
                    break;
                }
                else {
                    var pre = s.substr(0, 1);
                    var left = s.substr(1);
                    var n = parseInt(s);
                    if (isNaN(n)) {
                        n = parseInt(left);
                        if (isNaN(n)) {
                            throw Error("connector.connectTo:illegal arguments(" + polys + ")!");
                        }
                    } else {
                        pre = 'v'; //default
                    }

                    if (pre == 'h') {
                        p = new Point(current.x + n, current.y);
                    } else {
                        p = new Point(current.x, current.y + n);
                    }

                    if (p.x == last.x && p.y == last.y) {
                        break;
                    }
                    points.push(p);
                    current = p;
                }
            }

            points.push(last);
            line = new Connection(points, LineType.RightAngle);
        }

        line._createConnectors();

        this.addAttached(line.connectors[0]);
        ct.addAttached(line.connectors[line.connectors.length - 1]);

        var d = this.getDiagram();
        if (d) {
            d.addChild(line);
        }

        return line;
    }
}