import Shape from './Sharp';
import ShapeConnector from './ShapeConnector';
export default class RectangleShape extends Shape {
    width = 100; height = 100;
    constructor() {
        super();

        //connectors
        this.addConnector(new ShapeConnector(this.width / 2, 0));
        this.addConnector(new ShapeConnector(this.width / 2, this.height));
        this.addConnector(new ShapeConnector(0, this.height / 2));
        this.addConnector(new ShapeConnector(this.width, this.height / 2));

    }
    paint(context) {
        //context.lineWidth = 1;    
        //context.strokeStyle ="#000000";
        context.fillStyle = "#00ffff";
        context.fillRect(0, 0, this.width, this.height);
        context.strokeRect(0, 0, this.width, this.height);

        super.paint.call(this, context);
    }
}