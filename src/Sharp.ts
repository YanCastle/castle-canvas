import DiagramItem from './DiagramItem';
export default class Shape extends DiagramItem {
    move(x, y) {
        super.move.call(this, x, y);
        for (var i = 0; i < this.connectors.length; i++) {
            this.connectors[i].move(x, y);
        }
    }
}