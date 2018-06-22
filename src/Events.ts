import { delegate } from './Functions'
declare let window: any;
export default class Events {
    _events = {};
    constructor() {
        this._events = {};
    }
    bind(name, fn, ins) {
        if (name == null || fn == null) return false;
        var obj = this._events[name];
        if (!obj) {
            this._events[name] = obj = [];
        }

        if (ins) fn = delegate(fn, ins);

        obj.push(fn);
        return true;
    }
    unbind(name, fn) {
        if (name == null) return;
        var obj = this._events[name];
        if (obj) {
            if (null == fn) {
                delete this._events[name];
                return;
            }

            for (var i = obj.length - 1; i >= 0; i--) {
                if (fn == obj[i]) {
                    obj.splice(i, 1);
                }
            }
        }
    }
    trigger(name, ...args) {
        if (name == null) return;
        var obj = this._events[name];
        if (obj) {
            var leftArgs = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < obj.length; i++) {
                if (false === obj[i].apply(window, leftArgs)) return false;
            }
        }
        return true;
    }
}