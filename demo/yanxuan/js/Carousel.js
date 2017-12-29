/*
 * 说明
 * 	1、依赖于move.js，引入组件前需要引入move.js
 * 	2、轮播图需要有一个父级，父级需要给一个id
 * 
 * 参数：
 * 	{
 * 		id:'pic',					父级id，必传参数
		autoplay:true,				是否自动播放，默认为自动播放
		intervalTime:1000,			播放间隔时间，默认为1s
		loop:true,					是否循换播放，默认为循环播放
		totalNumber:5,				图片的总数量，必传参数
		moveNum:1,					单次移动的图片的数量（需要能够整图片的总数量）
		circle:true,				是否有圆点的功能，默认为有
		mvoeWay:'opacity'			图片轮播的方式，opacity为改变透明度，position为改变位置
 * 	}
 * 
 * 自定义事件：
 * 	调用on方法，第一个参数为事件名称，第二个参数为事件处理函数（this.prev---上一个按钮；this.next---下一个按钮）
 * 		事件名称：
 * 			leftEnd			在不许循环播放的情况下走到最左的事件
 * 			rightEnd		在不许循环播放的情况下走到最右的事件
 * 			leftClick		上一个按钮-点击事件
 * 			rightClick		下一个按钮-点击事件
 */

;(function(window,undefined){
	var Carousel=function(){
		this.settings={
			id:'pic',
			autoplay:true,
			intervalTime:1000,
			loop:true,
			totalNumber:5,
			moveNum:1,
			circle:true,
			moveWay:'opacity'
		};
	};
	
	Carousel.prototype={
		constructor:Carousel,
		init:function(opt){
			var opt=opt||this.settings;
			
			for(var attr in opt){
				if(this.settings.hasOwnProperty(attr)){
					this.settings[attr]=opt[attr];
				}
			}
			
			this.createDom();
		},
		//dom创建函数
		createDom:function(){
			var This=this;
			this.box=document.getElementById(this.settings.id);
			
			//创建上一个按钮
			this.prevBtn=document.createElement("div");
			this.prevBtn.className='prev';
			this.prevBtn.innerHTML="<";
			this.prevBtn.onclick=function(){
				This.prev();
				This.digger('leftClick');
			};
			this.box.appendChild(this.prevBtn);
			
			//创建下一个按钮
			this.nextBtn=document.createElement("div");
			this.nextBtn.className='next';
			this.nextBtn.innerHTML=">";
			this.nextBtn.onclick=function(){
				This.next();
				This.digger('rightClick');
			};
			this.box.appendChild(this.nextBtn);
			
			//创建小圆点
			this.circleWrap=document.createElement("div");
			this.circleWrap.className='circle';
			this.circles=[];
			
			for(var i=0;i<this.settings.totalNumber/this.settings.moveNum;i++){
				var span=document.createElement("span");
				span.index=i;
				span.onclick=function(){
					This.cn=this.index;
					This[This.settings.moveWay+'Fn']();
				};
				this.circleWrap.appendChild(span);
				this.circles.push(span);
			}
			
			this.circles[0].className='active';
			
			if(this.settings.circle){
				this.box.appendChild(this.circleWrap);
			}
			
			this.moveInit();
		},
		//运动初始化函数
		moveInit:function(){
			this.cn=0;				//当前的索引
			this.ln=0;				//上一个索引
			this.canClick=true;		//是否能再次点击
			this.endNum=this.settings.totalNumber/this.settings.moveNum;
			this.opacityItem=this.box.children[0].children;
			this.positionItemWrap=this.box.children[0].children[0];
			this.positionItem=this.positionItemWrap.children;
			
			switch(this.settings.moveWay){
				case 'opacity':
					for(var i=0;i<this.opacityItem.length;i++){
						this.opacityItem[i].style.opacity=0;
						this.opacityItem[i].style.transition='.3s opacity'
					}
					this.opacityItem[0].style.opacity=1;
					
					break;
				case 'position':
					//获取单个元素的左右margin
					var leftMargin=parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
					var rightMargin=parseInt(getComputedStyle(this.positionItem[0]).marginRight);
					
					//单个元素的实际宽度
					this.singleWidth=leftMargin+this.positionItem[0].offsetWidth+rightMargin;
					
					if(this.settings.loop){
						this.positionItemWrap.innerHTML+=this.positionItemWrap.innerHTML;
					}
					
					this.positionItemWrap.style.width=this.singleWidth*this.positionItem.length+'px';
			}
			
			if(this.settings.autoplay){
				this.autoPlayFn();
			}
		},
		//透明度运动方式
		opacityFn:function(){
			//到最左边
			if(this.cn<0){
				if(this.settings.loop){
					this.cn=this.endNum-1;
				}else{
					this.cn=0;
					this.canClick=true;		//解决第二次点击头一张或者最后一张后，不能再次点击（不循环的情况下第二次点击没触发transitionend）
				}
			}
			
			//到最右边
			if(this.cn>this.endNum-1){
				if(this.settings.loop){
					this.cn=0
				}else{
					this.cn=this.endNum-1;
					this.canClick=true;
				}
			}
			
			this.opacityItem[this.ln].style.opacity=0;
			this.circles[this.ln].className='';
			
			this.opacityItem[this.cn].style.opacity=1;
			this.circles[this.cn].className='active';
			
			var This=this;
			var en=0;
			
			this.opacityItem[this.cn].addEventListener('transitionend',function(){
				en++;
				if(en==1){
					This.canClick=true;
					This.ln=This.cn;
					
					This.endFn();		//调用自定义事件
				}
			});
		},
		//位置运动方式
		positionFn:function(){
			//到最左边
			if(this.cn<0){
				if(this.settings.loop){
					this.positionItemWrap.style.left=-this.positionItemWrap.offsetWidth/2+'px';
					this.cn=this.endNum-1;
				}else{
					this.cn=0;
				}
			}
			
			//到最右边不循环的情况下的判断
			/*if(this.cn>this.endNum-1){
				if(this.settings.loop){
					
				}else{
					this.cn=this.endNum-1;
				}
			}*/
			if(this.cn>this.endNum-1 && !this.settings.loop){
				this.cn=this.endNum-1;
			}
			
			//设置圆点（当不循环播放的时候才修改圆点）
			if(this.settings.circle){
				if(!this.settings.loop){
					this.circles[this.ln].className='';
					this.circles[this.cn].className='active';
				}
			}
			
			
			var This=this;
			//运动的距离为当前的索引*单个距离*单次运动的个数
			move(this.positionItemWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},300,'linear',function(){
				//到最右边循环的情况下的判断
				if(This.cn==This.endNum){
					this.style.left=0;
					This.cn=0;
				}
				
				This.endFn();		//调用自定义事件
				
				This.canClick=true;
				This.ln=This.cn;
			});
		},
		//上一个按钮点击功能
		prev:function(){
			if(!this.canClick){
				return;
			}
			this.canClick=false;
			
			this.cn--;
			this[this.settings.moveWay+'Fn']();
		},
		//下一个按钮点击功能
		next:function(){
			if(!this.canClick){
				return;
			}
			this.canClick=false;
			
			this.cn++;
			this[this.settings.moveWay+'Fn']();
		},
		//自动播放功能
		autoPlayFn:function(){
			var This=this;
			this.timer=setInterval(function(){
				This.next();
			},this.settings.intervalTime);
			
			//鼠标移入停止
			this.box.onmouseenter=function(){
				clearInterval(This.timer);
				This.timer=null;
			};
			
			//鼠标离开的时候继续播放
			this.box.onmouseleave=function(){
				This.autoPlayFn();
			};
		},
		//添加自定义事件
		on:function(type,listener){
			this.event=this.event||{};
			this.event[type]=this.event[type]||[];
			this.event[type].push(listener);
		},
		//调用自定义事件
		digger:function(type){
			if(this.event && this.event[type]){
				for(var i=0;i<this.event[type].length;i++){
					this.event[type][i].call(this);
				}
			}
		},
		endFn:function(){
			if(!this.settings.loop){
				//左边到头
				if(this.cn==0){
					this.digger('leftEnd');
				}
				
				//右边到头
				if(this.cn==this.endNum-1){
					this.digger('rightEnd');
				}
			}
			
		}
	};
	
	window.Carousel=Carousel;
})(window,undefined);
