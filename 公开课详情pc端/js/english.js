var pcHeader = document.getElementById("daohang_link_div"),
    pcListLeft = document.getElementById("pc_list_left"),
    pcEnglishMarginV = document.getElementById("pc_english_marginV"),
    pcListLi = pcListLeft.getElementsByTagName("li"),
    positionTop = 8,
    oldPositionTop = 2;

//滚动滚轮改变列表定位;
window.addEventListener("scroll",debounce(scrollFn,10),false);

function scrollFn(){
    var pcHeaderT = offsetT(pcHeader);
    var pcHeaderH = pcHeader.offsetHeight + pcHeaderT,
        scrollTopH = document.documentElement.scrollTop || document.body.scrollTop;

    if(scrollTopH >= pcHeaderH){
        pcListLeft.style.position = "fixed";
        pcListLeft.style.top = positionTop+"rem";
        pcListLeft.style.zIndex = "2";
        pcEnglishMarginV.style.marginTop = positionTop +"rem";
    }else{
        pcListLeft.style.position = "absolute";
        pcListLeft.style.top = "0";
        pcEnglishMarginV.style.marginTop = oldPositionTop +"rem";
    }
}
//防抖动
function debounce(fn, delay){
    var timer = null;
    return function(){
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn.apply(context,args);
        },delay);
    }
}

//给相应的课程列表绑定点击事件
function courseList(){
    for(var i = 0; i < pcListLi.length; i++){
        pcListLi[i].addEventListener("click",function(){
            for(var j = 0; j < pcListLi.length; j++){
                removeClass(pcListLi[j],"pc_active_bg");
            }
            addClass(this,"pc_active_bg");
            iscorllBar(this);
        },false);
    }
}
courseList();


//添加className的方法
function addClass(ele,cls){
    var eleClass = ele.className,
        eleStr = (eleClass != "") ? " ":"";
    var addCla = eleClass + eleStr + cls;
    
    ele.className = addCla;

}
//删除相对应的className方法
function removeClass(ele,cls){
    var eleClass = " "+ele.className+ " ";
    eleClass = eleClass.replace(/(\s+)/gi," ");
    var removeCla = eleClass.replace(" "+cls+" ","");
        removeCla = removeCla.replace(/(^\s+)|(\s+$)/g,"");
        ele.className = removeCla;
        
}

//动态计数适合学员和学习目标的高度 让他们的高度都统一;
function calculate(){
    var pcSuitH = document.getElementById("pc_suit_height"),
    pcStudyH = document.getElementById("pc_study_height"),
    pcSuitOffsetH = pcSuitH.offsetHeight,
    pcStudyOffsetH = pcStudyH.offsetHeight;

    if( pcSuitOffsetH > pcStudyOffsetH){
        pcStudyH.style.height = pcSuitOffsetH + "px";    
    }else if(pcSuitOffsetH < pcStudyOffsetH){
        pcSuitH.style.height = pcStudyOffsetH + "px";
    }
}

calculate();

//计算offsetTop的值
function offsetT(ele){
    var top = ele.offsetTop,
        parent = ele.offsetParent;
        while(parent){
            top+= parent.offsetTop;
            parent = parent.offsetParent;
        }
        return top;
}


//计算滚动条的对应的滚动距离;
function iscorllBar(ele){
    var $text = $(ele).text(),
        $attrId = $(ele).attr("data-id"),
        $scrollTop = $("#"+$attrId).offset().top - 160; 

    switch($text){
        case "名师简介":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;
        case "课程简介":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;
        case "课程特色":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;
        case "课程大纲":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;
        case "教学服务":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;        
        case "联系老师":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break;
        case "上课流程":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break; 
        case "上课须知":
            $("html,body").animate({scrollTop: $scrollTop},500);
            break; 
    }

}


