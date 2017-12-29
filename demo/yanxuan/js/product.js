//公用方法调用
yx.public.navFN();
yx.public.backUpFn();
yx.public.shopFn();

//解析url
var params=yx.parseUrl(window.location.href);
var pageId=params['id'];				//产品id
var curData=productList[pageId];		//产品数据
console.log(curData);

if(!pageId || !curData){
	//404页面
	window.location.href='404.html';
}


//面包屑内容
var positionFn=yx.g('#position');
positionFn.innerHTML='<a href="#">首页</a> > ';
for(var i=0;i<curData.categoryList.length;i++){
	positionFn.innerHTML+='<a href="#">'+curData.categoryList[i].name+'</a> > ';
}
positionFn.innerHTML+=curData.name;


//产品图功能
(function(){
	var bigImg=yx.g('#productImg .left img');
	var smallImg=yx.ga('#productImg .smallImg img');
	var last=smallImg[0];
	
	bigImg.src=smallImg[0].src=curData.primaryPicUrl;
	for(var i=0;i<smallImg.length;i++){
		if(i){
			smallImg[i].src=curData.itemDetail['picUrl'+i];
		}
		
		smallImg[i].index=i;
		smallImg[i].onmouseover=function(){
			bigImg.src=this.src;
			last.className='';
			this.className='active';
			
			last=this;
		};
	}
	
	//右侧信息更换
	var cuxiao='';
	if(curData.hdrkDetailVOList.length){
		cuxiao='<div><span>促销</span><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="tag">'+curData.hdrkDetailVOList[0].activityType+'</a><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="discount">'+curData.hdrkDetailVOList[0].name+'</a></div>'
	}
	
	yx.g('#productImg .info h2').innerHTML=curData.name;
	yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
	yx.g('#productImg .info .price').innerHTML='<div><span>售价</span><strong>¥'+curData.retailPrice+'.00</strong></div>'+cuxiao+'<div><span>服务</span><a href="#" class="service"><i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营品牌</a></div>';
	
	//创建规格DOM
	var fomat=yx.g('#productImg .fomat');
	var dds=[];
	for(var i=0;i<curData.skuSpecList.length;i++){
		var dl=document.createElement("dl");
		dl.className='clearfix';
		var dt=document.createElement("dt");
		dt.innerHTML=curData.skuSpecList[i].name;
		dl.appendChild(dt);
		fomat.appendChild(dl);
		
		for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
			var dd=document.createElement("dd");
			dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
			dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id);
			
			dd.onclick=function(){
				changeProduct.call(this);
			};
			
			dds.push(dd);
			dl.appendChild(dd);
		}
	}
	
	//商品信息点击函数
	function changeProduct(){
		//如果不能点击的话就返回
		if(this.className.indexOf('noClick')!=-1){
			return;
		}
		
		var curId=this.getAttribute('data-id');			//点击元素的id
		var othersDd=[];			//另一组dd
		var mergeId=[];				//组合后的所有id（用来判断产品剩余量）
		
		for(var attr in curData.skuMap){
			if(attr.indexOf(curId)!=-1){
				//获取另一组dd的id
				var otherId=attr.replace(curId,'').replace(';','');
				
				//通过id取到另一组dd
				for(var i=0;i<dds.length;i++){
					if(dds[i].getAttribute('data-id')==otherId){
						othersDd.push(dds[i]);
					}
				}
				
				//获取组合后的所有id
				mergeId.push(attr);
			}
		}
		
		//点击功能
		var brothers=this.parentNode.querySelectorAll('dd');			//兄弟节点
		if(this.className=='active'){
			this.className='';
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noClick'){
					othersDd[i].className='';
				}
			}
		}else{
			for(var i=0;i<brothers.length;i++){
				if(brothers[i].className=='active'){
					brothers[i].className='';
				}
			}	
			this.className='active';
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noClick'){
					othersDd[i].className='';
				}
				if(curData.skuMap[mergeId[i]].sellVolume==0){
					othersDd[i].className='noClick';
				}
			}
			
		}
		addNum();
	}
	
	//加减功能
	addNum();
	function addNum(){
		var actives=yx.ga('#productImg .fomat .active');
		var btnParent=yx.g('#productImg .number div');
		var btns=btnParent.children;
		var ln=curData.skuSpecList.length;
		
		//点击开关
		if(actives.length>=ln){
			btnParent.className='';
		}else{
			btnParent.className='noClick';
		}
		
		//减号
		btns[0].onclick=function(){
			if(btnParent.className){
				return;
			}
			btns[1].value=btns[1].value<=0?0:btns[1].value-1;
		}
		
		btns[1].onfocus=function(){
			if(btnParent.className){
				this.blur();
			}
		}
		
		//加号
		btns[2].onclick=function(){
			if(btnParent.className){
				return;
			}
			var arr=[];
			for(var i=0;i<actives.length;i++){
				arr.push(actives[i].getAttribute('data-id'));
			}
			var max=parseInt(curData.skuMap[arr.join(';')].sellVolume);
			
			btns[1].value=btns[1].value>=max?max:parseInt(btns[1].value)+1;
		}
	}
})();


//加入购物车
(function(){
	yx.public.shopFn();
	
	var joinBtn=yx.g('#productImg .join');
	joinBtn.onclick=function(){
		var actives=yx.ga('#productImg .fomat .active');
		var selectNum=yx.g('#productImg .number input').value;
		
		if(actives.length!=curData.skuSpecList.length || selectNum==0){
			alert("请选择正确的规格以及数量");
			return;
		}
		
		var id='';			//规格的拼接id作为key（本地储存）
		var spec=[];		//存放规格内容
		
		for(var i=0;i<actives.length;i++){
			id+=actives[i].getAttribute('data-id')+';';
			spec.push(actives[i].innerHTML);
		}
		id=id.substring(0,id.length-1);
		
		var select={
			"id":id,
			"name":curData.name,
			"price":curData.retailPrice,
			"number":selectNum,
			"spec":spec,
			"img":curData.skuMap[id].picUrl,
			"sign":"productLocal"				
		};
		
		//信息存储在localStorage里面
		localStorage.setItem(id,JSON.stringify(select));
		yx.public.shopFn();
		
		var cartWrap=yx.g('.cartWrap');
		cartWrap.onmouseenter();
		setTimeout(function(){
			yx.g('.cart').style.display='none';
		},2000);
	};
})();


//大家都在看
(function(){
	var ul=yx.g('#look ul');
	var str='';
	
	for(var i=0;i<recommendData.length;i++){
		str+='<li>'+
				'<a href="#"><img src="'+recommendData[i].listPicUrl+'"/></a>'+
				'<a href="#">'+recommendData[i].name+'</a>'+
				'<span>¥'+recommendData[i].retailPrice+'</span>'+
			'</li>';
	}
	ul.innerHTML=str;
	
	var lookFn=new Carousel();
	lookFn.init({
		id:'allLook',
		autoplay:false,
		intervalTime:1000,
		loop:false,
		totalNumber:8,
		moveNum:4,
		circle:false,
		moveWay:'position'
	});
	lookFn.on('rightEnd',function(){
		this.nextBtn.style.background='#e7e2d7';
	});
	lookFn.on('leftEnd',function(){
		this.prevBtn.style.background='#e7e2d7';
	});
	lookFn.on('rightClick',function(){
		this.prevBtn.style.background='#d0c4af';
	});
	lookFn.on('leftClick',function(){
		this.nextBtn.style.background='#d0c4af';
	});
})();


//详情功能
(function(){
	//头部选项卡
	var as=yx.ga('#bottom .title a');
	var tabs=yx.ga('#bottom .content>div');
	var ln=0;
	
	for(var i=0;i<as.length;i++){
		as[i].index=i;
		as[i].onclick=function(){
			as[ln].className='';
			tabs[ln].style.display='none';
			
			this.className='active';
			tabs[this.index].style.display='block';
			
			ln=this.index;
		};
	}
	
	//详情_产品参数
	var tbody=yx.g('.details tbody');
	for(var i=0;i<curData.attrList.length;i++){
		if(i%2==0){
			var tr=document.createElement("tr");
		}
		var td1=document.createElement("td");
		var td2=document.createElement("td");
		td1.innerHTML=curData.attrList[i].attrName;
		td2.innerHTML=curData.attrList[i].attrValue;
		
		tr.appendChild(td1);
		tr.appendChild(td2);
		
		tbody.appendChild(tr);
	}
	
	//详情_图片列表
	var img=yx.g('.details .img');
	img.innerHTML=curData.itemDetail.detailHtml;
})();


//评价功能
(function(){
	console.log(commentData);
	//修改评价数量
	var evaluateNum=commentData[pageId].data.result.length;		//当前评论的数量
	var evaluateText=evaluateNum>1000?'999+':evaluateNum;
	yx.ga('#bottom .title a')[1].innerHTML='评价<span>（'+evaluateText+'）</span>';

	var allData=[[],[]];			//第一个储存全部评价，第二个储存有图的评价
	for(var i=0;i<evaluateNum;i++){
		allData[0].push(commentData[pageId].data.result[i]);

		if(commentData[pageId].data.result[i].picList.length){
			allData[1].push(commentData[pageId].data.result[i]);
		}
	}
	yx.ga('#bottom .eTitle span')[0].innerHTML='全部（'+allData[0].length+'）';
	yx.ga('#bottom .eTitle span')[1].innerHTML='有图（'+allData[1].length+'）';

	var curData=allData[0];			//当前显示的数据（默认是全部）
	var btns=yx.ga('#bottom .eTitle div');
	var ln=0;

	for(var i=0;i<btns.length;i++){
		btns[i].index=i;
		btns[i].onclick=function(){
			btns[ln].className='';
			this.className='active';

			ln=this.index;

			curData=allData[this.index];
			showComment(10,0);
			createPage(10,curData.length);		//生成页码
		}
	}

	//显示评价数据
	showComment(10,0);
	function showComment(pn,cn){
		//pn 		一页显示几条
		//cn 		当前页码

		var ul=yx.g('#bottom .border>ul');
		var dataStart=pn*cn;			//数据起始的值
		var dataEnd=dataStart+10;		//数据结束的值

		if(dataEnd>curData.length){
			dataEnd=curData.length;
		}

		//主体结构
		var str='';
		ul.innerHTML='';
		for(var i=dataStart;i<dataEnd;i++){
			var avatart=curData[i].frontUserAvatar?curData[i].frontUserAvatar:'images/avatar.png';	//头像地址

			var smallImg='';
			var dialog='';

			if(curData[i].picList.length){
				//评论中有小图以及轮播图的情况
				var span='';		//小图父级
				var li='';			//轮播图图片父级
				for(var j=0;j<curData[i].picList.length;j++){
					span+='<span><img src="'+curData[i].picList[j]+'"/></span>';
					li+='<li><img src="'+curData[i].picList[j]+'"/></li>'
				}
				smallImg='<div class="smallImg clearfix">'+span+'</div>';
				dialog='<div class="dialog" id="commentImg'+i+'" data-imgnum="'+curData[i].picList.length+'"><div class="carouselImgCon"><ul>'+li+'</ul></div><div class="close">X</div></div>';
			}

			str+='<li>'+
					'<div class="avatar">'+
						'<img src="'+avatart+'"/>'+
						'<a href="#" class="vip'+curData[i].memberLevel+'"></a><span>'+curData[i].frontUserName+'</span>'+
					'</div>'+
					'<div class="text">'+
						'<p>'+curData[i].content+'</p>'+smallImg+
						'<div class="color clearfix">'+
							'<span class="left">'+curData[i].skuInfo+'</span>'+
							'<span class="right">'+yx.formatData(curData[i].createTime)+'</span>'+
						'</div>'+dialog+
					'</div>'+
				'</li>';
		}

		ul.innerHTML=str;

		showImg();
	}

	//调用轮播图组件
	function showImg(){
		var spans=yx.ga('#bottom .smallImg span');
		for(var i=0;i<spans.length;i++){
			spans[i].onclick=function(){
				var dialog=this.parentNode.parentNode.lastElementChild;
				dialog.style.opacity=1;
				dialog.style.height='510px';

				var en=0;
				dialog.addEventListener('transitionend',function(){
					en++;
					if(en==1){
						var id=this.id;
						var commentImg=new Carousel();
						commentImg.init({
							id:id,
							totalNumber:dialog.getAttribute('data-imgnum'),
							autoplay:false,
							loop:false,
							moveNum:1,
							circle:false,
							moveWay:'position'
						});
					}
				});

				//关闭按钮
				var closeBtn=dialog.querySelector('.close');
				closeBtn.onclick=function(){
					dialog.style.opacity=0;
					dialog.style.height='0';
				};
			};
		}
	}
	
	//页码功能
	createPage(10,curData.length);
	function createPage(pn,tn){
		//pn		显示的页码的数量
		//tn		总数据数量
		
		var page=yx.g('.page');
		var totalNum=Math.ceil(tn/pn);			//最多能显示的页码数量
		
		//页码数量比总数大的情况
		pn=totalNum<pn?totalNum:pn;
		page.innerHTML='';
		
		var cn=0;		//当前点击的页码的索引
		var spans=[];	//存放数字页码方便操作
		var div=document.createElement("div");		//数字部分的父级
		div.className='mainPage';
		
		//生成首页按钮
		var indexPage=pageFn('首页',function(){
			for(var i=0;i<pn;i++){
				spans[i].innerHTML=i+1;
			}
			cn=0;
			showComment(10,0);
			changePage();
		});
		if(indexPage){
			indexPage.style.display='none';
		}
		
		//生成上一页按钮
		var prevPage=pageFn('<上一页',function(){
			/*cn--;
			if(cn<0){
				cn=0;
			}*/
			
			if(cn>0){
				cn--;
			}
			
			showComment(10,spans[cn].innerHTML-1);
			changePage();
		});
		if(prevPage){
			prevPage.style.display='none';
		}
		
		//生成数字按钮
		for(var i=0;i<pn;i++){
			var span=document.createElement("span");
			span.innerHTML=i+1;
			span.className=i?'':'active';
			span.index=i;
			spans.push(span);
			span.onclick=function(){
				cn=this.index;
				showComment(10,this.innerHTML-1);
				changePage();
			};
			
			div.appendChild(span);
		}
		page.appendChild(div);
		
		//生成下一页按钮
		var nextPage=pageFn('下一页>',function(){
			/*cn++;
			if(cn>spans.length-1){
				cn=spans.length-1;
			}*/
			
			if(cn<spans.length-1){
				cn++;
			}
			
			showComment(10,spans[cn].innerHTML-1);
			changePage();
		});
		
		//生成尾页按钮
		var endPage=pageFn('尾页',function(){
			var end=totalNum;
			for(var i=pn-1;i>=0;i--){
				spans[i].innerHTML=end--;
				cn=spans.length-1;
			}
			showComment(10,totalNum-1);
			changePage();
		});
		
		//更新页码函数
		function changePage(){
			var cur=spans[cn];				//当前点击的那个页码
			var curInner=cur.innerHTML;		//存当前的页码（方便后面修改）
			
			//点击最后一个页码时所有页码增加的量（变成后十个时）
			var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;
			
			//点击最后面的页码（所有页码增加）
			if(cur.index==spans.length-1){
				if(Number(cur.innerHTML)+differ>totalNum){
					//点击的页码加上变化值大于页码总数的话修改增加的值
					differ=totalNum-cur.innerHTML;
				}
			}
			
			//点击最前面的页码（所有页码减少）
			if(cur.index==0){
				if(cur.innerHTML-differ<1){
					differ=cur.innerHTML-1;
				}
			}
			
			for(var i=0;i<spans.length;i++){
				//点击最后一个页码所有页码需要增加的情况（变成后十个）
				if(cur.index==spans.length-1){
					 spans[i].innerHTML=Number(spans[i].innerHTML)+differ;	
				}
				//点击第一个页码所有页码需要减少的情况（变成前十个）
				if(cur.index==0){
					spans[i].innerHTML-=differ;
				}
				
				//设置class
				spans[i].className='';
				if(spans[i].innerHTML==curInner){
					spans[i].className='active';
					cn=spans[i].index;
				}
			}
			
			//显示与隐藏功能按钮
			if(pn>1){
				var dis=curInner==1?'none':'inline-block';
				indexPage.style.display=prevPage.style.display=dis;
				
				var dis=curInner==totalNum?'none':'inline-block';
				nextPage.style.display=endPage.style.display=dis;
			}
			
			backToTop();	//回到评价顶部
		};
		
		//生成功能按钮
		function pageFn(inner,fn){
			if(pn<2){
				return;
			}
			
			var span=document.createElement("span");
			span.innerHTML=inner;
			span.onclick=fn;
			
			page.appendChild(span);
			
			return span;
		}
		
		//回到评价顶部
		function backToTop(){
			var top=yx.g('#bottom').offsetTop;
			window.scrollTo(0,top);
		}
	};
})();


