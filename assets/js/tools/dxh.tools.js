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
    exports.Base64 = Base64;
    return exports;
}({}))

/**
 * laya引擎部分代码 使用node环境驱动
 */
window.Laya = (function (exports) {
    "use strict";
    /**
     * 封装所有驱动接口
     */
    class Device {
        /**
         * 构造函数
         */
        constructor() { }

        /**
         * 请求模块
         * @param {string} mod 
         */
        static require(mod) {
            var rst;
            rst = require(mod);
            return rst;
        }

        /**
         * 远程请求模块
         * @param {string} mod 
         */
        static requireRemote(mod) {
            if (!Device.remote) return Device.require(mod);
            return Device.remote.require(mod);
        }

        static app = null;
        static appName = "MyPrivateTool";
        static appPath = null;
        static dataPath = null;
        static tempPath = null;
        static workPath = null;
        static userHome = null;
        static extensionPath = null;
        static remote = null;
        static Buffer = null;
        static electron = null;
        static win = null;
    }

    /**
     * 全局静态入口
     */
    class Sys{

        /**
         * 转换为浮点数
         * @param {string} value 
         */
        static mParseFloat(value){
            value = parseFloat(value);
            if(isNaN(value))return 0;
            return value;
        }
    }

    /**
     * 操作系统数据
     */
    class OSInfo{
        /**
         * node os对象
         * http://nodejs.cn/api/os.html
         */
        static os=null;
        /**
         * 编译Node.js的操作系统平台
         */
        static platform=null;
        static homedir=null;
        static tempdir=null;
        /**
         * 操作系统标识符
         * Windows:"Windows_NT"
         * Linux:"Linux"
         * macOS:"Darwin"   ^_^
         */
        static type=null;
        /**
         * 进程
         */
        static process=null;
        /**
         * 环境变量键值对
         */
        static env=null;
        static init(){
            OSInfo.os = Device.require("os");
            OSInfo.platform = OSInfo.os.platform();
            OSInfo.tempdir = OSInfo.os.tmpdir();
            OSInfo.type = OSInfo.os.type();
            var tProcess;
            tProcess = process;//进程
            OSInfo.process = tProcess;
            OSInfo.env = OSInfo.process.env;
        }
    }

    /**
     * 文件处理工具
     */
    class FileTools {
        constructor() { }
        /**
         * NodeJs fs库
         */
        static fs = null;
        static win = null;
        static path = null;
        static shell = null;
        static tempApp = null;
        static watcherDic = {};
        /**
         * 读取文件
         * @param {string} path 全路径
         * @param {string} encoding 编码格式
         */
        static readFile(path, encoding) {
            //默认utf-8编码
            (encoding === void 0) && (encoding = "utf8");
            if (this.fs.existsSync(path)) {//判定文档是否存在
                var rst;
                rst = FileTools.fs.readFileSync(path, encoding);//读取文件

                //这种情况只会出现在Win操作系统中编码格式使用utf-8的情况下，操作系统会默认添加一个BOM标识符
                //如果满足 在此我们直接去掉
                if ((typeof rst == 'string') &&
                    rst.charCodeAt(0) == 65279 &&
                    encoding == "utf8") {
                    rst = rst.substr(1);
                }
                return rst;
            }
            return null;
        }

        /**
         * 删除文件
         * @param {string} path 全路径
         * @param {boolean} toTrash 是否删除到回收站
         */
        static removeFile(path,toTrash){
            (toTrash===void 0) && (toTrash = true);
            if(toTrash){
                FileTools.moveToTrash(path);
                return;
            }
            if(Boolean(path)){
                FileTools.fs.unlinkSync(path);
            }
        }

        /**
         * 移动文件到回收站
         * @param {string} path 全路径
         */
        static moveToTrash(path){
            if(FileTools.exist(path)){
                if(FileTools.shell){
                    FileTools.shell.moveItemToTrash(path);
                }else{
                    FileTools.removeE(path,false);
                }
            }
        }

        /**
         * 移除文件
         * @param {string} path 
         * @param {boolean} toTrash 
         */
        static removeE(path,toTrash){
            (toTrash===void 0) && (toTrash = true);
            if(!FileTools.exist(path))return;
            if(FileTools.isDirectory(path)){
                FileTools.removeDir(path,toTrash);
            }else{
                FileTools.removeFile(path,toTrash);//文件直接移除文件
            }
        }

        /**
         * 是否存在该路径文件
         * @param {string} path 全路径
         */
        static exist(path){
            if(!path)return false;
            return FileTools.fs.existsSync(path);
        }

        /**
         * 移除目录
         * @param {string} path 
         * @param {boolean} toTrash 
         */
        static removeDir(path,toTrash){
            (toTrash===void 0) && (toTrash = true);
            if(toTrash){
                FileTools.moveToTrash(path);
                return;
            }
            var files = [];
            if(FileTools.fs.existsSync(path)){
                files = FileTools.fs.readdirSync(path);
                files.forEach(function(file,index){
                    var curPath = FileTools.getPath(path,file);
                    if(FileTools.fs.statSync(curPath).isDirectory()){
                        FileTools.removeDir(curPath);
                    }else{
                        FileTools.fs.unlinkSync(curPath);
                    }
                });
                FileTools.fs.rmdirSync(path);
            }
        }

        /**
         * 获取全路径
         * @param {string} basePath 
         * @param {string} relativePath 相对路径
         */
        static getPath(basePath,relativePath){
            return FileTools.path.join(basePath,relativePath);
        }

        /**
         * 在指定路径创建文件
         * @param {string} path 
         * @param {object} value 
         * @param {object} option 
         * encoding:编码格式，默认utf8，当data为buffer时，改值为ignored
         * moede：文件读写权限，默认值438
         * flag：默认值“w” 读写状态
         */
        static createFile(path,value,option){
            FileTools.ensurePath(path);
            if(option){
                FileTools.fs.writeFileSync(path,value,option);
            }else{
                FileTools.fs.writeFileSync(path,value);
            }
        }

        /**
         * 试探路径，不存在则创建
         * @param {string} pathStr 
         */
        static ensurePath(pathStr){
            return FileTools.mkdirSync(pathStr,null);            
        }

        /**
         * 创建路径 返回是否创建
         * @param {string} dirPath 
         * @param {object} mode 
         */
        static mkdirSync(dirPath,mode){
            if(!FileTools.fs.existsSync(dirPath)){
                var pathtmp;
                var pathParts = dirPath.split(FileTools.getPathSep(dirPath));
                pathParts.pop();
                var onWindows = OSInfo.type.indexOf("Windows") > -1;
                if(!onWindows){
                    pathtmp = "/" + pathParts[1];
                    pathParts.splice(0,2);
                }
                pathParts.forEach(function(dirname){
                    if(pathtmp){
                        pathtmp = FileTools.path.join(pathtmp,dirname);
                    }else{
                        pathtmp = dirname;
                    }
                    if(!FileTools.fs.existsSync(pathtmp)){
                        if(!FileTools.fs.mkdirSync(pathtmp,mode)){
                            return false;
                        }
                    }
                });
            }
            return true;
        }

        /**
         * 获取文件路径分隔符类型  
         * @param {string} tpath 
         */
        static getPathSep(tpath){
            if(tpath.indexOf("/") >= 0)return "/";
            if(tpath.indexOf("\\") >= 0)return "\\";
            return FileTools.path.seq;
        }

        /**
         * 确定是否是目录
         * @param {string} path 
         */
        static isDirectory(path){
            var st;
            try{
                st = FileTools.fs.statSync(path);
            }catch(e){
                return false;
            }
            if(!st)return false;
            return st.isDirectory();
        }
    }

    /**
     * node js工具
     */
    class NodeJSTool{
        constructor(){}
        
        /**
         * 请求对应包
         * @param {string} str 
         */
        static require(str){
            return require(str);
        }
        
        /**
         * 获取nodejs 启动时传入的命令行参数
         * @returns Array
         */
        static getArgV(){
            var argv = process.argv;
            console.log("argv:",margv);
            return argv;
        }

        /**
         * 将参数对象化
         * @param {Array} args 
         * @param {Number} start 
         * @param {object} out 
         */
        static parseArgToObj(args,start,out){
            (start===void 0) && (start = 0);
            var i = 0,len = 0;
            var tParam;
            var pArr;
            for(i = start;i < len;++i){
                tParam = args[i];
                if(tParam.indexOf("=") > 0){
                    pArr = tParam.split("=");
                    if(out[pArr[0]] && typeof(out[pArr[0]]) == "number"){
                        pArr[1] = Sys.mParseFloat(pArr[1]);
                    }
                    console.log(pArr);
                    out[pArr[0]] == pArr[1];
                }
            }
        }

        /**
         * 获取环境路径
         */
        static getMyPath(){
            return __dirname;
        }   

        /**
         * 反射
         * @param {string} codeStr 
         */
        static eval(codeStr){
            return eval(codeStr);
        }
    }

    /**
     * 字符串工具
     */
    class StringTool{
        constructor(){}
        /**
         * 转大写
         * @param {string} str 
         */
        static toUpCase(str){
            return str.toUpperCase();
        }

        /**
         * 转小写
         * @param {string} str 
         */
        static toLowCase(str){
            return str.toLowerCase();
        }

        /**
         * 将第一个字符转为大写
         * 不管后面的字符
         * @param {string} str 
         */
        static toUpHead(str){
            var rst;
            if(str.length <= 1)return str.toUpperCase();
            rst = str.charAt(0).toUpperCase + str.substr(1);
            return rst;
        }

        /**
         * 首字符转小写
         * @param {string} str 
         */
        static toLowHead(str){
            var rst;
            if(str.length <= 1)return str.toLowerCase();
            rst = rst.charAt(0).toLowerCase() + str.substr(1);
            return rst;            
        }

        /**
         * package名字转全路径
         * @param {string} packageName 
         */
        static packageToFoladerPath(packageName){
            var rst = packageName.replace(".","/");
            return rst;
        }

        /**
         * 从index位置插入iStr到str中
         * @param {string} str 
         * @param {string} iStr 
         * @param {number} index 
         */
        static insert(str,iStr,index){
            return str.substring(0,index) + iStr + str.substr(index);
        }
    }

    /**
     * 压缩工具
     */
    class CompressTool {
        constructor() { }
        /**
         * 编码格式
         */
        static utf8Option = {
            "encoding":"utf8"
        };
        /**
         * uglifyJS对象
         * https://segmentfault.com/a/1190000008995453
         */
        // parse       解释
        // compress    压缩
        // mangle      混淆
        // beautify    美化
        // minify      最小化
        // CLI         命令行工具
        // sourcemap   编译后代码对源码的映射，用于网页调试
        // AST         抽象语法树
        // name        名字，包括变量名、函数名、属性名
        // toplevel    顶层作用域
        // unreachable 不可达代码
        // option      选项
        // STDIN       标准输入，指在命令行中直接输入
        // STDOUT      标准输出
        // STDERR      标准错误输出
        // side effects函数副作用，即函数除了返回外还产生别的作用，比如改了全局变量
        static uglify;
        
        /**
         * 初始化后
         */
        static init(){
            this.uglify = Device.require('uglify-js');
        }

        /**
         * 压缩js文件
         * @param {string} filePath 
         * @param {string} tarPath 
         * @param {Function} completeHandler 
         */
        static compressJS(filePath,tarPath,completeHandler){
            var codeStr;
            codeStr = FileTools.readFile(filePath);
            var miniResult;
            miniResult = CompressTool.uglify.minify(codeStr);
            if(miniResult.error){
                console.log("CompressJS Fail:" + filePath + " " + JSON.stringify(miniResult.error));
            }
            var final_code = miniResult.code;
            FileTools.createFile(tarPath,final_code,CompressTool.utf8Option);
            completeHandler && completeHandler();
        }

        /**
         * 压缩json文件
         * 原理：读取文件格式化成json对象，然后通过json再转字符串。。。
         * @param {string} filePath 
         * @param {string} tarPath 
         * @param {Function} completeHandler 
         */
        static compressJson(filePath, tarPath, completeHandler) {
            var codeStr;
            codeStr = FileTools.readFile(filePath);
            try{
                var final_code = JSON.stringify(JSON.parse(codeStr));
                FileTools.createFile(tarPath,final_code,CompressTool.utf8Option);
            }catch(e){
                console.log("CompressJson Fail:" + filePath + " " + e.message);
                FileTools.createFile(tarPath,codeStr,CompressTool.utf8Option);
            }
            completeHandler && completeHandler();
        }

        // pngquant使用中值切割量化算法的修改版本和附加技术来减轻中值切割的缺陷
        // 而不是分裂具有最大音量或颜色数量的盒子，而是选择盒子以最小化其中值的方差
        // 直方图是建立在基本感知模型的基础之上的，这样可以减少图像噪点区域的重量。
        // 为了进一步改善颜色，在类似梯度下降的过程中调整直方图（中值切割重复许多次，在表现不佳的颜色上重量更多）
        // 最后，使用Voronoi迭代（k均值）来校正颜色，这保证了局部最佳的调色板。
        // pngquant在预乘alpha颜色空间中工作，以减少透明颜色的重量
        // 当重新映射时，误差扩散仅应用于若干相邻像素量化为相同值且不是边缘的区域。
        // 这避免了再没有抖动的情况下降视觉质量增加的区域    
        /**
         * 压缩png图片
         * @param {string} filePath 
         * @param {string} tarPath 
         * @param {Function} completeHandler 
         */
        static compressPng(filePath,tarPath,completeHandler){
            var exePath = FileTools.path.join
            (
                NodeJSTool.getMyPath(),"lib","pngquant",
                "win32"==OSInfo.os.platform() ? "pngquant.exe" : "pngquant"
            );
            // exePath = 
        }
    }
    exports.CompressTool = CompressTool;
    exports.Device = Device;
    exports.FileTools = FileTools;
}({}))