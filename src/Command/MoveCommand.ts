import Command from './Command';
export default class MoveCommand extends Command {
    list = [];
    offsetX;
    offsetY;
    constructor(items, offsetX, offsetY) {
        super();
        this.list = []
        for (var i = 0; i < items.length; i++) this.list[i] = items[i];
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.text = "Elements Move";
    }

    undo() {
        if (this.list.length <= 0 || this.list[0].parent == null) return;

        this.list[0].parent.setSelectedItems(this.list);
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].move(-this.offsetX, -this.offsetY);
        }

        var diagram = this.list[0].getDiagram();
        if (diagram) {
            diagram._events.trigger('onMove', this.list);
        }
    }

    redo() {
        if (this.list.length <= 0 || this.list[0].parent == null) return;

        this.list[0].parent.setSelectedItems(this.list);
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].move(this.offsetX, this.offsetY);
        }

        var diagram = this.list[0].getDiagram();
        if (diagram) {
            diagram._events.trigger('onMove', this.list);
        }
    }
}