/**
 * 个人工具集合
 */
window.Tool = (function (exports) {
    'use strict';
    /**
     * base64处理工具
     */
    class Base64 {
        /**
         * 构造函数
         */
        constructor() {

        }

        /**
         * 编码Base64
         * @param {string} input 
         */
        static encode64(input) {
            input = escape(input);//转义字符
            var output = "";
            var c1, c2, c3 = "";
            var e1, e2, e3, e4 = "";
            var i = 0;
            var n = 2;
            do {
                c1 = input.charCodeAt(i++);//返回指定字符位置的Unicode编码
                c2 = input.charCodeAt(i++);
                c3 = input.charCodeAt(i++);
                e1 = c1 >> 2;//右移2位 
                e2 = ((c1 & 3) << 4) | (c2 >> 4);//3二进制：11
                e3 = c3 & 63;//63二进制：111111
                if (isNaN(c2)) {
                    e3 = e4 = 64;//=
                } else if (isNaN(c3)) {
                    e4 = 64;//=
                }
                output = output + Base64.keyChar.charAt(e1) +
                    Base64.keyChar.charAt(e2) + Base64.keyChar.charAt(e3) +
                    Base64.keyChar.charAt(e4);
                c1 = c2 = c3 = "";
                e1 = e2 = e3 = e4 = "";
            } while (i < input.length);
            return output;
        }

        /**
         * 解码Base64
         * @param {string} input 
         */
        static decode64(input) {
            var output = "";
            var c1, c2, c3 = "";
            var e1, e2, e3, e4 = "";
            var i = 0;
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("ERROR INPUT:base64字符只能包含A-Z,a-z,0-9,'+','/','='");
                return;
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do {
                e1 = Base64.keyChar.indexOf(input.charAt(i++));
                e2 = Base64.keyChar.indexOf(input.charAt(i++));
                e3 = Base64.keyChar.indexOf(input.charAt(i++));
                e4 = Base64.keyChar.indexOf(input.charAt(i++));
                c1 = (e1 << 2) | (e2 >> 4);
                //
                c2 = ((e2 & 15) << 4) | (e3 >> 2);//15二进制：1111
                c3 = ((e3 & 3) << 6) | e4;//3二进制：11
                output = output + String.fromCharCode(c1);
                if (e3 != 64) {
                    output = output + String.fromCharCode(c2);
                }
                if (e4 != 64) {
                    output = output + String.fromCharCode(c3);
                }
                c1 = c2 = c3 = "";
                e1 = e2 = e3 = e4 = "";
            } while (i < input.length);
            return unescape(output);
        }
        /**
         * 字符集
         */
        static keyChar = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`;
    }
    /**
     * 包装Function 存储Function相应执行域及参数
     */
    class Handler {
        constructor(caller = null, method = null, args = null, once = false) {
            this.once = false;
            this._id = 0;
            this.setTo(caller, method, args, once);
        }
        setTo(caller, method, args, once = false) {
            this._id = Handler._gid++;
            this.caller = caller;
            this.method = method;
            this.args = args;
            this.once = once;
            return this;
        }
        run() {
            if (this.method == null)
                return null;
            var id = this._id;
            var result = this.method.apply(this.caller, this.args);
            this._id === id && this.once && this.recover();
            return result;
        }
        runWith(data) {
            if (this.method == null)
                return null;
            var id = this._id;
            if (data == null)
                var result = this.method.apply(this.caller, this.args);
            else if (!this.args && !data.unshift)
                result = this.method.call(this.caller, data);
            else if (this.args)
                result = this.method.apply(this.caller, this.args.concat(data));
            else
                result = this.method.apply(this.caller, data);
            this._id === id && this.once && this.recover();
            return result;
        }
        clear() {
            this.caller = null;
            this.method = null;
            this.args = null;
            return this;
        }
        recover() {
            if (this._id > 0) {
                this._id = 0;
                Handler._pool.push(this.clear());
            }
        }
        static create(caller, method, args = null, once = true) {
            if (Handler._pool.length)
                return Handler._pool.pop().setTo(caller, method, args, once);
            return new Handler(caller, method, args, once);
        }
    }
    Handler._pool = [];
    Handler._gid = 1;
    /**
     * 事件回调函数
     */    
    class EventHandler extends Handler {
        constructor(caller, method, args, once) {
            super(caller, method, args, once);
        }
        /**
         * 回收
         */
        recover() {
            if (this._id > 0) {
                this._id = 0;
                EventHandler._pool.push(this.clear());
            }
        }
        /**
         * 创建实例
         */
        static create(caller, method, args = null, once = true) {
            if (EventHandler._pool.length)
                return EventHandler._pool.pop().setTo(caller, method, args, once);
            return new EventHandler(caller, method, args, once);
        }
    }
    EventHandler._pool = [];
    class EventDispatcher {
        hasListener(type) {
            var listener = this._events && this._events[type];
            return !!listener;
        }
        event(type, data = null) {
            if (!this._events || !this._events[type])
                return false;
            var listeners = this._events[type];
            if (listeners.run) {
                if (listeners.once)
                    delete this._events[type];
                data != null ? listeners.runWith(data) : listeners.run();
            }
            else {
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var listener = listeners[i];
                    if (listener) {
                        (data != null) ? listener.runWith(data) : listener.run();
                    }
                    if (!listener || listener.once) {
                        listeners.splice(i, 1);
                        i--;
                        n--;
                    }
                }
                if (listeners.length === 0 && this._events)
                    delete this._events[type];
            }
            return true;
        }
        on(type, caller, listener, args = null) {
            return this._createListener(type, caller, listener, args, false);
        }
        once(type, caller, listener, args = null) {
            return this._createListener(type, caller, listener, args, true);
        }
        _createListener(type, caller, listener, args, once, offBefore = true) {
            offBefore && this.off(type, caller, listener, once);
            var handler = EventHandler.create(caller || this, listener, args, once);
            this._events || (this._events = {});
            var events = this._events;
            if (!events[type])
                events[type] = handler;
            else {
                if (!events[type].run)
                    events[type].push(handler);
                else
                    events[type] = [events[type], handler];
            }
            return this;
        }
        off(type, caller, listener, onceOnly = false) {
            if (!this._events || !this._events[type])
                return this;
            var listeners = this._events[type];
            if (listeners != null) {
                if (listeners.run) {
                    if ((!caller || listeners.caller === caller) && (listener == null || listeners.method === listener) && (!onceOnly || listeners.once)) {
                        delete this._events[type];
                        listeners.recover();
                    }
                }
                else {
                    var count = 0;
                    for (var i = 0, n = listeners.length; i < n; i++) {
                        var item = listeners[i];
                        if (!item) {
                            count++;
                            continue;
                        }
                        if (item && (!caller || item.caller === caller) && (listener == null || item.method === listener) && (!onceOnly || item.once)) {
                            count++;
                            listeners[i] = null;
                            item.recover();
                        }
                    }
                    if (count === n)
                        delete this._events[type];
                }
            }
            return this;
        }
        offAll(type = null) {
            var events = this._events;
            if (!events)
                return this;
            if (type) {
                this._recoverHandlers(events[type]);
                delete events[type];
            }
            else {
                for (var name in events) {
                    this._recoverHandlers(events[name]);
                }
                this._events = null;
            }
            return this;
        }
        offAllCaller(caller) {
            if (caller && this._events) {
                for (var name in this._events) {
                    this.off(name, caller, null);
                }
            }
            return this;
        }
        _recoverHandlers(arr) {
            if (!arr)
                return;
            if (arr.run) {
                arr.recover();
            }
            else {
                for (var i = arr.length - 1; i > -1; i--) {
                    if (arr[i]) {
                        arr[i].recover();
                        arr[i] = null;
                    }
                }
            }
        }
        isMouseEvent(type) {
            return EventDispatcher.MOUSE_EVENTS[type] || false;
        }
    }
    EventDispatcher.MOUSE_EVENTS = { "rightmousedown": true, "rightmouseup": true, "rightclick": true, "mousedown": true, "mouseup": true, "mousemove": true, "mouseover": true, "mouseout": true, "click": true, "doubleclick": true };

    /**
     * 封裝XMLHttpRequest
     */
    class HttpRequest extends EventDispatcher {
        constructor() {
            super(...arguments);
            this._http = new XMLHttpRequest();
        }
        send(url, data = null, method = "get", responseType = "text", headers = null) {
            this._responseType = responseType;
            this._data = null;
            this._url = url;
            var _this = this;
            var http = this._http;
            http.open(method, url, true);
            if (headers) {
                for (var i = 0; i < headers.length; i++) {
                    http.setRequestHeader(headers[i++], headers[i]);
                }
            }
            else if (!(window.conch)) {
                if (!data || typeof (data) == 'string')
                    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                else
                    http.setRequestHeader("Content-Type", "application/json");
            }
            let restype = responseType !== "arraybuffer" ? "text" : "arraybuffer";
            http.responseType = restype;
            if (http.dataType) {
                http.dataType = restype;
            }
            http.onerror = function (e) {
                _this._onError(e);
            };
            http.onabort = function (e) {
                _this._onAbort(e);
            };
            http.onprogress = function (e) {
                _this._onProgress(e);
            };
            http.onload = function (e) {
                _this._onLoad(e);
            };
            http.send(data);
        }
        _onProgress(e) {
            if (e && e.lengthComputable)
                this.event("progress", e.loaded / e.total);
        }
        _onAbort(e) {
            this.error("Request was aborted by user");
        }
        _onError(e) {
            this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
        }
        _onLoad(e) {
            var http = this._http;
            var status = http.status !== undefined ? http.status : 200;
            if (status === 200 || status === 204 || status === 0) {
                this.complete();
            }
            else {
                this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
            }
        }
        error(message) {
            this.clear();
            console.warn(this.url, message);
            this.event("error", message);
        }
        complete() {
            this.clear();
            var flag = true;
            try {
                if (this._responseType === "json") {
                    this._data = JSON.parse(this._http.responseText);
                }
                else if (this._responseType === "xml") {
                    this._data = Utils.parseXMLFromString(this._http.responseText);
                }
                else {
                    this._data = this._http.response || this._http.responseText;
                }
            }
            catch (e) {
                flag = false;
                this.error(e.message);
            }
            flag && this.event("complete", this._data instanceof Array ? [this._data] : this._data);
        }
        clear() {
            var http = this._http;
            http.onerror = http.onabort = http.onprogress = http.onload = null;
        }
        get url() {
            return this._url;
        }
        get data() {
            return this._data;
        }
        get http() {
            return this._http;
        }
    }
    exports.Base64 = Base64;
    exports.EventDispatcher = EventDispatcher;
    exports.HttpRequest = HttpRequest;
    return exports;
}({}))