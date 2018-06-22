import Command from './Command';
export default class ConnectorMoveCommand extends Command {
    ct; offsetX; offsetY;
    constructor(ct, offsetX, offsetY) {
        super();
        this.ct = ct;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    _execute(flag) {
        if (this.ct == null) return;
        this.ct.parent.parent._setSelectedConnector(this.ct);

        var pointDrager = this.ct.beginDrag();
        /*if (pointDrager == null){
            if (!this.ct.draggable()) return;
            else if (!pointDrager.movable()){
                pointDrager.cancel();
                pointDrager = null;
            }
        }*/

        if (pointDrager != null) {
            if (flag) pointDrager.move(this.offsetX, this.offsetY);
            else pointDrager.move(-this.offsetX, -this.offsetY);
        } else {
            if (flag) this.ct.move(this.offsetX, this.offsetY);
            else this.ct.move(-this.offsetX, -this.offsetY);
        }
    }

    undo() {
        this._execute(false);
    }

    redo() {
        this._execute(true);
    }
}