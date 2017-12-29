window.yx={
	//工具函数
	g:function(name){
		return document.querySelector(name);
	},
	ga:function(name){
		return document.querySelectorAll(name);
	},
	addEvent:function(obj,ev,fn){		//添加事件
		if(obj.addEventListener){
			return obj.addEventListener(ev,fn);
		}else{
			return obj.attachEvent('on'+ev,fn);
		}
	},
	removeEvent:function(obj,ev,fn){	//移除事件
		if(obj.removeEventListener){
			return obj.removeEventListener(ev,fn);
		}else{
			return obj.detachEvent('on'+ev,fn);
		}
	},
	getTopValue:function(obj){			//获取元素离html的距离
		var top=0;
		while(obj.offsetParent){
			top+=obj.offsetTop;
			obj=obj.offsetParent;
		}
		
		return top;
	},
	cutTime:function(target){			//倒计时
		var currentData=new Date();
		var v=Math.abs(target-currentData);
		
		return{
			d:parseInt(v/(24*3600000)),
			h:parseInt(v%(24*3600000)/3600000),
			m:parseInt(v%(24*3600000)%3600000/60000),
			s:parseInt(v%(24*3600000)%3600000%60000/1000),
		};
	},
	format:function(v){					//给时间加0
		return v<10?'0'+v:v;
	},
	formatData:function(time){			//修改时间戳为实际时间
		var d=new Date(time);
		return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
	},
	//修改url为对象
	parseUrl:function(url){
		var reg=/(\w+)=(\w+)/ig;
		var result={};
		
		url.replace(reg,function(a,b,c){
			result[b]=c;
		});
		
		return result;
	},
	//公用功能
	public:{
		//导航选项卡与吸顶导航
		navFN:function(){
			var nav=yx.g('.nav');
			var lis=yx.ga('.navBar li');
			var subNav=yx.g('.subNav');
			var uls=yx.ga('.subNav ul');
			var newLis=[];		//储存实际使用的li
			
			for(var i=1;i<lis.length-3;i++){
				newLis.push(lis[i]);
			}
			
			for(var i=0;i<newLis.length;i++){
				newLis[i].index=uls[i].index=i;
				newLis[i].onmouseenter=uls[i].onmouseenter=function(){
					newLis[this.index].className='active';
					subNav.style.opacity=1;
					uls[this.index].style.display='block';
				};
				newLis[i].onmouseleave=uls[i].onmouseleave=function(){
					newLis[this.index].className='';
					subNav.style.opacity=0;
					uls[this.index].style.display='none';
				};
			}
			
			yx.addEvent(window,'scroll',setNavPos);
			setNavPos();
			var navHeight=nav.offsetTop;
			function setNavPos(){
				nav.id=window.pageYOffset>navHeight?'navFix':'';
			}
		},
		//图片懒加载
		lazyImgFn:function(){
			yx.addEvent(window,'scroll',delayImg);
			delayImg();
			
			function delayImg(){
				var originals=yx.ga('.original');
				//可视区加滚动条距离
				var scrollTop=window.innerHeight+window.pageYOffset;
				
				for(var i=0;i<originals.length;i++){
					if(yx.getTopValue(originals[i])<scrollTop){
						originals[i].src=originals[i].getAttribute('data-original');
						//替换完毕后移除class
						originals[i].removeAttribute('class');
					}
				}
				
				//最后一张加载完毕移除事件
				if(originals[originals.length-1].getAttribute('src')!='images/empty.gif'){
					yx.removeEvent(window,'scroll',delayImg);
				}
			}
		},
		//回顶部
		backUpFn:function(){
			var back=yx.g('.back');
			var timer;
			
			back.onclick=function(){
				var top=window.pageYOffset;
				
				timer=setInterval(function(){
					top-=150;
					if(top<=0){
						top=0;
						clearInterval(timer);
					}
					
					window.scrollTo(0,top);
				},16);
			};
		},
		//购物车功能
		shopFn:function(){
			//购物车添加商品展示
			var productNum=0;				//总购买数量
			(function(local){
				var totalPrice=0;			//总价格
				var ul=yx.g('.cart ul');
				var li='';
				
				ul.innerHTML='';
				for(var i=0;i<local.length;i++){
					var attr=local.key(i);
					var value=JSON.parse(local[attr]);
					
					if(value && value.sign=='productLocal'){
						li+='<li data-id="'+value.id+'">'+
								'<a href="#" class="img"><img src="'+value.img+'"/></a>'+
								'<div class="message">'+
									'<p><a href="#">'+value.name+'</a></p>'+
									'<p>'+value.spec.join(' ')+' x '+value.number+'</p>'+
								'</div>'+
								'<div class="price">¥'+value.price+'.00</div>'+
								'<div class="close">&times;</div>'+
							'</li>';
						totalPrice+=parseFloat(value.price)*value.number;
					}
				}
				ul.innerHTML=li;
				
				productNum=ul.children.length;		//更新商品数量的值
				yx.g('.cartWrap i').innerHTML=productNum;
				yx.g('.cartWrap .total span').innerHTML='¥'+totalPrice+'.00';		//更新总价格
				
				//删除商品功能
				var closeBtns=yx.ga('.cart .list .close');
				for(var i=0;i<closeBtns.length;i++){
					closeBtns[i].onclick=function(){
						localStorage.removeItem(this.parentNode.getAttribute('data-id'));
						
						yx.public.shopFn();
						
						if(ul.children.length==0){
							yx.g('.cart').style.display='none';
							cartWrap.onmouseenter=null;
						}
					}
				}
				
				//购物车父级添加事件
				var cartWrap=yx.g('.cartWrap');
				var timer;
				
				//当购物车中有商品时才显示购物车
				if(ul.children.length>0){
					cartWrap.onmouseenter=function(){
						clearTimeout(timer);
						yx.g('.cart').style.display='block';
						scrollFn();
					};
					cartWrap.onmouseleave=function(){
						timer=setTimeout(function(){
							yx.g('.cart').style.display='none';
						},100)
					};
				}
				
			})(localStorage);
			
			//滚动条功能
			function scrollFn(){
				var contentWrap=yx.g('.cart .list');
				var content=yx.g('.cart .list ul');
				var scrollBar=yx.g('.cart .scrollBar');
				var slide=yx.g('.cart .slide');
				var slideWrap=yx.g('.cart .slideWrap');
				var btns=yx.ga('.scrollBar span');
				var timer;
				
				//倍数(内容长度与内容父级长度比例)
				var beishu=content.offsetHeight/contentWrap.offsetHeight;
				//滚动条是否显示
				scrollBar.style.display=beishu<=1?'none':'block';
				
				//限制倍数在一定范围内
				if(beishu>20){
					beishu=20;
				}
				
				//滑块高度(根据倍数)
				slide.style.height=slideWrap.offsetHeight/beishu+'px';
				
				//拖拽
				var scrollTop=0;
				var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;
				
				slide.onmousedown=function(ev){
					var disY=ev.clientY-slide.offsetTop;
					
					document.onmousemove=function(ev){
						scrollTop=ev.clientY-disY;
						scroll();
					};
					document.onmouseup=function(){
						this.onmousemove=null;
					};
					
					ev.cancelBubble=true;
					return false;
				};
				
				//滚轮功能
				myScroll(contentWrap,function(){
					scrollTop-=10;
					scroll();
					
					clearInterval(timer);
				},function(){
					scrollTop+=10;
					scroll();
					
					clearInterval(timer);
				});
				
				//滚动条主体功能
				function scroll(){
					if(scrollTop<0){
						scrollTop=0;
					}else if(scrollTop>maxHeight){
						scrollTop=maxHeight;
					}
					
					var scaleY=scrollTop/maxHeight;
					slide.style.top=scrollTop+'px';
					content.style.top=-(content.offsetHeight-contentWrap.offsetHeight)*scaleY+'px';
				}
				
				//上下箭头点击的功能
				for(var i=0;i<btns.length;i++){
					btns[i].index=i;
					btns[i].onmousedown=function(){
						
						var n=this.index;
						timer=setInterval(function(){
							scrollTop=n?scrollTop+5:scrollTop-5;
							scroll();
						},16);
					};
					btns[i].onmouseup=function(){
						clearInterval(timer);
					};
				}
				
				//滑块区域点击的功能
				slideWrap.onmousedown=function(ev){
					clearInterval(timer);
					timer=setInterval(function(){
						var slideTop=slide.getBoundingClientRect().top+slide.offsetTop/2;
						
						if(ev.clientY<slideTop){
							//这个条件成立说明现在鼠标在滑块的上面，滚动条应该往下走
							scrollTop-=5;
						}else{
							scrollTop+=5;
						}
						
						//防止抖动
						if(Math.abs(ev.clientY-slideTop)<=5){
							clearInterval(timer);
						}
						
						scroll();
					},16);
				}
				
				//滚轮事件
				function myScroll(obj,fnUp,fnDown){
					obj.onmousewheel=fn;
					obj.addEventListener('DOMMouseScroll',fn);
					
					function fn(ev){
						if(ev.wheelDelta>0 || ev.detail<0){
							fnUp.call(obj);
						}else{
							fnDown.call(obj);
						}
						
						ev.preventDefault();
						return false;
					}
				}
			}
		}
		
	}
}
