!function () {
	"use strict";

	//当前上传文件存储数据
	class UpLoadFileData {

		constructor() {
			this.fileDic = {};
		}
	}
	UpLoadFileData.I = new UpLoadFileData();

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
			zone.acceptedFiles = ".jpg,.png,.jpeg";
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
			console.log(arguments.length);
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

		confirm(question, acceptd, rejected) {
			console.log("confirm");
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
			//分解完成的图片			
			$this.splitCompleteAry = [];
			//是否正在分解中
			$this.isSpliting = false;
			//填充画布
			$this.canvas = document.createElement("canvas");
			$this.canvas.width = ViewLogic.WIDTH;
			$this.canvas.height = ViewLogic.HEIGHT;
			//绘画上下文
			$this.ctx = $this.canvas.getContext("2d");
			$this.atlasH = 0;
			$this.atlasW = 0;
			$this.preFix = "";
			var c = document.querySelector("#canvasRoot");
			c.appendChild($this.canvas);
			//上传处理			
			$this.btnUpload = document.getElementById("btn_package_file");
			this.btnUpload.onclick = function (e) {
				if (e.currentTarget != $this.btnUpload) return;
				$this.btnUpload.innerText = "正在分解....";
				$this.btnUpload.onclick = null;
				var dropzone = window.DropZoneLogic.dropzone;
				var len = dropzone.files.length;
				if (len > ViewLogic.MAX_ATLAS) {
					alert("最大支持" + ViewLogic.MAX_ATLAS + "个图集的分解功能");
					return;
				}
				$this.ctx.clearRect(0, 0, $this.ctx.width, $this.ctx.height);
				$this.isSpliting = true;
				for (var i = 0; i < len; ++i) {
					$this.saveFileToCanvas(dropzone.files[i]);
				}
			}
		}

		/**
		 * 保存数据
		 * @param {File} file 
		 */
		saveFileToCanvas(file) {
			var $this = this;
			this.preFix = file.name.split(".")[0];
			createImageBitmap(file).then((data) => {
				$this.startSplit(data, $this);
			});
		}

		startSplit(data, $this) {
			// this = $this;
			//data：	ImageBitmap
			$this.ctx.drawImage(data, 0, 0);
			var w = data.width > ViewLogic.WIDTH ? ViewLogic.WIDTH : data.width;
			var h = data.height > ViewLogic.HEIGHT ? ViewLogic.HEIGHT : data.height;
			$this.atlasH = h;
			$this.atlasW = w;
			var colors = $this.getColors($this);
			var rects = [];//Rectangle Array
			var rect = null;//Rectangle Pointer
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
			console.log("分解完成长度：" + rects.length);
			var imageDataAry = [];
			for (var i = 0; i < rects.length; ++i) {
				var data = $this.ctx.getImageData(rects[i].x, rects[i].y, rects[i].width, rects[i].height);
				imageDataAry.push(data);
			}
			$this.ctx.clearRect(0, 0, ViewLogic.WIDTH, ViewLogic.HEIGHT);

			//for 
			// $this.downloadMethodByCreateHerfA(imageDataAry);
			$this.downloadMethodByJSZip(imageDataAry);
			//TODO 将文件打包成zip再下载
		}

		/**
		 * 通过jszip下载
		 * @param {Array} imageDataAry 
		 */
		downloadMethodByJSZip(imageDataAry) {
			var $this = this;
			$this.btnUpload.innerText = "分解完成开始打包....";
			var zip = new JSZip();
			for (var i = 0; i < imageDataAry.length; ++i) {
				$this.canvas.width = imageDataAry[i].width;
				$this.canvas.height = imageDataAry[i].height;
				$this.ctx.putImageData(imageDataAry[i], 0, 0);
				var base64 = $this.canvas.toDataURL("image/png", 1);
				base64 = base64.split(",")[1];
				zip.file($this.preFix + "_" + i + ".png", base64, { base64: true });
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

		getRect(colors, x, y) {
			var rect = new Rectangle(x, y, 1, 1);
			var flag;
			do {
				flag = false;
				while (this.R_Exist(colors, rect)) { rect.width++; flag = true }
				while (this.D_Exist(colors, rect)) { rect.height++; flag = true }
				while (this.L_Exist(colors, rect)) { rect.width++; rect.x--; flag = true }
				while (this.U_Exist(colors, rect)) { rect.height++; rect.y--; flag = true }
			} while (flag);
			this.clearRect(colors, rect);
			rect.width++;
			rect.height++;

			return rect;
		}

		clearRect(colors, rect) {
			var right = rect.x + rect.width;
			var left = rect.x;
			var top = rect.y;
			var bottom = rect.y + rect.height;
			for (var i = left; i <= right; i++) {
				for (var j = top; j < bottom; ++j) {
					colors[i][j] = false;
				}
			}
		}

		R_Exist(colors, rect) {
			var right = rect.x + rect.width;
			if (right >= colors.length || rect.x < 0) return false;
			for (var i = 0; i < rect.height; i++) {
				if (this.isExist(colors, right + 1, rect.y + i)) return true;
			}
			return false;
		}

		D_Exist(colors, rect) {
			var bottom = rect.y + rect.height;
			if (bottom >= colors[0].length || rect.y < 0) return false;
			for (var i = 0; i < rect.width; ++i) {
				if (this.isExist(colors, rect.x + i, bottom + 1)) return true;
			}
			return false;
		}

		L_Exist(colors, rect) {
			var right = rect.x + rect.width;
			if (right >= colors.length || rect.x < 0) return false;
			for (var i = 0; i < rect.height; ++i) {
				if (this.isExist(colors, rect.x - 1, rect.y + i)) return true;
			}
			return false;
		}

		U_Exist(colors, rect) {
			var bottom = rect.y + rect.height;
			if (bottom >= colors[0].length || rect.y < 0) return false;
			for (var i = 0; i < rect.width; ++i) {
				if (this.isExist(colors, rect.x + i, rect.y - 1)) return true;
			}
			return false;
		}

		isExist(colors, x, y) {
			if (x < 0 || y < 0 || x >= colors.length || y >= colors[0].length) return false;
			return colors[x][y];
		}

		getColors($this) {
			$this.btnUpload.innerText = "正在解析像素....";
			var has = [];
			var count;
			for (var i = 0; i < $this.atlasW; ++i) {
				has[i] = [];
				for (var j = 0; j < $this.atlasH; ++j) {
					var piexel = $this.ctx.getImageData(i, j, 1, 1);
					count = 0;
					if (piexel.data[0] < 4) count++;
					if (piexel.data[1] < 4) count++;
					if (piexel.data[2] < 4) count++;
					if (piexel.data[3] < 3 || (count > 2 && piexel.data[3] < 30)) has[i][j] = false;
					else has[i][j] = true;
				}
			}
			console.log("GET Colors Complete");
			return has;
		}


		changeColorReverse() {
			//数组每4位代表一个像素				
			for (var i = 0; i < allData.data.length; i += 4) {
				allData.data[i] = 255 - allData.data[i];
				allData.data[i + 1] = 255 - allData.data[i + 1];
				allData.data[i + 2] = 255 - allData.data[i + 2];
				allData.data[i + 3] = 255;
			}
		}
	}

	ViewLogic.WIDTH = 2048;
	ViewLogic.HEIGHT = 2048;
	ViewLogic.MAX_ATLAS = 1;

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
			this.viewLogic = new ViewLogic();
		}
	}
	new Main();
}()
