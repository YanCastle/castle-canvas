import UIContainer from './UIContainer';
import { delegate } from './Functions';
import Point from './Point';
import UndoManager from './UndoManager';
import Events from './Events';
import HitAction from './Action/HitAction';
import MoveAction from './Action/MoveAction';
import SectionAction from './Action/SectionAction';
import HoverAction from './Action/HoverAction';
import ToolDrager from './ToolDrager';
import Ghost from './Ghost';
import MoveCommand from './Command/MoveCommand';
import DiagramItem from './DiagramItem';
import Connection from './Connection';
import AddRemoveCommand from './Command/AddRemoveCommand';
declare let window: any;
declare let document: any;
declare let clearInterval: any;
declare let setInterval: any;
export default class Diagram extends UIContainer {
    context;
    __selItems;
    __selConnector
    __ghost
    __moveX
    __moveY
    __timerid
    __interval
    actions
    __readonly
    _offsetX
    _offsetY
    undoManager: UndoManager
    _ToolDrager
    backgroundColor
    constructor(canvas, readonly) {
        if (typeof canvas === 'string') {
            if (canvas.indexOf("#") == 0) {
                canvas = canvas.substring(1);
            }

            canvas = window.document.getElementById(canvas);
        }

        if (canvas == null) throw Error("Canvas can't be null!");
        super();

        this.context = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;

        this.__selItems = [];
        this.__selConnector = null;
        this.__ghost = new Ghost();
        this._events = new Events();

        this.__moveX = 0;
        this.__moveY = 0;

        this.__timerid = null;
        this.__interval = -1;

        this.actions = [];
        //actions
        this.addAction(new HitAction());

        this.__readonly = !readonly;
        this.setReadonly(readonly);

        //handler mouse events
        var _mousehandler = delegate(this._onMouseEvent, this);
        canvas.onmousedown = canvas.onmouseup = canvas.onmousemove = _mousehandler;

        if (0 > canvas.tabIndex) canvas.tabIndex = 0; //get focus!

        this._offsetX = null;
        this._offsetY = null;
    }
    resize(w: number, h: number) {
        if (w < 100) w = 100;
        if (h < 100) h = 100;

        this.width = w;
        this.height = h;

        var canvas = this.context.canvas;
        canvas.width = w;
        canvas.height = h;
    }
    isReadonly() { return this.__readonly; }
    setReadonly(v) {
        if (v === this.__readonly) return;

        var canvas = this.context.canvas;
        this.actions.splice(1);
        if (true === v) {
            this.__readonly = true;
            canvas.onkeyup = canvas.onkeydown = null;
            this.undoManager = null;
            this._ToolDrager = null;

            this.setMaxFrameRate(10);
        } else {
            this.__readonly = false;
            this.addAction(new MoveAction());
            this.addAction(new SectionAction());
            this.addAction(new HoverAction());

            canvas.onkeyup = delegate(this._onKeyUp, this);
            canvas.onkeydown = delegate(this._onKeyDown, this);

            this.undoManager = new UndoManager();
            this._ToolDrager = new ToolDrager(this);

            this.setMaxFrameRate(20);
        }
    }

    setMaxFrameRate(count) {
        if (count <= 0) count = 20;
        var interval = 1000 / count;
        if (interval == this.__interval) return;

        this.__interval = interval;
        if (this.__timerid != null) clearInterval(this.__timerid);
        this.__timerid = setInterval(delegate(this.__timerHandler, this), interval);
    }

    __timerHandler() {
        this._onPaint(this.context, true);
    }

    _onKeyDown(e) {
        //alert(e.keyCode);
        var handled = false;
        if (8 == e.keyCode || 46 == e.keyCode) {
            this.__deleteSelected(false);
            handled = true;
        }
        else if (e.ctrlKey) {
            if (90 == e.keyCode) { //ctrl+z
                this.undoManager.undo();
                handled = true;
            } else if (89 == e.keyCode) { //ctrl+y
                this.undoManager.redo();
                handled = true;
            } else if (65 == e.keyCode) { //ctrl+a
                this.setSelectedItems(this.children); //select all
                handled = true;
            }
        } else {
            if (this.__selItems.length <= 0 || this.__selConnector != null) return;
            var x = 0, y = 0, step = 2;
            if (e.shiftKey) step = 1;

            switch (e.keyCode) {
                case 37: //left
                    x -= step;
                    break;
                case 38: //up
                    y -= step;
                    break;
                case 39: //right
                    x += step;
                    break;
                case 40: //down
                    y += step;
                    break;
            };

            if (x != 0 || y != 0) {
                for (var i = 0; i < this.__selItems.length; i++) {
                    this.__selItems[i].move(x, y);
                }
                this._events.trigger('onMove', this.__selItems);

                this.__moveX += x;
                this.__moveY += y;
                handled = true;
            }
        }

        if (handled) {
            if (e.preventDefault) e.preventDefault();
        }
    }

    _onKeyUp(e) {
        if (this.__moveX > 0 || this.__moveY > 0) {
            let cmd = new MoveCommand(this.getSelectedItems(), this.__moveX, this.__moveY);
            this.undoManager.addCommand(cmd);

            this.__moveX = 0;
            this.__moveY = 0;
            if (e.preventDefault) e.preventDefault();
        }
    }

    offset() {
        var p = this.context.canvas;
        var sx = 0, sy = 0;
        while (p) {
            sx += p.scrollLeft;
            sy += p.scrollTop;

            p = p.parentElement;
            if (p == document.body) break;
        }

        this._offsetX = null;
        if (null == this._offsetX) {
            p = this.context.canvas;
            this._offsetX = this._offsetY = 0;
            while (p) {
                this._offsetX += p.offsetLeft;
                this._offsetY += p.offsetTop;

                p = p.offsetParent;
            }
        }

        return new Point(this._offsetX - sx, this._offsetY - sy);
    }

    _onMouseEvent(e) {
        var canvas = this.context.canvas;
        if (e.type == 'mouseup') {
            canvas.focus();
        }

        var p = this.offset();

        e.mouseX = e.pageX - p.x;//canvas.offsetLeft;
        e.mouseY = e.pageY - p.y;//canvas.offsetTop;

        var func = function (a) {
            let f = a[e.type];
            if (f) {
                if (f.call(a, e) === true) return true;
            }
        }

        for (var i = 0; i < this.actions.length; i++) {
            if (true === func(this.actions[i])) break;
        }

        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
    }

    drawBackGround(context) {
        if (this.backgroundColor) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height);
        } else {
            var gradient = context.createLinearGradient(this.width / 2, 0, this.width / 2, this.height);
            gradient.addColorStop(0, "#E2EBEF");
            gradient.addColorStop(1, "#5DA3D4");
            context.fillStyle = gradient;
            context.fillRect(0, 0, this.width, this.height);
        }
    }

    paint(context) {
        //background
        if (this.drawBackGround) {
            this.drawBackGround(context);
        }

        //ghost
        if (this.__ghost.visible) {
            this.__ghost.paint(context);
        }

        //default style
        //this.context.lineWidth = 1;    
        this.context.strokeStyle = "#000000";
        this.context.fillStyle = '#0c0c0c';

        //children
        super.paint.call(this, context);
    }

    addAction(action) {
        if (action != null && this.actions.indexOf(action) < 0) {
            action.diagram = this;
            this.actions[this.actions.length] = action;
        }
    }

    /**
     * Gets the selected diagram-items.
     */
    getSelectedItems() { return this.__selItems; }

    /**
     * Sets the selected diagram-items.
     */
    setSelectedItems(items) {
        if (items == this.__selItems || (items == null && this.__selItems.length <= 0)) return;
        if (items != null && !(items instanceof Array)) {
            if (!(items instanceof DiagramItem)) return;
            items = [items];
        }

        if (this.__selItems.length > 0) {
            var count = 0;
            for (var i = 0; i < this.__selItems.length; i++) {
                var item = this.__selItems[i];
                if (null == items || items.indexOf(item) < 0) {
                    item.onSelectedStateChanged(false);
                } else count++;
            }

            if (count == this.__selItems.length && count == items.length) {
                return; //no change!
            }

            this.__selItems.splice(0, this.__selItems.length); //remove all
        } else if (items.length <= 0) {
            return;
        }

        if (items != null) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item instanceof DiagramItem) {
                    if (!item.isSelected()) {
                        item.onSelectedStateChanged(true);
                    }
                    this.__selItems[this.__selItems.length] = item;
                }
            }
        }

        this._events.trigger('onSelectedChange', this.__selItems);
    }

    selectedChange(fn) {
        this._events.bind('onSelectedChange', fn, this);
        return this;
    }

    bind(name, fn) {
        this._events.bind(name, fn, this);
        return this;
    }

    findConnectorAt(x1, y1, x2, y2) {
        var pitem = (this.__selConnector == null ? null : this.__selConnector.parent);
        var item = null;

        this.findElementsIn(x1 - 2, y1 - 2, 4, 4,
            function (child) {
                if (pitem == child) return true;
                else {
                    item = child;
                    return false;
                }
            }
        );

        if (null != item && (item instanceof DiagramItem)) {
            return item.findConnector(x1, y1, x2, y2);
        }

        return null;
    }

    findAt(x, y) {
        //in order to select item easily,expand point to rect
        var item = null;//this.findItemsIn(x,y,0,0,true);
        if (this.__selItems && this.__selItems.length == 1
            && (this.__selItems[0] instanceof Connection)) {
            if (this.__selItems[0].testInRect(x, y, 1, 1, true)) {
                item = this.__selItems[0];
            }
        }

        if (item == null) {
            this.findElementsIn(x, y, 1, 1,
                function (child) {
                    item = child;
                    return false;
                }
            );
        }

        if (null != item && (item instanceof DiagramItem)) {
            var ct = item.findConnector(x, y, 0, 0);
            if (ct) return ct;
        }

        return item;
    }

    _getSelectedConnector() { return this.__selConnector; }

    _setSelectedConnector(connector) {
        if (this.__selConnector != connector) {
            if (this.__selConnector != null) this.__selConnector.onSelectedStateChanged(false);
            this.__selConnector = connector;
            if (this.__selConnector != null) this.__selConnector.onSelectedStateChanged(true);
        }
    }

    getCursor() { return this.context.canvas.style.cursor; }

    setCursor(v) {
        this.context.canvas.style.cursor = v;
    }

    __deleteSelected(isCut) {
        if (this.__selItems.length <= 0) return;

        if (false === this._events.trigger('onBeforeRemoved', this.__selItems)) {
            return;
        }
        if (isCut) this.copy();

        let cmd = new AddRemoveCommand(this, this.__selItems, false);
        this.undoManager.addCommand(cmd);
        cmd.redo();
    }

    toolbox(obj, target, itemClass) {
        if (!obj || !itemClass) return;
        if (typeof (itemClass) != 'function') return;

        var diagram = this;
        var canvas = this.context.canvas;
        if (typeof obj == "string") {
            obj = document.getElementById(obj);
        }

        if (target == null) {
            target = obj.cloneNode(true);
            target.style.width = obj.clientWidth + 'px';
            target.style.height = obj.clientHeight + 'px';
        } else if (typeof target == "string") {
            target = document.getElementById(target);
            target.style.position = 'absolute';
            target.style.display = 'none';
            //target.orig_index = obj.style.zIndex;
        }

        if (!obj || !target) return;

        var thisx = obj.offsetLeft;
        var thisy = obj.offsetTop;
        var p = obj.offsetParent;
        while (p) {
            thisx += p.offsetLeft;
            thisy += p.offsetTop;
            p = p.offsetParent;
        }

        var _style = target.style;
        _style.zIndex = 1000;
        _style.mozUserSelect = 'none';
        _style.userSelect = 'none';
        _style.KhtmlUserSelect = 'none';

        obj.onmousedown = function (a) {
            if (!a) a = window.event;

            if (null == diagram._offsetX) {
                p = canvas;
                while (p) {
                    diagram._offsetX += p.offsetLeft;
                    diagram._offsetY += p.offsetTop;

                    p = p.offsetParent;
                }
            }

            var ghost = document.getElementById('dragHelper');
            if (null == ghost) {
                ghost = document.createElement('div');
                ghost.id = 'dragHelper';
                _style = ghost.style;
                if (window.ActiveXObject) {
                    ghost.unselectable = 'on';
                } else {
                    _style.mozUserSelect = 'none';//-webkit-user-select: none;
                    _style.userSelect = 'none';
                    _style.KhtmlUserSelect = 'none';
                }
                _style.position = 'absolute';
                _style.display = 'none';
                _style.cursor = 'move';
                _style.listStyle = 'none';
                _style.overflow = 'hidden';
                _style.textAlign = 'center';
                _style.zIndex = 2000;

                document.body.appendChild(ghost);
            }
            ghost.innerHTML = '';
            ghost.appendChild(target);

            var x = a.clientX - thisx;// - document.body.scrollLeft - obj.offsetLeft;
            var y = a.clientY - thisy;// - document.body.scrollTop - obj.offsetTop;
            _style = ghost.style;
            _style.left = (thisx) + 'px';//(a.clientX)+'px';
            _style.top = (thisy) + 'px';//(a.clientY)+'px';

            diagram._ToolDrager.active(ghost, itemClass, x, y);

            document.onmousemove = function (a) {
                if (!a) a = window.event;

                var left = a.clientX - x;//a.clientX + document.body.scrollLeft - x;
                var top = a.clientY - y;//a.clientY + document.body.scrollTop - y;
                diagram._ToolDrager.move(left, top, false);
            };

            document.onmouseup = function () {
                diagram._ToolDrager.deactive();
            };
        }
    }
}