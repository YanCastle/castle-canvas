import MouseAction from './MouseAction';
import Action from './Action';
import Text from '../Text';
import Rect from '../Rect';
export default class SectionAction extends MouseAction {
    initialX = -1;
    initialY = -1;
    ghost = null;

    mousedown(e) {
        if (this.state == Action.States.Unactive) {
            if (Text.current) return;

            this.initialX = e.mouseX;
            this.initialY = e.mouseY;

            if (null == this.ghost) {
                this.ghost = this.diagram.__ghost;
            }

            this.ghost.x = e.mouseX;
            this.ghost.y = e.mouseY;
            this.ghost.width = 0;
            this.ghost.height = 0;
            this.ghost.visible = true;
            this.activate();
        }
    }


    mouseup(e) {
        if (this.state == Action.States.Active) {
            this.deActivate();
            if (this.initialX != e.mouseX && this.initialY != e.mouseY) {
                this.diagram._setSelectedConnector(null);
                var rect = new Rect(this.initialX, this.initialY, e.mouseX, e.mouseY);
                let sels = this.diagram.findElementsIn(rect.x, rect.y, rect.width, rect.height);
                this.diagram.setSelectedItems(sels);
            }
            this.ghost.visible = false;
        }

    }
    mousemove(e) {
        if (this.state == Action.States.Active) {
            var context = this.diagram.context;
            var rect = new Rect(this.initialX, this.initialY, e.mouseX, e.mouseY);
            this.ghost.x = rect.x;
            this.ghost.y = rect.y;
            this.ghost.width = rect.width;
            this.ghost.height = rect.height;
        }

    }
}