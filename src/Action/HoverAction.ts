import MouseAction from './MouseAction';
import Action from './Action';
import DiagramItem from '../DiagramItem';
export default class HoverAction extends MouseAction {
    current;

    mousemove(e) {
        if (this.state == Action.States.Suspend
            || this.state == Action.States.Disable) {
            return;
        }

        var item = this.diagram.findAt(e.mouseX, e.mouseY);
        while (item != null && !(item instanceof DiagramItem)) {
            item = item.parent;
        }
        if (item != this.current) {
            if (this.current != null) this.current.onHovered(false);

            if (item == null || !('onHovered' in item)) {
                this.current = null;
                return;
            }

            this.current = item;
            if (this.current != null) this.current.onHovered(true);
        }
    }
}