"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 个人工具集合
 */
window.Tool = function (exports) {
    'use strict';
    /**
     * base64处理工具
     */

    var Base64 = function () {
        /**
         * 构造函数
         */
        function Base64() {
            _classCallCheck(this, Base64);
        }

        /**
         * 编码Base64
         * @param {string} input 
         */


        _createClass(Base64, null, [{
            key: "encode64",
            value: function encode64(input) {
                input = escape(input); //转义字符
                var output = "";
                var c1,
                    c2,
                    c3 = "";
                var e1,
                    e2,
                    e3,
                    e4 = "";
                var i = 0;
                var n = 2;
                do {
                    c1 = input.charCodeAt(i++); //返回指定字符位置的Unicode编码
                    c2 = input.charCodeAt(i++);
                    c3 = input.charCodeAt(i++);
                    e1 = c1 >> 2; //右移2位 
                    e2 = (c1 & 3) << 4 | c2 >> 4; //3二进制：11
                    e3 = c3 & 63; //63二进制：111111
                    if (isNaN(c2)) {
                        e3 = e4 = 64; //=
                    } else if (isNaN(c3)) {
                        e4 = 64; //=
                    }
                    output = output + Base64.keyChar.charAt(e1) + Base64.keyChar.charAt(e2) + Base64.keyChar.charAt(e3) + Base64.keyChar.charAt(e4);
                    c1 = c2 = c3 = "";
                    e1 = e2 = e3 = e4 = "";
                } while (i < input.length);
                return output;
            }

            /**
             * 解码Base64
             * @param {string} input 
             */

        }, {
            key: "decode64",
            value: function decode64(input) {
                var output = "";
                var c1,
                    c2,
                    c3 = "";
                var e1,
                    e2,
                    e3,
                    e4 = "";
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
                    c1 = e1 << 2 | e2 >> 4;
                    //
                    c2 = (e2 & 15) << 4 | e3 >> 2; //15二进制：1111
                    c3 = (e3 & 3) << 6 | e4; //3二进制：11
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
            // static keyChar = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`;

        }]);

        return Base64;
    }();

    Base64.keyChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    exports.Base64 = Base64;
    return exports;
}({});