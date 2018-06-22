import Action from './Action';
import MouseAction from './MouseAction';
import DiagramItem from '../DiagramItem';
import Connector from '../Connector';
import Text from '../Text';
export default class HitAction extends MouseAction {

    mouseup(e) {
        if (this.state == Action.States.Active) {
            this.deActivate();
        }
    }

    mousedown(e) {
        if (this.state == Action.States.Suspend) return;
        var item = this.diagram.findAt(e.mouseX, e.mouseY);
        if (item != null) {
            if (item instanceof DiagramItem) {
                var sels = this.diagram.getSelectedItems();
                if (sels != null && sels.indexOf(item) >= 0) return;

                this.diagram._setSelectedConnector(null);
                this.diagram.setSelectedItems(item);
            } else {
                if (item instanceof Connector) {
                    this.diagram.setSelectedItems(null);
                    this.diagram._setSelectedConnector(item);
                } else {
                    this.diagram._setSelectedConnector(null);
                    if (item instanceof Text) {
                        var pi = item.parent;
                        if (pi instanceof DiagramItem) {
                            var sels = this.diagram.getSelectedItems();
                            if (sels != null && sels.indexOf(pi) >= 0) { }
                            else {
                                //this.diagram._setSelectedConnector( null );
                                this.diagram.setSelectedItems(pi);
                            }
                        }
                        if (true === Text.onclick(item)) {
                            //this.diagram.setSelectedItems( null );
                            this.deActivate();
                            return true;
                        }
                    } else {
                        this.diagram.setSelectedItems(null);
                    }
                }
            }
        } else {
            this.diagram.setSelectedItems(null);
            this.diagram._setSelectedConnector(null);
        }
    }
}