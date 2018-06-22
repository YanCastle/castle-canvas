import Command from './Command';
import CompoundCommand from './CompoundCommand';
import BindConnectorCommand from './BindConnectorCommand';
export default class AddRemoveCommand extends Command {
    ctrl; isAdded; items = []; childs;
    constructor(ctrl, list, isAdded) {
        super();
        this.ctrl = ctrl;
        this.isAdded = isAdded;

        this.items = [];
        if (list != null && list.length > 0) {
            if (!isAdded) this.childs = new CompoundCommand();
            for (var j = 0; j < list.length; j++) {
                var i = list[j];
                this.items.push(i);

                if (!isAdded && i.connectors.length > 0) {
                    for (var m = 0; m < i.connectors.length; m++) {
                        var ct = i.connectors[m];
                        if (ct.attachedConnectors && ct.attachedConnectors.length > 0) {
                            for (var n = 0; n < ct.attachedConnectors.length; n++) {
                                var ct2 = ct.attachedConnectors[n];
                                if (list.indexOf(ct2.parent) < 0) {
                                    this.childs.addCommand(new BindConnectorCommand(ct2, ct, false));
                                }
                            }
                        } else if (ct.attachTo != null) {
                            var parent = ct.attachTo.parent;
                            if (list.indexOf(parent) < 0) {
                                this.childs.addCommand(new BindConnectorCommand(ct, ct.attachTo, false));
                            }
                        }
                    }
                }
            }
        }
    }

    _execute(flag) {
        if (this.ctrl == null || this.items.length <= 0) return;
        if (flag) {
            //add items to diagram
            for (var i = 0; i < this.items.length; i++) {
                this.ctrl.addChild(this.items[i]);
            }

            if (this.childs) {
                this.childs.undo();
            }

            this.ctrl.setSelectedItems(this.items);
        } else {
            if (this.childs) {
                this.childs.redo();
            }

            //remove
            for (var i = 0; i < this.items.length; i++) {
                this.ctrl.removeChild(this.items[i]);
            }

            this.ctrl.setSelectedItems(null);
        }
    }

    undo() { this._execute(!this.isAdded); }
    redo() { this._execute(this.isAdded); }
}