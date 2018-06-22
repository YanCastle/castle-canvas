export default class UndoManager {
    level
    undoList
    redoList
    constructor(level = 0) {
        this.level = level;
        this.undoList = [];
        this.redoList = [];
    }

    clear() {
        this.undoList.splice(0);  //remove all
        this.redoList.splice(0);
    }

    addCommand(cmd) {
        if (this.level <= 0) return;
        if (this.undoList.length >= this.level) {
            this.undoList.shift(); //delete the first element
        }

        this.undoList.push(cmd);
        this.redoList.splice(0); //clear redo-list
    }

    canUndo() { return this.undoList.length > 0; }

    canRedo() { return this.redoList.length > 0; }

    undo() {
        if (!this.canUndo()) return;

        var cmd = this.undoList.pop();
        cmd.undo();
        this.redoList.push(cmd);
    }

    redo() {
        if (!this.canRedo()) return;

        var cmd = this.redoList.pop();
        cmd.redo();
        this.undoList.push(cmd);
    }
}