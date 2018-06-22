import Command from './Command';
export default class BindConnectorCommand extends Command {
    child; parent; toAttach;
    constructor(child, parent, toAttach, s?) {
        super()
        this.child = child;
        this.parent = parent;
        this.toAttach = toAttach;
        if (toAttach) this.text = 'Attache to ' + parent.parent;
        else this.text = 'Detache from ' + parent.parent;
    }

    _execute(flag) {
        if (this.parent == null || this.child == null || !this.parent.canAttached(this.child)) return;

        var diagram = this.parent.getDiagram();
        if (flag) {
            this.parent.addAttached(this.child);
            if (diagram) {
                diagram._events.trigger('onAttached', this.child, this.parent);
            }
        } else {
            this.parent.removeAttached(this.child);
            if (diagram) {
                diagram._events.trigger('onDettached', this.child, this.parent);
            }
        }
    }

    undo() {
        this._execute(!this.toAttach);
    }

    redo() {
        this._execute(this.toAttach);
    }
}