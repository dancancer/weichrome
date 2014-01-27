'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('rclick',function(){
	return function(scope,element){
        element.bind("contextmenu", function(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        element.bind('mousedown',function(e){
                if(e.which==3){
                    var url = e.srcElement.src.replace('thumbnail','large').replace('bmiddle','large');
                    chrome.tabs.create({"url":url,"selected":false}, function(tab){
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
                if(e.which==1){
                    if(e.srcElement.src.indexOf('thumbnail')>0){
                        e.srcElement.src = e.srcElement.src.replace('thumbnail','bmiddle');
                        $(e.srcElement).next('img').show();
                        $(e.srcElement).bind('load',function(_e){
                            $(e.srcElement).next('img').hide();
                        })
                    }else if(e.srcElement.src.indexOf('bmiddle')>0){
                        $(e.srcElement).bind('load',function(_e){
                            if(e.srcElement.getBoundingClientRect().top<100)
                                $("#warp").scrollTop($("#warp")[0].scrollTop + e.srcElement.getBoundingClientRect().top-100);
                        })
                        e.srcElement.src = e.srcElement.src.replace('bmiddle','thumbnail');
                    };

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
//                    return true;
                };
            });
		}

}).directive('rclicks',function(){
        return function(scope,element){
            element.bind("contextmenu", function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            element.bind('mousedown',function(e){
                if(e.which==3){
                    var url = e.srcElement.src.replace('square','large').replace('bmiddle','large');
                    chrome.tabs.create({"url":url,"selected":false}, function(tab){
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
                if(e.which==1){
                    if(e.srcElement.src.indexOf('square')>0){
                        e.srcElement.src = e.srcElement.src.replace('square','bmiddle');
                        $(e.srcElement).next('img').show();
                        $(e.srcElement).bind('load',function(_e){
                            $(e.srcElement).next('img').hide();
                        })
                    }else if(e.srcElement.src.indexOf('bmiddle')>0){
                        $(e.srcElement).bind('load',function(_e){
                            if(e.srcElement.getBoundingClientRect().top<100)
                              $("#warp").scrollTop($("#warp")[0].scrollTop + e.srcElement.getBoundingClientRect().top-100);
                        })
                        e.srcElement.src = e.srcElement.src.replace('bmiddle','square');
                    };
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
            });
        }

    }).directive('rclicka',function(){
        return function(scope,element){
            element.bind("contextmenu", function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            element.bind('mousedown',function(e){
                if(e.which==3){
                    var url = e.srcElement.parentElement.parentElement.href||e.srcElement.parentElement.href||e.srcElement.href;
                    chrome.tabs.create({"url":url,"selected":false}, function(tab){
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
                if(e.which==1){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
            });
        }

    }).directive('commentrow',function(){
        return{
            restrict: "E",
            templateUrl:'template/comment_row.html',
            transclude:true,
            scope: {
                item: "=item",
                showCommentText:"&showCommentText"
            }
        }
    }).directive('commentpager',function(){
        return{
            restrict: "E",
            scope: {
                item: "=item",
                next:"&next",
                pre:"&pre",
            },
            transclude:true,
            templateUrl:'template/comment_pager.html'
        }
    }).directive('actionbar',function(){
        return{
            restrict: "E",
            templateUrl:'template/actionbar.html'
        }
    }).directive('actionbarrt',function(){
        return{
            restrict: "E",
            templateUrl:'template/actionbar_rt.html',
        }
    }).directive('multipic',function(){
        return{
            restrict: "E",
            templateUrl:'template/multi_pic.html',
            transclude:true,
            scope: {
                item: "=item"
            }
        }
    }).directive('singlepic',function(){
        return{
            restrict: "E",
            templateUrl:'template/single_pic.html',
            transclude:true,
            scope: {
                item: "=item"
            }
        }
    }).directive('header',function(){
        return{
            restrict: "E",
            templateUrl:'template/header.html',
            transclude:true
        }
    })
//    .directive('userinfo',function(){
//        return function(scope,element,attrs){
//            var timer1,timer2;
//            element.bind('mouseenter',function(e){
//                clearTimeout($("#infodiv").attr("timer2"));
//                timer1 = setTimeout(function(){
//                    console.log($(e.srcElement).offset());
//                    $("#infodiv").fadeIn("300");
//                    var y_offset = ($("#infodiv").height() - $(e.srcElement).height())/2;
//                    var x_offset = $(e.srcElement).width()+10;
//                    $("#infodiv").offset({
//                        top:$(e.srcElement).offset().top-y_offset,
//                        left:$(e.srcElement).offset().left+x_offset
//                    },1000);
//
//                    console.log($("#infodiv").offset());
//                });
//
//
//            });
//            element.bind('mouseleave',function(e){
//                timer2 = setTimeout(function(){
//                    $("#infodiv").hide();
//                },1000);
//                $("#infodiv").attr("timer2",timer2);
//
//            });
//        }
//    })
;
