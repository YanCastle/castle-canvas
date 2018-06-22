import Command from './Command';
export default class CompoundCommand extends Command {
    commands = [];

    addCommand(cmd) {
        this.commands[this.commands.length] = cmd;
    }

    undo() {
        for (var i = 0; i < this.commands.length; i++) this.commands[i].undo();
    }

    redo() {
        for (var i = 0; i < this.commands.length; i++) this.commands[i].redo();
    }
}