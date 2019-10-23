/**
 * 个人工具集合
 */
window.Dxh = (function(exports){
    'use strict';
    /**
     * base64处理工具
     */
    class Base64{
        /**
         * 构造函数
         */
        constructor(){

        }

        /**
         * 编码Base64
         * @param {string} input 
         */
        static encode64(input){
            input = escape(input);
            var output = "";
            var chr1,chr2,chr3 = "";
            var enc1,enc2,enc3,enc4 = "";
            var i = 0;
            do{
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = chr3 & 63;
                if(isNaN(chr2)){
                    enc3 = enc4 = 64;
                }else if(isNaN(chr3)){
                    enc4 = 64;
                }
                output = output + Base64.keyChar.charAt(enc1) + 
                Base64.keyChar.charAt(enc2) + Base64.keyChar.charAt(enc3) + 
                Base64.keyChar.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";                                
            }while(i < input.length);
            return output;
        }

        /**
         * 解码Base64
         * @param {string} input 
         */
        static decode64(input){
            var output = "";
            var chr1,chr2,chr3 = "";
            var enc1,enc2,enc3,enc4 = "";
            var i = 0;
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if(base64test.exec(input)){
                alert("ERROR INPUT:base64字符只能包含A-Z,a-z,0-9,'+','/','='");
                return;
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do{
                enc1 = Base64.keyChar.indexOf(input.charAt(i++));
                enc2 = Base64.keyChar.indexOf(input.charAt(i++));
                enc3 = Base64.keyChar.indexOf(input.charAt(i++));
                enc4 = Base64.keyChar.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if(enc3 != 64){
                    output = output + String.fromCharCode(chr2);
                }
                if(enc4 != 64){
                    output = output + String.fromCharCode(chr3);
                }
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            }while(i < input.length);
            return unescape(output);
        }
    }

    Base64.keyChar = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`;

    exports.Base64 = Base64;
    return exports;
}({}))