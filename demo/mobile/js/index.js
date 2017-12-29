//获取元素
var html = document.documentElement;
var page1 = document.getElementById("page1");
var page2 = document.getElementById("page2");
var page3 = document.getElementById("page3");

//屏幕点击
html.addEventListener('touchstart', function() {
	page1.style.display = 'none';
	page2.style.display = 'block';
	page3.style.display = 'block';
	
	//page2延迟效果
	setTimeout(function() {
		var content = document.querySelector("#page2 p");
		content.innerHTML = '删除成功！<br />好运新一年!'
	},5000)
	setTimeout(function() {
		page2.setAttribute('class', 'page fadeOut');
		page3.setAttribute('class', 'page fadeIn');
	}, 6000)
	
	//page2完成过渡时设置page3动画
	var n = 0;
	page2.addEventListener('transitionend', function() {
		n++;
		if(n == 1) {
			var blessing = document.querySelector("#page3 .blessing");
			var couplets = document.querySelectorAll("#page3 .couplets");
			
			blessing.style.animation = 'bless 1.5s linear 1.5s infinite';
			for(var i = 0; i<couplets.length; i++) {
				couplets[i].style.animation = 'couplets 1.5s';
				couplets[i].style.height = '16.875rem';
			}
		}
	}, false);
}, false);