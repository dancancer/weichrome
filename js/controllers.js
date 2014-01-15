'use strict';
/* Controllers */
angular.module('myApp.controllers', [])
  .controller('optionCtrl',['$scope','$http',function($scope,$http) {
        $scope.appid = "";
        $scope.access_token = localStorage.access_token;
        $scope.uid=localStorage.uid;
        $scope.oAuthPath = "";
        $scope.user=[];
        $scope.maxid=null;
        $scope.isloading = false;
        $scope.timeline = new Array();

        $scope.authorize = function(){
            $scope.oAuthPath = 'https://api.weibo.com/oauth2/authorize?client_id='+sinaApi.config.oauth_key+'&redirect_uri=https://api.weibo.com/oauth2/default.html&response_type=code';

            window.open($scope.oAuthPath);
        };
        chrome.tabs.onUpdated.addListener(
            function (tabId, changeInfo, tab) {
                if (changeInfo.status === 'loading' && tab.url.indexOf(sinaApi.config.oauth_callback + '?code=') === 0 ) {
                    var pin = tab.url;
                    if (pin.indexOf('=') > 0) {
                        pin = pin.substring(pin.indexOf('=')+1);
                    }
                    $scope.$apply($scope.appid = pin);;
                    chrome.tabs.remove(tabId);
                    $scope.gettoken();
                }
            }
        );
        $scope.gettoken = function(){
            var param = '&code='+$scope.appid;
            var path = 'https://api.weibo.com/oauth2/access_token?client_id='+sinaApi.config.oauth_key+
                '&client_secret='+sinaApi.config.oauth_secret+
                '&grant_type=authorization_code&redirect_uri=https://api.weibo.com/oauth2/default.html';
            $http({method:'POST',url: path+param}).
                success(function(data, status) {
                    console.log(data);
                    $scope.$apply($scope.access_token = data.access_token);
                    $scope.$apply($scope.uid = data.uid);
                    localStorage.access_token = data.access_token;
                    localStorage.uid = data.uid;
                    $scope.getuserinfo();
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };
        $scope.getuserinfo = function(uid){
            var param = '?access_token='+$scope.access_token+'&uid='+$scope.uid;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.user_show+param}).
                success(function(data, status) {
                    $scope.user = [];
                    $scope.user.push(data);
                    localStorage.user = JSON.stringify($scope.user);
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };
        if($scope.access_token!=undefined&$scope.uid!=undefined){
            $scope.getuserinfo($scope.uid);
        }
  }])
  .controller('weiboCtrl', ['$scope','$http',function($scope,$http) {
        $scope.currentuser = JSON.parse(localStorage.user);
        $scope.unreadTimeLineNum = 0;
        $scope.unreadCommentNum = 0;
        $scope.unreadAtNum = 0;
        $scope.appid = "";
        $scope.access_token = localStorage.access_token;
        $scope.uid=localStorage.uid;
        $scope.oAuthPath = "";
        $scope.user=[];
        $scope.maxid=null;
        $scope.isloading = false;
        $scope.timeline = new Array();
        $scope.loading = false;
        $scope.getuserinfo = function(uid){
            var param = '?access_token='+$scope.access_token+'&uid='+$scope.uid;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.user_show+param}).
              success(function(data, status) {
                $scope.user = [];
                $scope.user.push(data);
              }).
              error(function(data, status) {
                $scope.data = data || "Request failed";
                $scope.status = status;
            });
        };
        $scope.get_home_timeline = function(type,api){
            var param = '?access_token='+$scope.access_token;
            if($scope.maxid!=null){
                param = param+"&max_id="+$scope.maxid;
            }
            $scope.loading = true;
            if(!api)
                api = localStorage.current_timeline_api;
            $http({method:'GET', url: sinaApi.config.host+api+param}).
                success(function(data, status) {
                    if(api==sinaApi.config.favorites){
                        data.statuses = [];
                        for(var i in data.favorites){
                            data.statuses[i] =  data.favorites[i].status;
                        }
                    }
                    if(data.statuses.length>1){
                        data.statuses.shift();
                        //区分获取最新和向下刷新
                        if(type=='refresh'){
                            localStorage.current_timeline_api = api;
                            $scope.timeline = data.statuses;
                            $("#warp").animate({'scrollTop':0},300);
                        }else{
                              $scope.timeline = $scope.timeline.concat(data.statuses);
                        }
                        $scope.maxid = data.statuses[data.statuses.length-1].id;
                        chrome.extension.getBackgroundPage().timeline = $scope.timeline;
						chrome.extension.getBackgroundPage().scrollTop = 0;
                        chrome.extension.getBackgroundPage().maxid = $scope.maxid;
                    }
                    $scope.loading = false;
                    $scope.unreadTimeLineNum = 0;
                    localStorage.unreadTimeLineNum = 0;
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                    $scope.loading = false;
                });

        };
        $scope.get_comments = function(item,type){
            var requestStr = sinaApi.config.get_comments;
            if(item.comment_type == "Repost"){
                requestStr = sinaApi.config.repost_timeline;
            }
            if(type=='pre'){
                item.comments_page = item.comments_pre_page;
            }else if(type=="next"){
                item.comments_page = item.comments_next_page;
            }
            var param = '?access_token='+$scope.access_token+"&id="+item.id+"&page="+item.comments_page+"&count=8";
            var url = sinaApi.config.host+requestStr+param;
            $scope.loading = true;
            $http({method:'GET', url: url}).
                success(function(data, status) {
                    $scope.loading = false;
                    if(item.comment_type=="Repost"){
                        if(data.reposts.length>0){
                            item.comments = data.reposts;
                        }
                    }else{
                        if(data.comments.length>0){
                            item.comments = data.comments;
                        }
                    }
                    item.comments_pre_page = item.comments_next_page;
                    if(data.next_cursor!=0){
                        item.comments_next_page = item.comments_page+1;
                    }else{
                        item.comments_next_page = 0;
                    }
                    if(data.previous_cursor!=0){
                        item.comments_pre_page = item.comments_page-1;
                    }else{
                        item.comments_pre_page = 0
                    }

                }).
                error(function(data, status) {
                    $scope.loading = false;
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };

        $("#warp").scroll(function() {
            var nDivHight = $("#warp").height();
            var nScrollHight = $(this)[0].scrollHeight;
            var nScrollTop = $(this)[0].scrollTop;
            if(nScrollTop + nDivHight >= nScrollHight&&$scope.loading == false){
                console.log("loadnewdata");
                $scope.get_home_timeline();
            }

			chrome.extension.getBackgroundPage().scrollTop = nScrollTop;

        });
        $scope.commentbox ={};
        $scope.showCommentText = function(item,type,$event){
//            $scope.commentbox.
//            debugger;
//            $($event.srcElement).popover({
//                selector: '#comment_text_div'
//            });
            $('#comment_text_div').fadeIn();
            if(type=="repost"&&item.retweeted_status){
                $scope.commentbox.comment_txt = '转发微博//@'+item.user.name+":"+item.text;
            }else{
                $scope.commentbox.comment_txt ="";
            }
        };

        $scope.hideCommentText = function(){
            $('#comment_text_div').fadeOut();
        };

        $scope.showComments = function(item){
            if(item.comment_type!="Comment"){
                $("#commentsdiv"+item.id).collapse('show');
                item.comment_type = "Comment";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#commentsdiv"+item.id).collapse('toggle');
            }
        };

        $scope.showReComments = function(item){
            if(item.comment_type!="Comment"){
                $("#recommentsdiv"+item.id).collapse('show');
                item.comment_type = "Comment";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#recommentsdiv"+item.id).collapse('toggle');
            }
        };

        $scope.showRepost = function(item){
            if(item.comment_type!="Repost"){
                $("#commentsdiv"+item.id).collapse('show');
                item.comment_type = "Repost";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#commentsdiv"+item.id).collapse('toggle');
            }
        };

        $scope.showReRepost = function(item){
            if(item.comment_type!="Repost"){
                $("#recommentsdiv"+item.id).collapse('show');
                item.comment_type = "Repost";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#recommentsdiv"+item.id).collapse('toggle');
            }
        };

        //comment=%E6%9D%A5%E8%87%AAAPI%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7&id=3444517204329764&access_token=2.00nKqEaBmxIJ1E16e0989ad4HwpNLD

        $scope.comment = function(item){
//            var param = "?comment="+encodeURI(commentText)+"&id="+itemid;
//            param = param+'&access_token='+$scope.access_token;
            var param = '?comment=%E6%9D%A5%E8%87%AAAPI%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B71&id=3444517204329764&access_token=2.00nKqEaBmxIJ1E16e0989ad4HwpNLD';
//            $http.post(sinaApi.config.host+sinaApi.config.post_comments+param);
            $http({
                method:'POST',
                url: sinaApi.config.host+sinaApi.config.post_comments,
                data:'comment='+encodeURI(item.comment_txt)+'&id='+item.id+'&access_token='+$scope.access_token,
                headers:{'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status) {
                    console.log(data);
                    Example.show("发送成功")
                    item.comment_txt = "";
                    $scope.showCommentText(item)
                }).
                error(function(data, status) {
                    console.log(data);
                    Example.show("发送失败")
                });
        };

        $scope.refresh = function(){
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.home_timeline);
        };

        $scope.loadComment = function(){
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.comments_timeline);
        };

        $scope.loadAt = function(){
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.mentions_timeline);
        };

        $scope.loadFavorites = function(){
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.favorites);
        };

        $scope.hideinfo = function(){
            $("#infodiv").hide();
        };

        if(chrome.extension.getBackgroundPage().timeline&&chrome.extension.getBackgroundPage().timeline.length>0){
            $scope.timeline = chrome.extension.getBackgroundPage().timeline
            //console.log($scope.timeline);
//            $scope.maxid = chrome.extension.getBackgroundPage().maxid ;
            $scope.maxid = $scope.timeline[$scope.timeline.length-1].id;
            $scope.unreadTimeLineNum = localStorage.unreadTimeLineNum;
            $scope.unreadCommentNum = localStorage.unreadCommentNum;
            $scope.unreadAtNum = localStorage.unreadAtNum;

        }else{
            $scope.get_home_timeline();
        }
        setTimeout(function(){
            $("#warp")[0].scrollTop = chrome.extension.getBackgroundPage().scrollTop;
        }, 200);
		
        setInterval(function(){
            $scope.$apply($scope.unreadTimeLineNum = localStorage.unreadTimeLineNum);
        }, 5000);



     }
  ]);



$(document).ready(function(){
    var Example = (function() {
        "use strict";
        var elem,
            hideHandler,
            that = {};
        that.init = function(options) {
            elem = $(options.selector);
        };
        that.show = function(text) {
            clearTimeout(hideHandler);
            elem.find("span").html(text);
            elem.delay(200).fadeIn().delay(4000).fadeOut();
        };
        return that;
    }());

    Example.init({
        "selector": ".bb-alert"
    });
});

  
  