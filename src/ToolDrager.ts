import UIElement from './UIElement';
import AddRemoveCommand from './Command/AddRemoveCommand';
declare let document: any;
declare let alert: any;
export default class ToolDrager {
    diagram; target; itemClass; _active; _offsetX; _offsetY; item; _inDiagram;
    constructor(diagram) {
        this.diagram = diagram;
        this.deactive();
    }

    active(target, itemClass, offsetx, offsety) {
        this.target = target;
        this.itemClass = itemClass;
        this._active = true;
        this._offsetX = offsetx;
        this._offsetY = offsety;

        this.target.style.cursor = "move";
        this.target.style.display = 'block';
    }

    deactive(inDiagram?) {
        if (inDiagram) {
            var addCmd = new AddRemoveCommand(this.diagram, [this.item], true);
            this.diagram.undoManager.addCommand(addCmd);
        } else if (this.item) {
            this.diagram.removeChild(this.item);
        }

        if (this.target) {
            this.target.style.cursor = "normal";
            this.target.style.display = 'none';
        }

        this.target = null;
        this.itemClass = null;
        this.item = null;
        this._active = false;
        this._inDiagram = false;

        document.onmousemove = null;
        document.onmouseup = null;
    }

    isActive() { return this._active; }

    move(x, y, inDiagram) {
        if (inDiagram) {
            if (!this._inDiagram) {
                if (null == this.item) {
                    if (this.itemClass instanceof UIElement) {
                        let classe: UIElement = this.itemClass;
                        this.item = new classe();
                        // this.item = new UIElement();
                    } else {
                        this.item = this.itemClass();
                        if (!(this.item instanceof UIElement)) {
                            alert('工具箱类型错误!');
                            return;
                        }
                    }

                    this.diagram.addChild(this.item);
                    this.target.style.display = 'none';

                    x -= this._offsetX;
                    y -= this._offsetY;
                }
                this.item.visible = true;
                this._inDiagram = true;
                this.diagram.setSelectedItems(this.item);
            }
            this.item.move(x, y);
            this.diagram._events.trigger('onMove', [this.item]);
        } else {
            this.target.style.left = x + 'px';
            this.target.style.top = y + 'px';

            var canvas = this.diagram.context.canvas;
            if (x > this.diagram._offsetX && y > this.diagram._offsetY
                && x < this.diagram._offsetX + canvas.width && y < this.diagram._offsetY + canvas.height) {
                this.target.style.display = 'none';
            } else if (this._inDiagram) {
                if (this.item != null) this.item.visible = false;
                this.target.style.display = 'block';
                this._inDiagram = false;
            }
        }

        //if(event && event.preventDefault) event.preventDefault();
        //if(event && event.preventDefault) event.stopPropagation(); 
    }
}