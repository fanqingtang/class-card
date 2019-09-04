/**
 * 课程卡激活js  2019/5/28   fqt
 * 
 * 
 */
(function(){
    var mbCard = {
        formhash: "",
        TermNum: 0,  //可选的学期数量
        keycard_no: "",  //卡密
        status: 0,  //默认为0 获取全部课程
        cpUrl  : 'mk.php?do=cp',
        termNum: 0,  //默认学期数量
        versionArr: [],  //存放教材版本数组
        Init: function() {  //初始化
           this.tabClassCard();  //课程卡切换
           this.checkCardPassW();  // 验证课程卡密码
           this.sureBangCard();   //绑定课程
           this.passTimeBuy();    //以后再说
           this.sureActiveClass(); //确认激活
           this.repNewSelect();    //重新选择
           this.finalySubmitBtn(); //最终选择的课程版本确定，提交
           this.isNewClassCard(); // 是否有新的未激活课程卡
           this.sureCloseTipVer(); //点击确定关闭选择版本和学期窗口 
        },
        tabClassCard: function() {  //课程卡tab切换
            var $tabLi = $(".mbTabCut").find("li"),
                that = this;
            $tabLi.on("click" , function(){
                var $index = $(this).index();
                if($index) {
                    that.getClassCard(); //获取课程卡
                }
                else {
                    $(".mbBangCard").show().siblings("section").hide();
                }
                $(this).addClass("cutActive").siblings().removeClass("cutActive");
            });
        },
        isNewClassCard: function(){  //是否有新未激活的课程卡
            var data = {
                formhash: this.formhash,
                check_new_kcard: "ok"
            };
            $.post(this.cpUrl,data,function(dat){
                var index = dat.lastIndexOf(":"),
                    val = parseInt(dat.substring(index+1));
                if (val) {
                    $(".newImg").show();
                } else {
                    $(".newImg").hide();
                }
            });
        },
        checkCardPassW: function() {  //检查输入的课程卡密码是否正确
            var $cardPassWord = $("#cardPassWord"),
                $btnEle  = $(".sureBangBtn"),
                flag = true;
            $cardPassWord.on({
                compositionstart: function(){ //在输入一段需要确认的文本如拼音和汉字、语音时会触发
                    flag = false;
                },
                compositionend: function() {  // 在拼音选词完成、语音输入完毕时会触发
                    flag = true;
                },
                input: function() {
                    var that = this;
                    setTimeout(function(){
                        if(flag) {
                            //获取当前光标的位置
                            var caret = that.selectionStart;
                            var maxLength = 23;  //输入最大的长度
                            //获取当前的value
                            var value = that.value;
                            //从左边沿到坐标之间的空格数
                            var sp =  (value.slice(0, caret).match(/\s/g) || []).length;
                            //去掉所有空格
                            var nospace = value.replace(/\s/g, '');
                            //重新插入空格
                            var curVal = that.value = nospace.replace(/[^\da-zA-Z]/gi, "").replace(/([\d|a-z]{5})(?=[\d|a-z])/gi, "$1 ").trim().substr(0,maxLength).toUpperCase();
                            //从左边沿到原坐标之间的空格数
                            if(curVal.length == maxLength) {
                                $btnEle.addClass("sureBangBtnActive");
                            }else{
                                $btnEle.removeClass("sureBangBtnActive");
                            }
                            var curSp = (curVal.slice(0, caret).match(/\s/g) || []).length;
                            //修正光标位置
                            that.selectionEnd = that.selectionStart = caret + curSp - sp;
                            $(".warn").text('');  //把提示信息设置成空
                        }
                    },0)
                }
            }); 
        },
        sureBangCard: function() {  //绑定课程卡
            var $sureBangBtn = $(".sureBangBtn"),
                $warnEle = $(".warn"),
                $cardPassWord = $("#cardPassWord"),
                that = this;
            $sureBangBtn.on("click" , function() {
                var $isActiveBtn = $sureBangBtn.hasClass("sureBangBtnActive"),
                    $cardVal = $cardPassWord.val();
                if( !$cardVal ) {
                    $warnEle.text("卡密不能为空");
                    return;
                }    
                if( !$isActiveBtn ) {
                    $warnEle.text("请输入不能少于20个字符");
                    return;   
                }
                var data = {
                    kcard_no: that.getCardVal(),
                    formhash: that.formhash,
                    check_bind_kcard: "ok"
                };
                $.post(that.cpUrl,data,function(dat){
                    if (dat === "ok") {
                        $cardPassWord.val(""); // 把输入框里面的秘钥清空
                        $warnEle.text("");
                        that.successTip(); //绑定成功
                    }else{
                        var reg = /html| head | title | script/gi,  //为了判断formhash过期返回页面。
                            overDue = reg.test(dat),
                            tipDat = null;
                        if (overDue) {
                            tipDat = '网页已经过期,请重新刷新网页!';
                        } else {
                            tipDat = dat;
                        }    
                        $warnEle.text(tipDat);
                    }
                });
            });
        },
        successTip: function() { //绑定成功之后执行的方法
            var $textTip = "绑定成功";
            this.successTipWin($textTip);
            $(".newImg").show(200);
            this.getClassCard(); //获取课程卡
            $(".mbTabCut").find("li:last").addClass("cutActive").siblings().removeClass("cutActive"); 
        },
        getCardVal: function() {
            //获取卡密
            var cardPassW = $("#cardPassWord").val().replace(/\s*/g, "");
            return cardPassW;
        },
        getClassCard: function() { //获取课程卡内容
            var data = {
                status: this.status,
                formhash: this.formhash,
                mine_kcard_list: "ok"
                },
                that = this,
                noActiveArr = [],   //存放未激活数据
                activeArr = [];     //存放已激活数据  
            $.post(this.cpUrl,data,function(dat) {
                var i = 0,
                    len = dat.length;
                if(len) {
                    while(i < len) { 
                        var isActive = dat[i].active; 
                        if(isActive){
                            activeArr.push(dat[i]);
                        }
                        else {
                            noActiveArr.push(dat[i]);
                        }
                        i++;
                    } 
                    noActiveArr.length ? that.joinNoActiveEle(noActiveArr) : that.hideNoActiveEle();  //拼接未激活dom
                    activeArr.length ? that.joinActiveEle(activeArr) : that.hideActiveEle();     //拼接已激活dom
                    $(".mbActiveCard").show().siblings("section").hide();
                } else {
                    $(".noBuyCard").show().siblings("section").hide();
                }

              },
              "json"
            );
        },
        joinNoActiveEle: function(arr){   //拼接未激活dom
            var noActiveStr = "",
                i = 0,
                len = arr.length,
                $noActiveInner = $(".noActiveInner");
            while( i < len ){
                var current = arr[i];
                noActiveStr += this.joinNoActiveDom(current);
                i ++ ;
            }
            this.isNewPassTime(arr);  //判断为激活数据里面的new是否过期，如果过期就把导航栏里面的new隐藏掉
            $noActiveInner.empty().append(noActiveStr).parent(".noActiveGroup").show();
            this.ActiveStudyCont();  //激活学习
        },
        joinNoActiveDom: function(current) {  //拼接未激活dom
            var domArr = [
                '<div class="noCardPart clearfix">',
                '<div class="noImgWrap">',
                '<img src="'+current.image+'" class="imgClass" alt="课程卡">',
                '</div>',
                '<div class="noCardConPart">',
                '<div class="noTitlePart">',
                '<h2>'+current.title+'</h2>',
                '<p>'+current.dur+'</p>',
                '<p>绑定时间:'+current.bind_date+'</p>',
                '</div>',
                '<button data-kcard-id='+current.kcard_id+' class="ActiveStudyBtn">激活学习</button>',
                '</div>',
                '</div>'
            ],
            isNew = current.new;
            if(isNew) {
                domArr.splice(3 , 0, '<img src="public/images/register/kcard_active/mb_new.png" class="noActiveNew" alt="课程卡">');
            }
            return domArr.join("");
        },
        isNewPassTime: function(arr) { //判断未激活数据里面的new是否过期，如果过期就把导航栏里面的new隐藏掉
            var flag = false;
            for(var i = 0; i < arr.length; i++) {
                var current = arr[i];
                if(current.new) {
                    flag = true;
                    break;
                }
            }
            if(flag) {
                $(".newImg").show();
            }
            else {
                $(".newImg").hide();
            }
        },
        joinActiveEle: function(arr) {  //拼接已激活
            var activeStr = "",
                i = 0,
                len = arr.length,
                $activeInner = $(".activeInner");
            while( i < len) {
                var current = arr[i];
                activeStr += this.joinActiveDom(current);
                i ++;
            }
            $activeInner.empty().append( activeStr ).parent(".activedGroup").show();
            this.watchGrade();     //查看年级
        },
        joinActiveDom: function( current ) {  //拼接已激活dom元素  
            var domArr = [
                 '<div class="activeCardPart">',
                 '<div class="activeCardInner clearfix">',
                 '<div class="imgWrap">',
                 '<img src="'+current.image+'" class="imgClass" alt="课程卡">',
                 '</div>',
                 '<div class="cardConPart">',
                 '<div class="titlePart">',
                 '<h2>'+current.title+'</h2>',
                 '<p>'+current.dur+'</p>',
                 '<p>激活时间:'+current.act_data+'</p>',
                 '</div>',
                 '</div>',
                 '</div>',
                 '<div class="watchGradeWrap">',
                 '<div class="gradeContent">',
                 '</div>',
                 '<span>查看年级</span>',
                 '</div>',
                 '</div>'
             ],
             gradeTitle = current.ctg_title,
             gradeList = current.nps_str,
             overDue = current.overdue,
             gradeStr = "",
             i = 0,
             len = gradeTitle.length;
             while( i < len ) {
                 gradeStr += '<h4>'+gradeTitle[i]+'</h4><p>'+gradeList[i]+'</p>';
                 i ++;
             }
             domArr.splice(domArr.length - 4 , 0 , gradeStr);
             return domArr.join("");          
        },
        watchGrade: function() {  //查看年级
            var $watchSpan = $(".watchGradeWrap");
            $watchSpan.on("click" , function(){
                var $gradeContent = $(this).find(".gradeContent");  
                if($gradeContent.is(":visible")) {
                    $(this).find("span").css({
                        "background-image":
                        "url(public/images/register/kcard_active/mb_down.png)"
                    }).text("查看年级");
                    $gradeContent.slideUp(300);
                } 
                else {
                    $(this).find("span").css({
                        "background-image":
                        "url(public/images/register/kcard_active/mb_up.png)"
                    }).text("收起年级");
                    $gradeContent.slideDown(300);
                    $(this).closest(".activeCardPart").siblings().find(".gradeContent").slideUp(300).next("span").text("查看年级").css({
                        "background-image":
                        "url(public/images/register/kcard_active/mb_down.png)"
                    });
                }
            });
        },
        passTimeBuy: function(){   //以后再说
            var $passTimeBtn = $(".activeGroup > a:first");
            $passTimeBtn.on("click" , function(){
                $(".mbActiveCard").show().siblings("section").hide();
            });
            return false;
        },
        sureActiveClass: function(){  //确认激活课程
            var $sureActiveBtn = $(".activeGroup > a:last"),
                that = this;
            $sureActiveBtn.on("click" , function(){
                var $termList = that.showTermList(),
                    $termStr = "";
                if( $termList ) {
                    for(var key in $termList) {
                        $termStr += '<h2>'+key+'</h2><p>'+$termList[key]+'</p>';
                    }
                    $(".showSureClassList").empty().append($termStr).closest(".diaWinClass").show();
                }else {
                   $(".noSeleVerWrap").show();   //请选择版本和学期提示
                }
                that.passClassTip($termList);  //如果课程学期没选够可选学期的数量出现提示
            });
        },
        passClassTip: function(obj) {  //如果课程学期没选够可选学期的数量出现提示
            if(obj) {
               for(var key in obj) {
                    if(obj[key].length < this.termNum) {
                        $(".selTextTip").show();
                        break;
                    }
                    else {
                        $(".selTextTip").hide();
                    } 
               }
            }
       },
        repNewSelect: function(){   //重新选择 
            var $repNewBtn = $(".sureClassBtn > a:first");
            $repNewBtn.on("click" , function(){
                $(".diaWinClass").hide();
            });
            return false;
        },
        finalySubmitBtn: function() {  //最后确定选择的课程版本 提交
            var $submitBtn = $(".sureClassBtn > a:last"),
                that = this,
                $textTip = "激活成功";
            $submitBtn.on("click" , function(){
                var $termObj = that.getTermId(),
                    $termObjStr = JSON.stringify($termObj);
                var data = {
                    keycard_no    : that.keycard_no,
                    seldata       : $termObjStr,
                    formhash      : that.formhash,
                    SubmitKcard   : 'ok'
                };
                $.post(that.cpUrl, data,function( dat ) {
                    if(dat == "ok") {
                        that.getClassCard();
                        var $noActiveGroup = $(".noActiveGroup");
                        if( $noActiveGroup.is(":visible")) {
                            var $noActiveGroupH = $noActiveGroup.outerHeight(),
                                $mbTabCut = $(".mbTabCut").outerHeight(),
                                $dist = $noActiveGroupH + $mbTabCut + 30;
                            $("html,body").animate({"scrollTop":$dist});
                        } else {
                            $("html,body").animate({"scrollTop":0});
                        }
                        $(".mbActiveCard").show().siblings("section").hide(); 
                        that.successTipWin($textTip);
                    }
                });    
            });
        },
        successTipWin: function(text) {  //成功弹窗方法
            var $divEle = "<div class='actTipWin'><span>"+text+"</span></div>",
                $isSaveDiv = $("#mbCardWrap").find(".actTipWin");
            if( !$isSaveDiv.size() ) {
                $("#mbCardWrap").append( $divEle ).find(".actTipWin").fadeIn(200);
                setTimeout(function(){
                    $(".actTipWin").fadeOut(200).remove();
                },1000)
            }
        },
        getTermId: function() { //获取拼接学期id
            var $versionArr = this.versionArr,
                $versionObj = {};
            for(var i = 0; i < $versionArr.length; i++) {
                var currentId = $versionArr[i],
                    $versionId = $("#version_"+currentId),
                    $classList = $versionId.find(".isActive , .overActive"),
                    $ptId = $versionId.find(".tbVersionInner").attr("pt_id"),
                    $versionIdArr = [],
                    $versionIdObj = {};
                $classList.each(function(index , ele){
                    var $termId = $(ele).attr("data-nps-id");
                    $versionIdArr.push( $termId );
                    $versionIdObj[$ptId] = $versionIdArr.join(",");
                });
                $versionObj[currentId] = $versionIdObj;
            }
            return $versionObj;
        },
        selTbSchollVer: function() { //选择同步课程教材版本
            var $tbVersionList = $(".tbVersionList ");
            $tbVersionList.on("click" , function(){
                $(this).next(".versionListWrap").slideToggle().closest(".classVersionInner").siblings().find(".versionListWrap").slideUp();
            });
        },
        selTbVerlist: function(){  //选中同步版本列表
            var $tbVerUlEle = $(".versionListWrap").find("li"),
                that = this;

            $tbVerUlEle.on("click" , function(){
                $(this).find("img").attr({
                    src : "public/images/register/kcard_active/mb_select.png"
                }).end().siblings().find("img").attr({
                    src: "public/images/register/kcard_active/mb_noselect.png"
                });
                var $pText = $(this).find("p").text(),
                    ptId = $(this).attr("data-pt-id"),
                    $list = $(this),
                    $verLiWrip = $(this).closest(".versionListWrap"),
                    $tbVerInner = $(this).closest(".tbVersionInner");
                $verLiWrip.prev(".tbVersionList").find(".version").text( $pText );    
                $verLiWrip.slideUp();

                $tbVerInner.attr("pt_id", ptId).next(".tbClassList").find(".classListInner").attr("data-num" , 1); //每次下拉的时候把设置是否选中的数量重置为1  
                if($pText == "请选择同步课程教材版本" || $pText == "请选择培优课程教材版本" || $pText == "请选择专题课程教材版本") {
                    $tbVerInner.next(".tbClassList").hide();
                    return false;
                }
                that.getTermList( ptId, $list );  //获取学期列表 
            }); 
        },
        ActiveStudyCont: function() {  //激活学习
            var $ActiveStuBtn = $(".ActiveStudyBtn"),  //激活学习按钮
                that = this;    
            $ActiveStuBtn.on("click" , function(){
                var kcardId = $(this).attr("data-kcard-id");
                var data = {
                    formhash: that.formhash,
                    active_kcard_view: "ok",
                    kcard_id: kcardId
                };
                $.post(that.cpUrl,data,function(dat){
                    that.termNum = dat.term_num;
                    that.keycard_no = dat.keycard_no;
                    var versionData = dat.data,
                        ids = dat.ids;
                    that.joinCardTitle( dat );  //拼接激活课程卡和标题 
                    that.joinVersList( versionData, ids ); //拼接教材版本列表
                },"json");
            });
        },
        joinCardTitle: function( dat ) {  //拼接激活课程卡和标题
            var joinStr = '<img src="'+dat.image+'" alt="课程卡"><span>'+dat.title+'</span>';
            $(".classCardInner").empty().append( joinStr );
        },
        joinVersList: function( data , ids ) { //拼接教材版本列表
            var verStr = "";
            this.versionArr.length = 0;   //每次进来都先清空存放教材版本id防止每激活一张卡就往里面添加    
            for(var key in data) {
                if(data.hasOwnProperty(key)) {
                    var len = data[key].length,
                        value = data[key];
                    if(len) {
                        verStr += this.joinTeachVers(key , value , ids);   
                    }
                }
            }
            $(".tbClassVersion").empty().append( verStr ).parent(".sureActivePage").show().siblings("section").hide();
            this.selTbSchollVer();  //选择同步教材版本
            this.selTbVerlist();   // 选中同步版本列表
        },
        joinTeachVers: function(key , value , ids) {  //拼接教材版本Dom
            var verName = null,
                id = ids[key];
            var keyIndex = key.indexOf("_");
            if(keyIndex >= 0)  {
               key = key.substr(0 , keyIndex); 
            }
            if(key  == "tongbu") {
                verName = "同步";
            }
            if(key == "peiyou") {
                verName = "培优";
            }
            if(key == "zhuanti") {
                verName = "专题";
            }
            this.versionArr.push(id);  //把版本key值存起来
            var domArr = [
                '<div class="classVersionInner" id="version_'+id+'">',
                '<div class="tbVersionInner">',
                '<div class="tbVersionList clearfix">',
                '<span class="version">请选择'+verName+'课程教材版本</span>',
                '<span class="selectText"></span>',
                '</div>',
                '<div class="versionListWrap">',
                '<ul>',
                '<li data-pt-id=0><p>请选择'+verName+'课程教材版本</p><img src="public/images/register/kcard_active/mb_noselect.png" alt="勾选"></li>',
                '</ul>',
                '</div>',
                '</div>',
                '<div class="tbClassList">',
                '<div class="actTermText">'+verName+'课程要激活的学期(可选'+this.termNum+'学期)<div class="actTipText">已激活的课程，自动累加时长，无需选择</div></div>',
                '<div class="classListInner" data-num=1>',
                '</div>',
                '</div>',
                '</div>',
                '</div>'
            ];
            var i = 0,
                len = value.length,
                strLi = "";
            while ( i < len ) {
                var current = value[i];
                strLi += '<li data-pt-id = '+current.pt_id+'><p class="ellip">'+current.pt_title+'</p><img src="public/images/register/kcard_active/mb_noselect.png" alt="勾选"></li>';
                i ++;
            }
            domArr.splice(9 , 0 , strLi);
            return domArr.join("");
        },
        getTermList: function( ptId, $list ) {  //获取学期列表
            var data = {
                    formhash: this.formhash,
                    get_npsls_by_ptid: "ok",
                    pt_id: ptId
                },
                that = this; 
            $.post(this.cpUrl,data,function(dat){
                var termStr = "",
                    i = 0,
                    len = dat.length;
                while( i < len ) {
                    var current = dat[i];
                    termStr += that.joinTermList( current );
                    i ++;
                }
                var $tbVersionWrap = $list.closest(".tbVersionInner").next(".tbClassList");    
                $tbVersionWrap.find(".classListInner").empty().append( termStr );
                var $isActClass = $tbVersionWrap.find(".isActive"),
                    $actTipText = $tbVersionWrap.find(".actTipText");
                if($isActClass.size()) {    // 判断是否显示已激活的课程，自动累加时长，无需选择
                    $actTipText.show();
                }
                else {
                    $actTipText.hide();
                }
                $tbVersionWrap.show();  //让点击的下拉列表显示对应的学期数
                that.checkTermList($tbVersionWrap);   //选择学期
            },"json");
        },
        joinTermList: function( current ) {  //拼接学期列表
            var domArr = [
                    '<div class="coverInner">',
                    '<img src='+current.nps_pic+'>',
                    '</div>',
                    '<div class="titleText">',
                    '<h4>'+current.nps_title+'</h4>',
                    '</div>',
                    '</div>'
                ], 
                isActive = current.have_nps;
            if(isActive) {
                domArr.splice(0 , 0 , '<div class="classListPart isActive" data-nps-id='+current.nps_id+'>');
                domArr.splice(domArr.length - 2 , 0 , '<span>(已激活)</span>');
            }
            else {
                domArr.splice(0 , 0 , '<div class="classListPart" data-nps-id='+current.nps_id+'>');
                domArr.splice(3 , 0 , '<img src="public/images/register/kcard_active/mb_noselect.png" alt="勾选">');
            }
            return domArr.join("");
        },
        checkTermList: function(classList) {  //选择学期
            var $classListPart = classList.find(".classListPart"),
                termNum = this.termNum,
                that = this,
                $textTip = "已累加时长无需选择";
            $classListPart.on("click", function(){
                var $isActive = $(this).find(".titleText").children().is("span"),
                    $checkRiNum = $(this).parent(".classListInner").attr("data-num");
                if( !$isActive ) {  //点击未激活学期执行的逻辑
                    var $isHasActive = $(this).hasClass("overActive");
                    if( $checkRiNum <= termNum ) {
                        if( $isHasActive ) {
                            $(this).find(".coverInner > img:last").attr({
                                src: "public/images/register/kcard_active/mb_noselect.png"
                            }).end().removeClass("overActive");
                            $checkRiNum --;
                            $(this).parent(".classListInner").attr("data-num" , $checkRiNum);
                        }else {
                            $(this).find(".coverInner > img:last").attr({
                                src: "public/images/register/kcard_active/mb_select.png"
                            }).end().addClass("overActive");
                            $checkRiNum ++;
                            $(this).parent(".classListInner").attr("data-num" , $checkRiNum);
                        }     
                    }
                    else{
                        if( $isHasActive ) {
                            $(this).find(".coverInner > img:last").attr({
                                src: "public/images/register/kcard_active/mb_noselect.png"
                            }).end().removeClass("overActive");
                            $checkRiNum --;
                            $(this).parent(".classListInner").attr("data-num" , $checkRiNum);
                        }
                    }  
                    if($checkRiNum - 1 == termNum) {
                        $(this).parent().children().not(".isActive,.overActive").css({
                            opacity: .5,filter:"alpha(opacity=50)"
                        });
                    }
                    else{
                        $(this).parent().children().not(".isActive,.overActive").css({
                            opacity: 1,filter:"alpha(opacity=100)"
                        });
                    }

                }
                else{ //点击已激活执行的逻辑
                    that.successTipWin($textTip);
                }
            });
        },
        showTermList: function() {  // 显示选中的学期列表
            var versionArr = this.versionArr,
                versionObj = {};
            for(var i = 0; i < versionArr.length; i++) {
                var currentId = versionArr[i],
                    $versionId = $("#version_"+currentId),
                    $versionTitle = $versionId.find(".version").text(),
                    $classList = $versionId.find(".isActive, .overActive"),
                    $versionText = [];
                    if( $versionTitle == "请选择同步课程教材版本" || $versionTitle == "请选择培优课程教材版本" || $versionTitle == "请选择专题课程教材版本" || !$classList.size()) {
                        return false;
                    }
                $classList.each(function(inde , ele){
                    var $termText = $(ele).find(".titleText").text();
                    $versionText.push( $termText );
                }); 
                
                versionObj[$versionTitle] = $versionText;
            }
            return versionObj;
        },
        hideNoActiveEle: function(){  //当未激活里面的数据为空时我就把他隐藏
            $(".noActiveGroup").hide();  //隐藏未激活容器
            $(".newImg").hide();         //隐藏导航栏里面的new标识
        },
        hideActiveEle: function() { //当已激活里面的数据为空时我就把已激活的容器隐藏掉
            $(".activedGroup").hide();
        },
        sureCloseTipVer: function() { //点击确定关闭提示请选择版本和学期提示窗口
            var $sureVerBtn = $(".selecVerBtn").find(".sureVerBtn");
            $sureVerBtn.on("click" , function(){
                $(".noSeleVerWrap").hide();
            });
        }
    }


    window.mbCard = mbCard;
    $(function(){
       mbCard.Init(); //初始化
    });
})();


