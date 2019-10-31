!function () {
	"use strict";
	/**
	 * 拖动逻辑
	 */
	class DropZoneLogic {
		constructor() {
			this.dropzone = null;
			this.initialize();
		}
		/**
		 * 初始化
		 */
		initialize() {
			// Dropzone.autoDiscover = !1;
			var $this = this;
			var zone = {};
			Dropzone.options.myAwesomeDropzone = zone;
			zone.paramName = "packer";
			zone.maxFilesize = 5;
			// zone.maxFiles = 1;
			zone.init = $this.init;
			zone.accept = $this.accept;
			zone.url = "/";
			zone.acceptedFiles = ".png,.atlas,.json";
			zone.addRemoveLinks = true;
			zone.previewTemplate = `
			<div class="dz-preview dz-file-preview">
			<div class="dz-details">
    		<div class="dz-filename"><span data-dz-name></span></div>
    		<div class="dz-size" data-dz-size></div>
    		<img data-dz-thumbnail />
			`
		}

		/**
		 * 文件被添加上的回调
		 * @param {File} file 
		 */
		onFileAdded(file) {
			this.updateBtnDisplay();
		}

		/**
		 * 文件被删除
		 * @param {File} file 
		 */
		onFileRemoved(file) {
			this.updateBtnDisplay();
		}

		updateBtnDisplay() {
			var $this = this;
			var files = $this.dropzone.files;
			var btn = document.getElementById("btn_package_file");
			if (files.length <= 0) {
				btn.style.display = "none";
			} else {
				var isExistPng = false;
				for (var i = 0; i < files.length; ++i) {
					if (files[i].type === "image/png") {
						isExistPng = true;
						break;
					}
				}
				btn.style.display = isExistPng ? "" : "none";
			}
		}

		/**
		 * 文件被放到dropzone区域
		 */
		onDrop(event) {
		}

		/**
		 * 出错
		 */
		onError(file) {
			console.log("ERROR");
		}

		/**
		 * 离开zone区域
		 * @param {Event} event 
		 */
		onDragLeave(event) {

		}

		/**
		 * zone初始化函数
		 */
		init() {
			var $this = window.DropZoneLogic;
			$this.dropzone = this;
			this.on("addedfile", (file) => {
				$this.onFileAdded(file);
			});
			this.on("removedfile", (file) => {
				$this.onFileRemoved(file);
			});

			this.on("dragleave", (event) => {
				$this.onDragLeave(event);
			});
			this.on("drop", (event) => {
				$this.onDrop(event);
			});
			$this.updateBtnDisplay();
		}
		/**
		 * 处理回调
		 * @param {File} file 
		 * @param {Function} done 
		 */
		accept(file, done) {
		}
	}

	/**
	 * 界面逻辑
	 */
	class ViewLogic {
		/**
		 * 构造函数
		 */
		constructor() {
			var $this = this;
			//是否正在分解中
			$this.isSpliting = false;
			//上传处理			
			$this.btnUpload = document.getElementById("btn_package_file");
			//图集分解对象
			$this.atlasSpliterAry = [];
			$this.splitCount = 0;
			//压缩	
			$this.zip = new JSZip();

			//鼠标点击事件注册
			this.btnUpload.onclick = function (e) {
				if (e.currentTarget != $this.btnUpload) return;
				$this.btnUpload.innerText = "正在分解....";
				$this.btnUpload.onclick = null;
				var dropzone = window.DropZoneLogic.dropzone;
				$this.isSpliting = true;
				var files = dropzone.files;
				var len = files.length;
				for (var i = 0; i < len; ++i) {
					if (files[i].type == "image/png") {//找到一个是文件
						var configFile = $this.findAtlasMatchConfig(files[i].name, files, $this);
						var spliter = new AtlasSpliter(files[i], $this.zip, configFile);
						$this.splitCount++;
						$this.atlasSpliterAry.push(spliter);
					}
				}

				for (var i = 0; i < $this.atlasSpliterAry.length; ++i) {
					$this.atlasSpliterAry[i].startUp($this.onAtlasFileSplitComplete);
				}
			}
		}

		/**
		 * 图集分解完成回调
		 */
		onAtlasFileSplitComplete() {
			var $this = window.ViewLogic;
			if (!$this.isSpliting) {
				return;
			}
			$this.splitCount--;
			if ($this.splitCount <= 0) {
				$this.isSpliting = false;
				var blob = $this.zip.generate({ type: "blob" });
				saveAs(blob, "AtlasSplit" + ".zip");
			}
		}

		/**
		 * 获取图集图片对应的配置文件
		 * @param {String} fileName 
		 * @param {Array<File>} files 
		 * @param {ViewLogic} $this 
		 */
		findAtlasMatchConfig(fileName, files, $this) {
			var prefix = fileName.split(".")[0];
			for (var i = 0; i < files.length; ++i) {
				var nameAry = files[i].name.split(".");
				if (nameAry.length != 2) {
					continue;
				}
				if (nameAry[0] == prefix && (nameAry[1] == "atlas" || nameAry[1] == "json")) {
					return files[i];
				}
			}
		}

		/**
		 * 通过jszip下载
		 * @param {Array} imageDataAry 
		 */
		downloadMethodByJSZip(imageDataAry) {
			var $this = this;
			$this.btnUpload.innerText = "分解完成开始打包....";
			var zip = new JSZip();
			var folder = zip.folder($this.preFix);
			for (var i = 0; i < imageDataAry.length; ++i) {
				$this.canvas.width = imageDataAry[i].width;
				$this.canvas.height = imageDataAry[i].height;
				$this.ctx.putImageData(imageDataAry[i], 0, 0);
				var base64 = $this.canvas.toDataURL("image/png", 1);
				base64 = base64.split(",")[1];
				folder.file($this.preFix + "_" + i + ".png", base64, { base64: true });
			}
			var blob = zip.generate({ type: "blob" });
			saveAs(blob, $this.preFix + ".zip");
			$this.btnUpload.innerText = "下载完成 感谢使用";
		}

		/**
		 * 可以下载  但是不能选择文件夹下载
		 */
		downloadMethodByCreateHerfA(imageDataAry) {
			var $this = this;
			var dLink = document.createElement("a");

			for (var i = 0; i < imageDataAry.length; ++i) {
				$this.canvas.width = imageDataAry[i].width;
				$this.canvas.height = imageDataAry[i].height;
				$this.ctx.putImageData(imageDataAry[i], 0, 0);
				var imgUrl = $this.canvas.toDataURL("image/png", 1);

				dLink.download = $this.preFix + "_" + i;
				dLink.href = imgUrl;
				dLink.dataset.downloadurl = ["image/png", dLink.download, dLink.href].join(":");
				document.body.appendChild(dLink);
				dLink.click();
			}
			document.body.removeChild(dLink);
		}

		/**
		 * 会存在安全影响，不适用，而且下载下来的的文件也需要修改后缀
		 * @param {Array} imageDataAry 
		 */
		downloadMethodByChgFileType(imageDataAry) {
			var $this = this;
			$this.canvas.width = imageDataAry[0].width;
			$this.canvas.height = imageDataAry[0].height;
			$this.ctx.putImageData(imageDataAry[0], 0, 0);
			var image = new Image(imageDataAry[0].width, imageDataAry[0].height);
			image.src = $this.canvas.toDataURL("image/png", 1);
			var url = image.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			window.open(url);
		}
	}

	/**
	 * 图集分解对象
	 */
	class AtlasSpliter {
		/**
		 * 构造函数
		 * @param {File} sourceFile 
		 * @param {JSZip} zip 
		 * @param {File} atlasFile 
		 */
		constructor(sourceFile, zip, atlasFile) {
			this.isUseConfig = atlasFile == null ? false : true;//是否使用图集配置文件
			this.sourceFile = sourceFile;//图集文件
			this.atlasFile = atlasFile;//配置文件
			this.zip = zip;//JSZip对象 在打包完成后 将文件写入这个对象中
			this.callBack = null;//分解完成回调
			this.preFix = sourceFile.name.split(".")[0];//文件前缀  在无图集文档的时候使用
			this.canvas = document.createElement("canvas");//cavnas对象
			this.canvas.width = AtlasSpliter.MAX_W;
			this.canvas.height = AtlasSpliter.MAX_H;
			this.ctx = this.canvas.getContext("2d");//绘图上下文
			this.atlasW = 0;//图集宽度
			this.atlasH = 0;//图集高度
		}

		/**
		 * 开始分解
		 * @param {Function} callBack 
		 */
		startUp(callBack) {
			this.callBack = callBack;
			this.saveFileToCanvas();
		}

		/**
		 * 将文件写入Canvas
		 */
		saveFileToCanvas() {
			var $this = this;
			createImageBitmap($this.sourceFile).then((data) => {
				$this.startSplit(data, $this);
			});
		}
		/**
		 * 开始分解图集
		 * @param {ImageBitmap} data 
		 * @param {AtlasSpliter} $this 
		 */
		startSplit(data, $this) {
			$this.ctx.drawImage(data, 0, 0);
			var w, h;
			if (data.width > AtlasSpliter.MAX_W) {
				w = AtlasSpliter.MAX_W;
				$this.isUseConfig = false;//超宽不使用图集配置文件解析
			} else {
				w = data.width;
			}
			if (data.height > AtlasSpliter.MAX_H) {
				h = AtlasSpliter.MAX_H;
				$this.isUseConfig = false;//超高不使用图集配置文件解析
			} else {
				h = data.height;
			}
			$this.atlasW = w;
			$this.atlasH = h;

			//区分分解方式
			if ($this.isUseConfig) {
				$this.splitByAtlasConfig($this);
			} else {
				$this.splitByColorsMap($this);
			}
		}

		/**
		 * 通过配置文件分解图集
		 * @param {AtlasSpliter} $this 
		 */
		splitByAtlasConfig($this) {
			var reader = new FileReader();
			reader.readAsText($this.atlasFile, "UTF-8");
			reader.onload = function (e) {
				var content = e.target.result;
				var json = JSON.parse(content);
				var frames = json.frames;
				var rects = [];
				var nameAry = [];
				for (var element in frames) {
					var data = frames[element];
					var rect = new Rectangle(data.frame.x, data.frame.y, data.frame.w, data.frame.h);
					rects.push(rect);
					nameAry.push(element);
				}
				//碎图数据
				var dataAry = $this.generateImageDataAry(rects, $this);
				$this.ctx.clearRect(0, 0, AtlasSpliter.MAX_W, AtlasSpliter.MAX_H);
				$this.saveImageDatasByJSZip(dataAry, $this, nameAry);
				//保存完成执行回调
				if ($this.callBack) {
					$this.callBack.call();
				}
			}
		}

		/**
		 * 通过逐像素判定分解图集
		 * @param {AtlasSpliter} $this 
		 */
		splitByColorsMap($this) {
			var colors = $this.generateColorsMap($this);//生成颜色二维数组
			var rects = [];//碎图包围盒集合
			var rect = null;//Rectangle
			for (var i = 0; i < $this.atlasW; ++i) {
				for (var j = 0; j < $this.atlasH; ++j) {
					if ($this.isExist(colors, i, j)) {
						rect = $this.getRect(colors, i, j);
						if (rect.width > 5 && rect.height > 5) {
							rects.push(rect);
						}
					}
				}
			}

			//碎图数据
			var dataAry = $this.generateImageDataAry(rects, $this);
			$this.ctx.clearRect(0, 0, AtlasSpliter.MAX_W, AtlasSpliter.MAX_H);
			$this.saveImageDatasByJSZip(dataAry, $this);
			//保存完成执行回调
			if ($this.callBack) {
				$this.callBack.call();
			}
		}

		/**
		 * 存储图形数据
		 * @param {Array<ImageData>} dataAry 
		 */
		saveImageDatasByJSZip(dataAry, $this, nameAry) {
			var folder = $this.zip.folder($this.preFix);
			for (var i = 0; i < dataAry.length; ++i) {
				$this.canvas.width = dataAry[i].width;
				$this.canvas.height = dataAry[i].height;
				$this.ctx.putImageData(dataAry[i], 0, 0);
				var base64 = $this.canvas.toDataURL("image/png", 1);
				base64 = base64.split(",")[1];
				if (nameAry) {
					folder.file(nameAry[i], base64, { base64: true });
				} else {
					folder.file($this.preFix + "_" + i + ".png", base64, { base64: true });
				}
			}
		}

		/**
		 * 生成图像数据数组
		 * @param {Array<Rectangle>} rects 
		 * @param {AtlasSpliter} $this
		 */
		generateImageDataAry(rects, $this) {
			var dataAry = [];
			for (var i = 0; i < rects.length; ++i) {
				var data = $this.ctx.getImageData(rects[i].x, rects[i].y, rects[i].width, rects[i].height);
				dataAry.push(data);
			}
			return dataAry;
		}

		/**
		 * 获取碎图区域
		 * @param {Array} colors 
		 * @param {Number} x 
		 * @param {Number} y 
		 */
		getRect(colors, x, y) {
			var rect = new Rectangle(x, y, 1, 1);
			var flag;
			do {
				flag = false;
				while (this.R_Exist(colors, rect)) {
					rect.width++;
					flag = true;
				}
				while (this.D_Exist(colors, rect)) {
					rect.height++;
					flag = true;
				}
				while (this.L_Exist(colors, rect)) {
					rect.width++;
					rect.x--;
					flag = true;
				}
				while (this.U_Exist(colors, rect)) {
					rect.height++;
					rect.y--;
					flag = true;
				}
			} while (flag);
			this.clearRect(colors, rect);
			rect.width++;
			rect.height++;

			return rect;
		}

		/**
		 * 生成像素颜色二维图
		 * @param {AtlasSpliter} $this 
		 */
		generateColorsMap($this) {
			var map = [];
			var count;
			var allPixel = $this.ctx.getImageData(0, 0, $this.atlasW, $this.atlasH);//所有像素数据
			for (var i = 0; i < $this.atlasW; ++i) {
				map[i] = [];
				for (var j = 0; j < $this.atlasH; ++j) {
					var startIndex = (j * $this.atlasW + i) * 4;
					count = 0;
					if (allPixel.data[startIndex] < 4) count++;
					if (allPixel.data[startIndex + 1] < 4) count++;
					if (allPixel.data[startIndex + 2] < 4) count++;
					//当像素alpha值过小，或者颜色与alpha都小的时候视为空白像素
					if (allPixel.data[startIndex + 3] < 3 || (count > 2 && allPixel.data[startIndex + 3] < 30)) map[i][j] = false;
					else map[i][j] = true;
				}
			}
			return map;
		}

		/**
		 * 是否存在颜色
		 * @param {Array} colors 
		 * @param {Number} x 
		 * @param {Number} y 
		 */
		isExist(colors, x, y) {
			if (x < 0 || y < 0 || x >= colors.length || y >= colors[0].length) {
				return false;
			} else {
				return colors[x][y];
			}
		}

		/**
		 * 清空Rectangle区域内的像素
		 * @param {Array} colors 
		 * @param {Rectangle} rect 
		 */
		clearRect(colors, rect) {
			var right = rect.x + rect.width;
			var left = rect.x;
			var top = rect.y;
			var bottom = rect.y + rect.height;
			for (var i = left; i <= right; i++) {
				for (var j = top; j <= bottom; ++j) {
					colors[i][j] = false;
				}
			}
		}

		/**
		 * 右侧是否有真实像素存在
		 * @param {Array} colors 
		 * @param {Rectangle} rect 
		 */
		R_Exist(colors, rect) {
			var right = rect.x + rect.width;
			if (right >= colors.length || rect.x < 0) return false;
			for (var i = 0; i < rect.height; i++) {
				if (this.isExist(colors, right + 1, rect.y + i)) return true;
			}
			return false;
		}

		/**
		 * 下方是否存在真实像素
		 * @param {Array} colors 
		 * @param {Rectangle} rect 
		 */
		D_Exist(colors, rect) {
			var bottom = rect.y + rect.height;
			if (bottom >= colors[0].length || rect.y < 0) return false;
			for (var i = 0; i < rect.width; ++i) {
				if (this.isExist(colors, rect.x + i, bottom + 1)) return true;
			}
			return false;
		}

		/**
		 * 左侧是否存在真实像素
		 * @param {Array} colors 
		 * @param {Rectangle} rect 
		 */
		L_Exist(colors, rect) {
			var right = rect.x + rect.width;
			if (right >= colors.length || rect.x < 0) return false;
			for (var i = 0; i < rect.height; ++i) {
				if (this.isExist(colors, rect.x - 1, rect.y + i)) return true;
			}
			return false;
		}

		/**
		 * 上方是否存在真实像素
		 * @param {Array} colors 
		 * @param {Rectangle} rect 
		 */
		U_Exist(colors, rect) {
			var bottom = rect.y + rect.height;
			if (bottom >= colors[0].length || rect.y < 0) return false;
			for (var i = 0; i < rect.width; ++i) {
				if (this.isExist(colors, rect.x + i, rect.y - 1)) return true;
			}
			return false;
		}
	}
	/**
	 * 最大宽度
	 */
	AtlasSpliter.MAX_W = 2048;
	/**
	 * 最大高度
	 */
	AtlasSpliter.MAX_H = 2048;

	/**
	 * 矩形框数据
	 */
	class Rectangle {
		constructor(x = 0, y = 0, width = 0, height = 0) {
			var $this = this;
			$this.x = x;
			$this.y = y;
			$this.width = width;
			$this.height = height;
		}
	}

	/**
	 * 主函数
	 */
	class Main {
		constructor() {
			this.initialize();			
		}
		initialize() {
			window.DropZoneLogic = new DropZoneLogic();
			window.ViewLogic = new ViewLogic();
			// console.log(Tool.Base64.keyChar);
		}
	}
	new Main();
}()
