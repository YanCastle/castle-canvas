export default class Ghost {
    visible = false; x; y; width; height
    paint(context) {
        //context.save();
        context.fillStyle = 'rgba(201, 218, 217,120)';
        context.strokeStyle = 'green';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.strokeRect(this.x, this.y, this.width, this.height);
        //context.restore();
    }
}