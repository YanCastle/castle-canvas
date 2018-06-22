declare let window: any;
export function delegate(func, instance) {
    var context = instance || window;
    if (arguments.length > 2) {
        var leftArgs = Array.prototype.slice.call(arguments, 2);
        return function () {
            var newArgs = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(newArgs, leftArgs);
            return func.apply(context, newArgs);
        };
    } else {
        return function () {
            return func.apply(context, arguments);
        };
    }
}