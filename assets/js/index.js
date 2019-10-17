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
			this.initialize();
		}
		/**
		 * 初始化
		 */
		initialize() {
			var $this = this;
			var zone = {};
			Dropzone.options.myAwesomeDropzone = zone;
			zone.paramName = "packer";
			zone.maxFilesize = 5;
			zone.init = $this.init;
			zone.accept = $this.accept;
		}

		/**
		 * 文件被添加上的回调
		 * @param {File} file 
		 */
		onFileAdded(file){
			console.log(file);
			// UpLoadFileData.I.fileDic[file.name] = file;
		}

		/**
		 * 文件被删除
		 * @param {File} file 
		 */
		onFileRemoved(file){
			console.log(file);
			// delete UpLoadFileData.I.fileDic[file.name];
		}

		/**
		 * zone初始化函数
		 */
		init(){
			var $this = window.DropZoneLogic;
			this.on("addedfile",(file)=>{
				$this.onFileAdded(file);
			});
		}
		/**
		 * 处理回调
		 * @param {File} file 
		 * @param {Function} done 
		 */
		accept(file,done){

		}
	}

	window.DropZoneLogic = new DropZoneLogic();
}()
