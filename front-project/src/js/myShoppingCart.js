//define(['jquery', "components", "common", "template","zepto"], function(jquery, components, common, template,zepto) {
define(['zepto', "components", "common", "weui", "touch", "template"], function(zepto, components, common, weui, touch, template) {
	var imgUrl =apiUrl;
	var addordeleteLock=false;//同一规格加减改操作锁，true表示锁住了  	 
	 
	 //商品规格增删改同一接口
	 //商品只有一个规格时增删改数量	 operateType 1增 2删 3改; priceId 规格id;
	 //source 表示操作来源 0表示只有一个规格时的增删改，1表示多个规格时的增删改
	 function operateShoppingCartInterface(operateType,priceId,source){
		 if(addordeleteLock==true){
			 return;//当前其他操作未完成，锁住了
		 }
		addordeleteLock=true;
		var edit_goodspriceId="shopping_edit_"+priceId;
		var sub_goodspriceId="shopping_sub_"+priceId;
		if(source==1){
			edit_goodspriceId="edit_"+priceId;
			sub_goodspriceId="sub_"+priceId;
		}
		var number=$("#"+edit_goodspriceId).val();
		number= parseInt(number);
		if(isNaN(number) ||number<0){
			number=0;
		}		
		if(operateType==1){
			//加一操作
			number=parseInt(number)+parseInt(1);
		}else if(operateType==2){
			//减一操作
			number=parseInt(number)-parseInt(1);
		}
		if(number>10000){
			number=10000;
		}
		var changeurl = apiUrl + "/front/shoppingcart/shoppingcart/editNumeberToShoppingCart?priceId=" + priceId+"&quantity=" + number;
		components.getMsg(changeurl).done(function(msg) {
			addordeleteLock=false;
			flushCurrentUserTotalPriceAndCategory();//因为商品购物车数量是所有拟购买的规格的总数;
			var res = msg.res;
			if (res == 1) {                
				if(number ==0 ){
					//规格数减到0，隐藏
					document.getElementById(sub_goodspriceId).style.display="none";
					document.getElementById(edit_goodspriceId).style.display="none";					
					document.getElementById('shopping_isbuy_'+priceId).src="/src/image/un-choose.png";
					document.getElementById("div_"+priceId).style.display="none";		
					$.toast("删除成功", "text");        					
				}else{
					document.getElementById(sub_goodspriceId).style.display="block";
					document.getElementById(edit_goodspriceId).style.display="block";
					document.getElementById('shopping_isbuy_'+priceId).src="/src/image/choose.png";					
				}	
				$("#"+edit_goodspriceId).val(number);
			}else{
				alert("直接修改数量操作失败！");
			}
		});		  
	 }
	 
	 
	  //商品只有一个规格时增删改数量	 operateType 1增 2删 3改  
	 function showoperateShoppingCart(operateType,priceId){
		 operateShoppingCartInterface(operateType,priceId,0);		
	 }
	 
	/*  //删除购物车中的一个规格数量
	 function subOneToShoppingCart(priceId){
		operateShoppingCartInterface(2,priceId,1);		
	 }
	 
	 
	 //增加一个规格
	 function addOneToShoppingCart(priceId){
		operateShoppingCartInterface(1,priceId,1);		
	 }
	 
	 //直接填写一个规格数量
	 function editNumeberToShoppingCart(priceId){
		 operateShoppingCartInterface(3,priceId,1);			
	 } */
	 
 
	 //刷新当前用户的购物车总金额及种类数
	 function flushCurrentUserTotalPriceAndCategory(){
		 var flushurl = apiUrl + "/front/shoppingcart/shoppingcart/queryCurrentUserTotalPriceAndCategory";
			components.getMsg(flushurl).done(function(msg) {
				var res = msg.res;
				if (res == 1) {  
					//查询总价和种类成功
					var totalpriceandcategory=msg.obj;
					document.getElementById("totalNumber").innerHTML =totalpriceandcategory.totalPrice/100*1.00;
					document.getElementById("totalCategory").innerHTML =totalpriceandcategory.totalCategory;					
					settleAccounts();
				}
				else{
					alert("获取总价失败！");
				}
			});
	 }
	
	//计算起步价
     function settleAccounts(){
		 var totalNumber=document.getElementById("totalNumber").innerHTML;
		 var differencePrice=(totalNumber*100-settleAccountsPrice*100)/100;
		 differencePrice=parseFloat(differencePrice.toFixed(2)); 
		 if(parseInt(-differencePrice)==parseInt(settleAccountsPrice)){
			 document.getElementById("settle_accounts").innerHTML="¥"+settleAccountsPrice+"起送";
			 document.getElementById("settle_accounts").removeAttribute('href');
             document.getElementById("settle_accounts").style.color = "#A9A9AA";
			 document.getElementById("settle_accounts").style.backgroundColor = "#535355";
			 // document.getElementById("settle_accounts").style.fontSize ="16px";
		 }
		 else if(differencePrice>=0){
			 document.getElementById("settle_accounts").innerHTML="结算";
			 document.getElementById("settle_accounts").style.backgroundColor = "#2CC17B";
             document.getElementById("settle_accounts").style.color = "#fff";
			 document.getElementById("settle_accounts").setAttribute('href','/page/order_submit.html'); 
			 // document.getElementById("settle_accounts").style.fontSize ="16px";
			 
		 }else{
			 document.getElementById("settle_accounts").innerHTML="还差¥"+(differencePrice*(-1))+"配送";
			 document.getElementById("settle_accounts").removeAttribute('href');
             document.getElementById("settle_accounts").style.color = "#A9A9AA";
			 document.getElementById("settle_accounts").style.backgroundColor = "#535355";
			 // document.getElementById("settle_accounts").style.fontSize ="16px";
		 }
	 } 

	 
	  
	//翻转所有购买标志
	function invertAllIsBuyState(){
		//购买标志： 1购买 2不购买
		var isBuy=0;
		var src=document.getElementById('shopping_isbuy_allOrNotall').src;
		if(src.indexOf("un-choose") != -1){
			isBuy=1;
		}else{
			isBuy=2;
		}
		var suburl = apiUrl + "/front/shoppingcart/shoppingcart/reSetIsBuyState?isBuy="+isBuy;
		components.getMsg(suburl).done(function(msg) {
			var res = msg.res;
			if (res == 1) { 
				//所有购买标志翻转成功
				var src=document.getElementById('shopping_isbuy_allOrNotall').src;
				if(isBuy == 1){
					//由不购买变为购买
					document.getElementById('shopping_isbuy_allOrNotall').src="/src/image/choose.png";
					$('.shopping_isbuy_img').attr("src","/src/image/choose.png");
				}else{
					//由购买变为不购买
					document.getElementById('shopping_isbuy_allOrNotall').src="/src/image/un-choose.png";
					$('.shopping_isbuy_img').attr("src","/src/image/un-choose.png");
				}
				 flushCurrentUserTotalPriceAndCategory();
			}
		});				
	}
			 
	 
	//翻转是否购买 cartId实际上已改为
	function invertIsBuy(priceId){
		var suburl = apiUrl + "/front/shoppingcart/shoppingcart/invertIsBuy?priceId="+priceId;
		components.getMsg(suburl).done(function(msg) {
			var res = msg.res;
			if (res == 1) { 
				//购买标志翻转成功
				var src=document.getElementById('shopping_isbuy_'+priceId).src;
				if(src.indexOf("un-choose") != -1){
					//由不购买变为购买
					document.getElementById('shopping_isbuy_'+priceId).src="/src/image/choose.png";
				}else{
					//由购买变为不购买
					document.getElementById('shopping_isbuy_'+priceId).src="/src/image/un-choose.png";
				}
				 flushCurrentUserTotalPriceAndCategory();

			}
		});				
	}
			 
			
	var $goodsList = $("#show_shoppingCartVO");
    var $noRec = $('#noRec');
    var $cloading = $('#cloading');
	 //获取购物车详情列表，并展示
	 var goodsList = {
        page: 0, //触发获取数据的数次(+1等于页码)
        size: 10, //每次触发取的记录条数
        isLoading: false, //列表是否加载中，避免重复触底加载
        url: apiUrl + "/front/shoppingcart/shoppingcart/queryShoppingCartDetailVO", //数据api
        getMore: function(first) {
            if (goodsList.isLoading) //取数过程中，先停止重复取数
                return;

            if (first) {
                goodsList.page = 1;
                $('#noRec').hide();
                $goodsList.html('');
				document.getElementById("showOrhideclearmyshoppingcart").style.display="none";
				$('#cloading').hide();
				$('#myShoppingCart_tabbar').hide();
				//$('#iosActionsheet').addClass('weui-actionsheet_toggle');
				//document.getElementById("show_shoppingCartVO").html('');//innerHTML="";
            } else {
                goodsList.page += 1;
            }
            $('#cloading').show(); //显示加载框
            goodsList.isLoading = true;
            setTimeout(goodsList.d(goodsList.page, goodsList.size), 1000); //模拟延迟取数据
        },

        //异步获取商品列表
        d: function(page, size) {
            $.ajax({
                url: goodsList.url,
                data: "pageNo=" + page + "&pageSize=" + size,
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                dataType: "json",
            }).done(function(msg) {
                var res = msg.res;				
                $cloading.hide();
                if (res != 0) {			
					
					//获取到商品
					var shoppingCartVODataList=msg.obj.dataList;
					msg=msg.obj;
					msg.shoppingCartVODataList=shoppingCartVODataList;
					
					if (shoppingCartVODataList && shoppingCartVODataList.length > 0) {
						document.getElementById("noshoppingCartInfo").style.display="none";
                        goodsList.isLoading = false;
                        $noRec.hide();
						document.getElementById("showOrhideclearmyshoppingcart").style.display="";
						$cloading.hide();
						$('#myShoppingCart_tabbar').show();
                    } else {
						//已经加载完所有数据
                        goodsList.isLoading = true;
                        $noRec.hide();
						$cloading.hide();
						
						if(goodsList.page == 1){
							//加载第一页就没有拿到数据							
							document.getElementById("noshoppingCartInfo").style.display="";
						}
						return ;
                    }
					
					
					//处理图片路径的问题
					for (var pid = 0; pid < msg.shoppingCartVODataList.length; pid++) {
                        if (msg.shoppingCartVODataList[pid].image != "") {
                            msg.shoppingCartVODataList[pid].image = msg.shoppingCartVODataList[pid].image.split(",");
                            for (var j = 0; j < msg.shoppingCartVODataList[pid].image.length; j++) {
                                msg.shoppingCartVODataList[pid].image[j] = imgUrl + msg.shoppingCartVODataList[pid].image[j];
                            }
                        }
						//处理起步价
						msg.shoppingCartVODataList[pid].retailPrice=msg.shoppingCartVODataList[pid].retailPrice/100;
                    }
					var html = template('show_shoppingCartVO-tpl', msg);
					
					
                    if (goodsList.page > 1) {
                        $goodsList.append(html);
                    } else {
                        $goodsList.html(html);
                    }
					
					//绑定选择规格事件及是否购买的事件						
					for (var z in shoppingCartVODataList)  
					{						
						//隐藏的默认有的一个规格时的增删改增加绑定事件
						$("#shopping_sub_"+shoppingCartVODataList[z].priceId).click(function() {
							var priceId = this.id.substring(13);
							var edit_goodspriceId="shopping_edit_"+	priceId;	
							var number=$("#"+edit_goodspriceId).val();
							number= parseInt(number);
							if(isNaN(number) ||number<0){
								number=0;
							}
							if(number<=1){	
								//数据要减为0了，确认是否要删除							
								$.confirm({
									text: '确定要删除此规格吗？',
									onOK: function() {
										$("#shopping_edit_"+priceId).val(1);
										showoperateShoppingCart(2,priceId);                
									},
									onCancel: function() {
										//不删除该规格，则改为1
										$("#shopping_edit_"+priceId).val(1);
										showoperateShoppingCart(3,priceId);
									},
								});
							}else{
								showoperateShoppingCart(2,priceId);
							}
						});
						$("#shopping_add_"+shoppingCartVODataList[z].priceId).click(function() {
							showoperateShoppingCart(1,this.id.substring(13));
						});
						$("#shopping_edit_"+shoppingCartVODataList[z].priceId).change(function() {
							var priceId=this.id.substring(14);	
							var edit_goodspriceId="shopping_edit_"+	priceId;
							var number=$("#"+edit_goodspriceId).val();
							number= parseInt(number);
							if(isNaN(number) ||number<0){
								number=0;
							}
							if(number<=0){	
								//数据要改为0了，确认是否要删除							
								$.confirm({
									text: '确定要删除此规格吗？',
									onOK: function() {
										$("#shopping_edit_"+priceId).val(0);
										showoperateShoppingCart(3,priceId);               
									},
									onCancel: function() {
										//不删除该规格，则改为1
										$("#shopping_edit_"+priceId).val(1);
										showoperateShoppingCart(3,priceId);
									},
								});
							}else{
								showoperateShoppingCart(3,priceId);
							}							
							//showoperateShoppingCart(3,this.id.substring(14));
						});
						if(shoppingCartVODataList[z].isBuy==1){
							//购买
							document.getElementById('shopping_isbuy_'+shoppingCartVODataList[z].priceId).src="/src/image/choose.png";
						}else{
							//不购买
							document.getElementById('shopping_isbuy_'+shoppingCartVODataList[z].priceId).src="/src/image/un-choose.png";
						}
						$("#shopping_isbuy_"+shoppingCartVODataList[z].priceId).click(function() {
							invertIsBuy(this.id.substring(15));
						});
						
					};	
					
					addEffect();
					deleteOneShoppingcart();
					
					//清空购物车事件绑定					
					$("#clearmyshoppingcart").click(function() {
						clearMyShoppingCart();
					});			
                   
                } else {
                    $noRec.show();
                    $cloading.hide();
                }
				 //goodsList.isLoading = false;
            });
        }
    };
	 
	//滚动
	 $(window).scroll(function() {
        //滚动高度 + 窗口高度 + (底部导航高度 + 版权块高度) >= 文档高度，注意：文档高度不包括fixed定位的元素（分类导航、底部导航）
        if ($(document).scrollTop() + $(window).height() + (50 + 50) >= $(document).height()) {					
            goodsList.getMore(false); //获取数据
			$noRec.hide();
        }
    });
	
	 
		
	//清空购物车
	function clearMyShoppingCart(){		
		//$.confirm("您确定要删除吗?", "确认删除?", function() {
			var suburl = apiUrl + "/front/shoppingcart/shoppingcart/delCurrentUserAllShoppingCart";
			components.getMsg(suburl).done(function(msg) {
				var res = msg.res;
				if (res == 1) { 
					flushCurrentUserTotalPriceAndCategory();
					goodsList.isLoading=false;
					goodsList.getMore(true);
					//$.toast("清空成功!");
				}else{
					//$.toast("清空失败!");
				}
			});
		/* }, function() {
          取消操作
        });	 */			
	}	 
	 
	//全选按钮绑定事件
	$("#shopping_isbuy_allOrNotall").click(function() {
		invertAllIsBuyState();
	});
	
	//删除一个规格
	function deleteOneShoppingcart() {
        $("#show_shoppingCartVO li").click(function(e) {
            var rid = $(this).attr("rid");
            if(($(e.target).hasClass("delete") || $(e.target).hasClass("icon-delete"))){
                $.confirm({
                    text: '确定要删除此规格吗？',
                    onOK: function() {
						$("#shopping_edit_"+rid).val(0);
						operateShoppingCartInterface(3,rid,0);
						document.getElementById("div_"+rid).style.display="none";
						 $.toast("删除成功", "text");                        
                    },
                });
            }
        });
    }
	
	//增加左滑动事件
	 function addEffect() {
        var $addressItem = $('#show_shoppingCartVO  li');
        $addressItem.on("swipeLeft", function() {
            var $this = $(this);
            $this.find(".edit").addClass("hide");
            $this.find(".delete").removeClass("hide");
            event.preventDefault();
        });
        $addressItem.on("swipeRight", function() {
            var $this = $(this);
            $this.find(".edit").removeClass("hide");
            $this.find(".delete").addClass("hide");
            event.preventDefault();
        });
    }
	
	flushCurrentUserTotalPriceAndCategory();		
	goodsList.getMore(true);
 });
