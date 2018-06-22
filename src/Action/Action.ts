export default class Action {
    static States = {
        Disable: 0,
        Active: 1,
        Suspend: 2,
        Unactive: 3
    };
    diagram; state; _preCursor;
    constructor() {
        this.diagram = null;
        this.state = Action.States.Unactive;
        this._preCursor = null;
    }

    canActivate() {
        if (this.state == Action.States.Disable) return false;
        else return this.state == Action.States.Unactive;
    }

    _suspendOtherActions() {
        if (this.diagram) {
            for (var i = 0; i < this.diagram.actions.length; i++) {
                var act = this.diagram.actions[i];
                if (act != this) act.state = Action.States.Suspend;
            }
        }
    }

    _unSuspendActions() {
        if (this.diagram) {
            for (var i = 0; i < this.diagram.actions.length; i++) {
                var act = this.diagram.actions[i];
                act.state = Action.States.Unactive;
            }
        }
    }

    activate() {
        if (this.canActivate()) {
            this._suspendOtherActions();
            this.state = Action.States.Active;
            this._preCursor = this.diagram.getCursor();
        }

        return this.state == Action.States.Active;
    }

    deActivate() {
        if (Action.States.Active == this.state || Action.States.Suspend == this.state) {
            if (null != this._preCursor) {
                this.diagram.setCursor(this._preCursor);
                this._preCursor = null;
            }

            this.state = Action.States.Unactive;
            this._unSuspendActions();
        }
    }
}