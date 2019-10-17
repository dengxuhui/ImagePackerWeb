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
			// Dropzone.autoDiscover = !1;
			
			var $this = this;
			var zone = {};
			Dropzone.options.myAwesomeDropzone = zone;
			zone.paramName = "packer";
			zone.maxFilesize = 5;
			zone.maxFiles = 1;
			// zone.max
			zone.init = $this.init;
			zone.accept = $this.accept;
			zone.url = "/";
			zone.acceptedFiles = ".jpg,.png,.jpeg";
			zone.addRemoveLinks = true;
			zone.dictRemoveLinks = "删除";
			zone.dictCancelUpload = "取消";
		}

		/**
		 * 文件被添加上的回调
		 * @param {File} file 
		 */
		onFileAdded(file){
			console.log(file);
		}

		/**
		 * 文件被删除
		 * @param {File} file 
		 */
		onFileRemoved(file){
			console.log(file);
		}

		/**
		 * 文件被放到dropzone区域
		 */
		onDrop(event){
			console.log(arguments.length);
		}

		/**
		 * 出错
		 */
		onError(file){
			console.log("ERROR");
		}

		/**
		 * 离开zone区域
		 * @param {Event} event 
		 */
		onDragLeave(event){

		}

		/**
		 * zone初始化函数
		 */
		init(){
			var $this = window.DropZoneLogic;
			this.on("addedfile",(file)=>{
				$this.onFileAdded(file);
			});
			this.on("removedfile",(file)=>{
				$this.onFileRemoved(file);
			});

			this.on("dragleave",(event)=>{
				$this.onDragLeave(event);
			});
			this.on("drop",(event)=>{
				$this.onDrop(event);
			});

		}
		/**
		 * 处理回调
		 * @param {File} file 
		 * @param {Function} done 
		 */
		accept(file,done){
			
		}

		confirm(question,acceptd,rejected){
			console.log("confirm");
		}
	}

	/**
	 * 界面逻辑
	 */
	class ViewLogic{
		/**
		 * 构造函数
		 */
		constructor(){
			//上传处理
			this.btnUpload = document.getElementById("btn_package_file");
			this.btnUpload.onclick = function(e){
				console.log(arguments.length);
			}
		}
	}

	/**
	 * 主函数
	 */
	class Main{
		constructor(){
			this.initialize();
		}
		initialize(){
			window.DropZoneLogic = new DropZoneLogic();
			this.viewLogic = new ViewLogic();
		}
	}

	new Main();
}()
