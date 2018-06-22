import Command from './Command';
import { LineType, ConnectorType } from '../Common';
import LineConnector from '../LineConnector';
export default class ConvertConnectionCommand extends Command {
    con; leftConnectors;
    constructor(con) {
        super();
        this.con = con;
        this.leftConnectors = null;

    }

    _execute() {
        var con = this.con;
        if (con.type === LineType.RightAngle) {
            this.leftConnectors = []
            if (con.connectors.length > 2) {
                for (var i = 1; i < con.connectors.length - 1; i++) {
                    this.leftConnectors.push(con.connectors[i]);
                }
                con.connectors.splice(1, con.connectors.length - 2);
            }
            con.type = LineType.Straight;
        } else {
            if (this.leftConnectors && this.leftConnectors.length > 0) {
                for (var i = 0; i < this.leftConnectors.length; i++) {
                    con.connectors.splice(i + 1, 0, this.leftConnectors[i]);
                }
            } else if (2 == con.connectors.length) {
                var ct1 = con.connectors[0], ct2 = con.connectors[1];
                var ct = new LineConnector(ct1.x, (ct1.y + ct2.y) / 2, ConnectorType.Middle);
                ct.parent = con;
                con.connectors.splice(1, 0, ct);

                ct = new LineConnector(ct1.x, ct2.y, ConnectorType.RightAngle);
                ct.parent = con;
                con.connectors.splice(2, 0, ct);

                ct = new LineConnector((ct1.x + ct2.x) / 2, ct2.y, ConnectorType.Middle);
                ct.parent = con;
                con.connectors.splice(3, 0, ct);
            }

            con.type = LineType.RightAngle;
        }
    }

    undo() {
        this._execute();
    }

    redo() {
        this._execute();
    }
}