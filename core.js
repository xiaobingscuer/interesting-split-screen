

var areaName="xxx区域";

var currentPageNo=1; 	// 当前页号，默认为1
var perPageNum=1; 		// 每页多少个，默认为1个
var pageNum;			// 总页数
var pageNoNumMax=5;		// 页号数量最大值 pageNoNumMax>=3
var currentPageResource=new Array(); // 当前资源数组

var videoDivMargin=2;	// 视频div的margin
var videoDivPadding=0; 	// 视频div的padding
var adapterValue=2;		// 视频div的调整余量值

var ACTIVECLASS="active"; // 分页标号点击选中样式
//var startPageNo=1;
var BACKPAGE=-1;		// 向前翻页
var FORWORDPAGE=1;		// 向后翻页



$(document).ready(function(){
	
	/* 检查网络状态 */
	
	/* 初始加载完成时触发事件 */
	rquestServer(currentPageNo,perPageNum);				// 请求服务器
	createVideo(perPageNum);							// 创建视频
	createPage(pageNum,pageNoNumMax);					// 创建分页
	/* 浏览器关闭时触发事件 */
	
	/* 隐藏与显示面纱 */
	$("#faceMark").hide();
	$("#pageTitleDiv").mouseover(function(){
		$("#faceMark").slideDown();
		//$("#faceMark").children().eq(0).attr({"data":currentPageResource[0]});
	});
	$("#faceMark").mouseleave(function(){
		$(this).slideUp();
	});
	
	
});	

	
	/* 屏幕变化事件 */
	$(window).resize(function(){
		adjustVideoDivToScreen();
	});
	
	/* 窗口分隔下拉选择事件 */
	$("#mySelect").change(function(){
		perPageNum=Number($(this).val());
		currentPageNo=1;
		rquestServer(currentPageNo,perPageNum);				// 请求服务器
		removeAllVideoDiv();								// 移除已有视频
		createVideo(perPageNum);							// 重新添加视频
		removeAllPageNo();									// 移除已有分页
		createPage(pageNum,pageNoNumMax);					// 重新开始创建分页
	});
	/* 分页栏标号点击事件 */
	function pageNoClick(self,pageNo){				
		$(".pagination li a").removeClass("active");
		$(self).addClass("active");
		currentPageNo=Number(pageNo);
		console.log(currentPageNo);
		rquestServer(currentPageNo,perPageNum);				// 请求服务器
		removeAllVideoDiv();								// 移除已有视频
		createVideo(perPageNum);							// 重新添加视频
	}
	/* 前一页点击事件 */
	$("#backPage").click(function(){
		$(this).animate({opacity:'0.4'},"fast");
		$(this).animate({opacity:'1'});
		
		var currentPageTag=$(".pagination li a").filter(".active");
		var prePageTag=currentPageTag.parent().prev().children().eq(0);
		console.log(prePageTag.text());
		if(currentPageNo>1&&prePageTag.text()!="..."){
			currentPageNo=currentPageNo-1;
			$(".pagination li a").removeClass("active");
			prePageTag.addClass("active");
		}else if(currentPageNo>1&&prePageTag.text()=="..."){
			updatePageNo(BACKPAGE);
		}
		if(currentPageNo>=1&&currentPageTag.parent().prev().attr("id")!="backPageLi"){
			rquestServer(currentPageNo,perPageNum);						// 请求服务器
			removeAllVideoDiv();										// 移除已有视频
			createVideo(perPageNum);									// 重新添加视频
		}
		
	});
	/* 后一页点击事件 */
	$("#forwardPage").click(function(){
		$(this).animate({opacity:'0.4'},"fast");
		$(this).animate({opacity:'1'});

		var currentPageTag=$(".pagination li a").filter(".active");
		console.log(currentPageTag.text());
		var nextPageTag=currentPageTag.parent().next().children().eq(0);
		console.log(nextPageTag.text());
		if(currentPageNo<pageNum&&nextPageTag.text()!="..."){
			currentPageNo=currentPageNo+1;
			$(".pagination li a").removeClass("active");
			nextPageTag.addClass("active");
		}else if(currentPageNo<pageNum){
			updatePageNo(FORWORDPAGE);
		}
		if(currentPageNo<=pageNum&&currentPageTag.parent().next().attr("id")!="forwardPageLi"){
			rquestServer(currentPageNo,perPageNum);					  // 请求服务器
			removeAllVideoDiv();									  // 移除已有视频
			createVideo(perPageNum);								  // 重新添加视频	
		}
		
	});
	
	/* 创建分页栏编号 */
	function createPageNo(pageNo,className){
		return '<li><a href="#" class="'+className+'" onclick="pageNoClick(this,this.innerHTML)">'+pageNo+'</a></li>';
	}
	/* 创建点省略 */
	function createDots(){
		return '<li id="dotsLi"><a href="#" id="dots">...</a></li>';
	}
	/* 没有内容时的说明*/
	function createPageNoNullWords(){
		return '<li><a href="#" >空资源</a></li>';
	}
	/* 正在请求资源，请等待	*/
	function createPageRequstWaiting(){
		return '<li><a href="#" >正在请求资源，请等待</a></li>';
	}
	/* 资源请求失败， */
	function createPageRequstFaile(){
		return '<li><a href="#" id="words">资源请求失败</a></li>';
	}
	/* 移除所有的标号并显示没内容的提示 */
	function removeAllPageNo(){		
		$("#backPageLi").nextUntil($("#forwardPageLi")).remove();	
	}
	/* 在页面分页栏中首次添加页号 */
	function createPage(pageNum,pageNoNumMax){
		if(pageNum==null){
			$("#forwardPageLi").next().remove();
			$("#forwardPageLi").after(createPageRequstFaile());
			return;
		}
		if(pageNum==0){
			removeAllPageNo();
			$("#forwardPageLi").before(createPageNoNullWords());
			return;
		}
		if(pageNum<=pageNoNumMax){
			var pageNo=1;
			$("#forwardPageLi").before(createPageNo(pageNo,ACTIVECLASS));
			pageNo++;
			for(pageNo;pageNo<=pageNum;pageNo++){
				$("#forwardPageLi").before(createPageNo(pageNo,null));
			}			
		}else{
			var pageNo=1;
			$("#forwardPageLi").before(createPageNo(pageNo,ACTIVECLASS));
			pageNo++;
			for(pageNo;pageNo<pageNoNumMax;pageNo++){
				$("#forwardPageLi").before(createPageNo(pageNo,null));
			}
			$("#forwardPageLi").before(createDots());
			$("#forwardPageLi").before(createPageNo(pageNum,null));
		}
	}
	/* 更新第一页后面的点 */
	function updateBackPageDots(){
		if($("#backPageLi").next().next().attr("id")=="dotsLi"){
			$("#backPageLi").next().next().next().remove();	
			if($("#backPageLi").next().next().next().attr("id")=="dotsLi"){
				$("#backPageLi").next().next().remove();/* 消除两个点相邻的情况 */
			}
		}else{
			$("#backPageLi").next().next().remove();
			$("#backPageLi").next().after(createDots());
			if($("#backPageLi").next().next().next().attr("id")=="dotsLi"){
				$("#backPageLi").next().next().remove();/* 消除两个点相邻的情况 */
			}
		}
	}
	/* 更新最后一页前面的点 */
	function updateForwardPageDots(){
		if($("#forwardPageLi").prev().prev().attr("id")=="dotsLi"){
			$("#forwardPageLi").prev().prev().prev().remove();
			if($("#forwardPageLi").prev().prev().prev().attr("id")=="dotsLi"){
				$("#forwardPageLi").prev().prev().remove();/* 消除两个点相邻的情况 */
			}
		}else{
			$("#forwardPageLi").prev().prev().remove();
			$("#forwardPageLi").prev().before(createDots());
			if($("#forwardPageLi").prev().prev().prev().attr("id")=="dotsLi"){
				$("#forwardPageLi").prev().prev().remove();/* 消除两个点相邻的情况 */
			}
		}
	}
	/* 更新页面标号 */
	function updatePageNo(direction){
		// direction 表示向前还是向后翻页
		var currentPageTag=$(".pagination li a").filter(".active");
		switch(direction){
			case BACKPAGE:
				var prePageTag=currentPageTag.parent().prev().children().eq(0);
				var prePrePageTag=prePageTag.parent().prev().children().eq(0);
				var prePrePageNo=Number(prePrePageTag.text()); console.log(prePrePageNo);
				var distance=currentPageNo-prePrePageNo;				
				currentPageNo=currentPageNo-1;
				if(distance==2){
					currentPageTag.parent().prev().remove();
				}					
				currentPageTag.removeClass("active");
				currentPageTag.parent().before(createPageNo(currentPageNo,ACTIVECLASS));
				if(prePrePageNo!=1){					
					updateBackPageDots();	
				}else{					
					updateForwardPageDots();
				}
				break;
			case FORWORDPAGE:
				var nextPageTag=currentPageTag.parent().next().children().eq(0);
				var nextNextPageTag=nextPageTag.parent().next().children().eq(0);
				var nextNextPageNo=Number(nextNextPageTag.text()); console.log(nextNextPageNo);
				var distance=nextNextPageNo-currentPageNo;			
				currentPageNo=currentPageNo+1;
				if(distance==2){
					currentPageTag.parent().next().remove();
				}					
				currentPageTag.removeClass("active");
				currentPageTag.parent().after(createPageNo(currentPageNo,ACTIVECLASS));
				if(nextNextPageNo!=pageNum){					
					updateForwardPageDots();
				}else{					
					updateBackPageDots();
				}
				break;
		}
	}
	
	/* 创建视频div及Object */
	function createVideoDiv(id,videoDivWidth,videoDivdHeight){
		return '<div ondblclick="addObjectDivEvent(this)" style="float:left;background-color:black;padding:'+videoDivPadding+';margin:'+videoDivMargin+';width:'+videoDivWidth+';height:'+videoDivdHeight+'"><object id="object"  width="100%" height="100%" data='+currentPageResource[id]+'></object></div>';
	}
	/* 计算视频div的宽度 */
	function caculateVideoDivWidth(perPageNum){
		return ($("#objectDiv").width()-2*perPageNum*(videoDivMargin+videoDivPadding)-adapterValue)/perPageNum;
	}
	/* 计算视频div的高度 */
	function caculateVideoDivHeight(perPageNum){
		return ($("#objectDiv").height()-2*perPageNum*(videoDivMargin+videoDivPadding)-adapterValue)/perPageNum;
	}
	/* 在页面中添加视频div */
	function createVideo(perPageNum){
		var videoDivWidth=caculateVideoDivWidth(perPageNum);
		var videoDivdHeight=caculateVideoDivHeight(perPageNum);
		for(i=0;i<perPageNum*perPageNum;i++){
			$("#objectDiv").append(createVideoDiv(i,videoDivWidth,videoDivdHeight));
			
		}
		 
	}
	/* 移除页面中所有的视频div */
	function removeAllVideoDiv(){
		$("#objectDiv").empty();
	}
	/* 计算视频div的高度和宽度用于随屏幕的改变而作调整 */
	function adjustVideoDivToScreen(){
		var videoDivWidth=caculateVideoDivWidth(perPageNum);
		var videoDivdHeight=caculateVideoDivHeight(perPageNum);
		$("#objectDiv").children("div").css({"width":videoDivWidth,"height":videoDivdHeight});
		console.log("width "+videoDivWidth,"height "+videoDivdHeight)
	}
	/* 视频object鼠标双击事件 */
	function addObjectEvent(self){
		console.log("object  dblclick");
	//	myWindow=window.open('file:///E:D_file/Movie/fenyevideo/fenye.html',"_blank",'width=500,height=300,toolbar=yes,location=yes,directories=no, status=no,menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes');
	//	myWindow.document.write('<object id="object" width="100%" height="100%" data='+self.data+'></object>');
	}
	/* 视频div鼠标双击事件 */
	function addObjectDivEvent(self){
		console.log("object  dblclick  "+self.childNodes[0].data);
	//	myWindow=window.open('',"_blank",'width=500,height=300');
	//	myWindow.document.write('<object id="object" width="100%" height="100%" data='+self.childNodes[0].data+'></object>');
	}
	
	
	
	
	
	/* ajax请求 */
	function ajaxRequset(yourUrl,currentPageNo,perPageNum,elementId){
		$.ajax({
			type:"POST",
			async:true,
			cache:false,
			timeout:5000,
			dataType:"json",
			data:"currentPageNo="+currentPageNo+"&perPageNum="+perPageNum,
			url:yourUrl,
			error:function(xhr,status,error){
				alert("请求失败");
			},
			success:function(result,status,xhr){
				alert(result);
			},
			
		});
	}
	
	/* 模拟后台得到当前页资源  请注意视频资源的路径，不然会没效果*/
	function getCurrentPageResource(currentPageNo,perPageNum){
		var resource=["E:D_file/Movie/yewen.mkv","E:D_file/Movie/tangrenjie.mp4","E:D_file/Movie/moshou.mp4","E:D_file/Movie/wanwan.mp4","crayanimal.mp4","E:D_file/Movie/huangdou.png.jpg","yinxiang.jpg","http://www.baidu.com","http://www.dangdang.com","http://www.iqiyi.com","http://www.tmall.com","http://www.csdn.com","http://www.runoob.com","http://www.tlink.io"];
		
		var resourceNum=resource.length;
		console.log(resourceNum)
		
		var resourceStartNo=(currentPageNo-1)*perPageNum*perPageNum;
		for(i=0;i<perPageNum*perPageNum;i++){
			currentPageResource[i]=resource[resourceStartNo+i];
		}
		
		//currentPageResource=[];
		console.log("currentPageResource "+currentPageResource);
		
		return currentPageResource;
	}
	/* 模拟后台得到总页数 */
	function getPageNum(perPageNum){
		//var resource=["http://www.baidu.com","http://www.dangdang.com","http://www.iqiyi.com","http://www.tmall.com","http://www.csdn.com","http://www.runoob.com","http://tlink.io"];
		var resource=["D:Movie/yewen.mkv","D:Movie/tangrenjie.mp4","D:Movie/moshou.mp4","D:Movie/wanwan.mp4","D:Movie/crayanimal.mp4","D:Movie/huangdou.png.jpg","D:Movie/yinxiang.jpg","http://www.baidu.com","http://www.dangdang.com","http://www.iqiyi.com","http://www.tmall.com","http://www.csdn.com","http://www.runoob.com","http://www.tlink.io"];

		var resourceNum=resource.length;
		var num=perPageNum*perPageNum;
		
		return pageNum=Math.ceil(resourceNum/num);		
		//return pageNum=0;
		//return pageNum=null;
		
	}
	/* 模拟后台得到当前页 */
	/* 模拟请求后台 */
	function rquestServer(currentPageNo,perPageNum){
		getPageNum(perPageNum);
		getCurrentPageResource(currentPageNo,perPageNum);
	}
	

