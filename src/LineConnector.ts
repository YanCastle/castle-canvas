import Connector from './Connector';
import { ConnectorType, AttachType, LineType } from './Common';
import RightAngleDrager from './RightAngleDrager';
export default class LineConnector extends Connector {
    static nullBrush = 'red';
    constructor(x, y, type) {
        super(x, y);
        if (!type) this.type = ConnectorType.Endpoint;
        else this.type = type;
        this.attachable = AttachType.None;

        if (type == ConnectorType.Endpoint) {
            this.width = this.height = Connector.width;
        }
    }

    isStartPoint() {
        if (this.parent && this.parent.connectors) {
            if (this == this.parent.connectors[0]) return true;
        }
        return false;
    }

    paint(context) {
        context.strokeStyle = Connector.strokeStyle;
        context.fillStyle = Connector.fillStyle;
        var w = Connector.width;

        context.beginPath();

        switch (this.type) {
            case ConnectorType.RightAngle:
                {
                    context.moveTo(0, -w);

                    context.lineTo(w, 0);
                    context.lineTo(0, w);
                    context.lineTo(-w, 0);
                    //context.lineTo(0,-w);
                    context.closePath();
                    context.stroke();
                    context.fill();
                }
                break;
            case ConnectorType.Middle:
                {
                    context.arc(0, 0, w, 0, Math.PI * 2, 0);
                    context.fill();
                }
                break;
            default:
                {
                    if (this.attachTo == null) context.fillStyle = LineConnector.nullBrush;
                    context.strokeRect(-w, -w, w + w, w + w);
                    context.fillRect(-w, -w, w + w, w + w);
                }
                break;
        }
    }

    beginDrag() {
        if (this.parent.type == LineType.RightAngle) {
            return RightAngleDrager.beginDrag(this);
        } else return null;
    }

    move(x, y) {
        if (this.type != ConnectorType.Endpoint || this.parent.draggable()) return;

        this.x += x;
        this.y += y;

        if (this.parent.type != LineType.RightAngle) {
            this.parent.adjust();
            return;
        }

        var cts = this.parent.connectors;
        var count = cts.length;
        if (3 == count) {
            var x1 = cts[1].x;
            var y1 = cts[1].y;
            var x2 = cts[1].x;
            var y2 = cts[1].y;
            if (cts[0].x - cts[2].x == 0) {
                x1 = cts[0].x;
                x2 = cts[2].x;
                y1 = y2 = (cts[0].y + cts[2].y) / 2;
            } else {
                y1 = cts[0].y;
                y2 = cts[2].y;
                x1 = x2 = (cts[0].x + cts[2].x) / 2;
            }

            var newCT = new LineConnector(x1, y1, ConnectorType.RightAngle);
            this.parent.insertConnector(1, newCT);

            newCT = new LineConnector(x2, y2, ConnectorType.RightAngle);
            this.parent.insertConnector(3, newCT);
        } else if (3 < count) {
            let i = cts.indexOf(this);
            var c1 = null, c2 = null;
            if (i == 0) {
                c1 = cts[1];
                c2 = cts[2];
            } else if (i == count - 1) {
                c1 = cts[i - 1];
                c2 = cts[i - 2];
            } else {
                return;
            }

            if (0 == c1.x - c2.x) {
                c2.x += x;
            } else {
                c2.y += y;
            }
        }

        this.parent.adjust();
    }
}