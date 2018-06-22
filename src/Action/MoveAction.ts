import MouseAction from './MouseAction';
import Action from './Action';
import Connection from '../Connection';
import Shape from '../Sharp';
import ShapeConnector from '../ShapeConnector';
import { AttachType, LineType, ConnectorType } from '../Common';
import Point from '../Point';
import AddRemoveCommand from '../Command/AddRemoveCommand';
import BindConnectorCommand from '../Command/BindConnectorCommand';
import CompoundCommand from '../Command/CompoundCommand';
import MoveCommand from '../Command/MoveCommand';
import ConnectorMoveCommand from '../Command/ConnectorMoveCommand';
export default class MoveAction extends MouseAction {
    initialX = 0;
    initialY = 0;
    lastX = 0;
    lastY = 0;
    fromX = 0;
    fromY = 0;

    pointDrager = null;
    findedCT = null;

    _beginDragConnector(ct) {
        this.initialX = this.lastX = ct.x;
        this.initialY = this.lastY = ct.y;

        this.pointDrager = ct.beginDrag();
        if (this.pointDrager == null) {
            if (!ct.draggable) return;
        } else if (!this.pointDrager.movable()) {
            this.pointDrager.cancel();
            this.pointDrager = null;
            return false;
        }

        var children = ct.parent.connectors;
        var index = children.indexOf(ct);
        if (0 == index) index = 1;
        else index--;

        if (index >= 0 && index < children.length) {
            this.fromX = children[index].x;
            this.fromY = children[index].y;
        } else {
            this.fromX = this.initialX;
            this.fromY = this.initialY;
        }

        return true;
    }

    mousedown(e) {
        if (this.state != Action.States.Unactive) return;

        var sels = this.diagram.getSelectedItems();
        if (sels != null && sels.length > 0) {
            this.initialX = this.lastX = e.mouseX;
            this.initialY = this.lastY = e.mouseY;
            this.activate();
        } else if (this.diagram._getSelectedConnector() != null) {
            var ct = this.diagram._getSelectedConnector();

            if (!(ct.parent instanceof Connection)) {
                if (ct.attachedConnectors.length <= 0) {
                    this.initialX = e.mouseX;
                    this.initialY = e.mouseY;
                    this.activate();
                }
                return;
            }

            if (!this._beginDragConnector(ct)) return;
            this.activate();
        }
    }

    mousemove(e) {
        if (this.state != Action.States.Active) {
            if (this.diagram._ToolDrager.isActive()) {
                this.activate();
                this.diagram._ToolDrager.move(e.mouseX, e.mouseY, true);
                this.lastX = e.mouseX;
                this.lastY = e.mouseY;
            }
            return;
        }

        var offsetX = e.mouseX - this.lastX;
        var offsetY = e.mouseY - this.lastY;

        if (offsetX == 0 && offsetY == 0) return;

        if (this.diagram._ToolDrager.isActive()) {
            this.diagram._ToolDrager.move(offsetX, offsetY, true);
            this.lastX = e.mouseX;
            this.lastY = e.mouseY;
            return;
        }

        var selct = this.diagram._getSelectedConnector();
        if (selct == null) {
            var mw = this.diagram.width, mh = this.diagram.height;
            var wf = false, hf = false;

            var sels = this.diagram.getSelectedItems();
            for (var i = 0; i < sels.length; i++) {
                sels[i].move(offsetX, offsetY);
                if (sels[i] instanceof Shape && (sels[i].width && sels[i].height)) {
                    if (sels[i].x + sels[i].width > mw) {
                        mw = sels[i].x + sels[i].width + 2;
                        wf = true;
                    }
                    if (sels[i].y + sels[i].height > mh) {
                        mh = sels[i].y + sels[i].height + 2;
                        hf = true;
                    }
                }
            }
            this.diagram._events.trigger('onMove', sels);
            if (wf || hf) {
                this.diagram._events.trigger('onRectOut', mw, mh);
            }
        } else {
            if (selct instanceof ShapeConnector && (selct.attachable == AttachType.Both || selct.attachable == AttachType.Out)) {
                //create new connection
                var line = new Connection([new Point(this.initialX, this.initialY), new Point(e.mouseX, e.mouseY)],
                    LineType.Straight);
                line._createConnectors();

                var addCmd = new AddRemoveCommand(this.diagram, [line], true);
                var bindCmd = new BindConnectorCommand(line.connectors[0], selct, selct, true);

                var packageCmd = new CompoundCommand();
                packageCmd.addCommand(addCmd);
                packageCmd.addCommand(bindCmd);
                packageCmd.redo();

                this.diagram.undoManager.addCommand(packageCmd);

                var ct = line.connectors[1];
                this.diagram._setSelectedConnector(ct);

                this._beginDragConnector(ct);

                return;
            }

            var oldFinded = this.findedCT;
            this.findedCT = null;

            if (selct.type == ConnectorType.Endpoint) {
                var ct = this.diagram.findConnectorAt(e.mouseX, e.mouseY, this.fromX, this.fromY);
                if (ct != null && ct.canAttached(selct)) {
                    this.findedCT = ct;
                    if (ct == oldFinded) {
                        oldFinded = null;
                    } else {
                        this.findedCT.stress(true);
                        this.findedCT.parent.stress(true);
                    }
                }
            }

            if (oldFinded != null) {
                oldFinded.stress(false);
                if (this.findedCT == null || this.findedCT.parent != oldFinded.parent) {
                    oldFinded.parent.stress(false);
                }
            }

            if (this.pointDrager != null) {
                this.pointDrager.move(offsetX, offsetY);
            } else {
                selct.move(offsetX, offsetY);
            }
        }

        this.lastX = e.mouseX;
        this.lastY = e.mouseY;
    }

    mouseup(e) {
        if (this.state != Action.States.Active) return;

        this.deActivate();
        if (this.diagram._ToolDrager.isActive()) {
            this.diagram._ToolDrager.deactive(true);
            return;
        }

        if (this.initialX == this.lastX && this.initialY == this.lastY) {
            if (this.pointDrager != null) {
                this.pointDrager.cancel();
                this.pointDrager = null;
            }
            return;
        }

        var cmd = null;
        var selct = this.diagram._getSelectedConnector();
        if (selct == null) {
            cmd = new MoveCommand(this.diagram.getSelectedItems(), this.lastX - this.initialX, this.lastY - this.initialY);
        } else {
            if (selct instanceof ShapeConnector) return;

            if (this.findedCT == null && selct.type == ConnectorType.Endpoint) {
                this.findedCT = this.diagram.findConnectorAt(this.lastX, this.lastY, this.fromX, this.fromY);
            }

            var bindCmd = null;
            if (this.findedCT != null && this.findedCT.canAttached(selct)) {
                var findedPoint = this.findedCT.parent.pointToGlobal(this.findedCT.x, this.findedCT.y); //findedCT comes from shape.  MUST?
                var offsetX = findedPoint.x - this.lastX;
                var offsetY = findedPoint.y - this.lastY;
                if (this.pointDrager != null) {
                    this.pointDrager.move(offsetX, offsetY);
                } else {
                    selct.move(offsetX, offsetY);
                }

                this.lastX = findedPoint.x;
                this.lastY = findedPoint.y;

                bindCmd = new BindConnectorCommand(selct, this.findedCT, true);     //attached!!
                this.findedCT.stress(false);
                this.findedCT.parent.stress(false);
            } else {
                if (selct.attachTo != null) {
                    bindCmd = new BindConnectorCommand(selct, selct.attachTo, false);
                }
            }

            if (this.pointDrager != null) {
                this.pointDrager.commit();
                this.pointDrager = null;
            }

            cmd = new ConnectorMoveCommand(selct, this.lastX - this.initialX, this.lastY - this.initialY);
            if (bindCmd != null) {
                var packageCmd = new CompoundCommand();
                packageCmd.addCommand(cmd);

                bindCmd.redo();
                packageCmd.addCommand(bindCmd);

                cmd = packageCmd;
            }
        }

        if (cmd != null) {
            this.diagram.undoManager.addCommand(cmd);
        }
    }
}