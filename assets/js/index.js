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
			console.log(file);
		}

		/**
		 * 文件被删除
		 * @param {File} file 
		 */
		onFileRemoved(file) {
			console.log(file);
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
			$this.canvas.width = 2048;
			$this.canvas.height = 2048;
			//绘画上下文
			$this.ctx = $this.canvas.getContext("2d");
			var c = document.querySelector("#canvasRoot");
			c.appendChild($this.canvas);
			//上传处理			
			$this.btnUpload = document.getElementById("btn_package_file");
			this.btnUpload.onclick = function (e) {
				if (e.currentTarget != $this.btnUpload)return;				
				var dropzone = window.DropZoneLogic.dropzone;
				var len = dropzone.files.length;
				// if(len > 0){
					// $this.btnUpload.style.display = "none";
				// }
				if($this.isSpliting){
					alert("正在分解..");
					return;
				}
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
			createImageBitmap(file).then((data) => {
				//data：	ImageBitmap
				console.log(data);
				$this.ctx.drawImage(data,0,0);
			});
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
