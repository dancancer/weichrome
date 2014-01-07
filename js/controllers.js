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
        $scope.get_home_timeline = function(type){
            var param = '?access_token='+$scope.access_token;
            if($scope.maxid!=null){
                param = param+"&max_id="+$scope.maxid;
            }
            $scope.loading = true;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.home_timeline+param}).
                success(function(data, status) {
                    if(data.statuses.length>1){
                        data.statuses.shift();
                        //区分获取最新和向下刷新
                        if(type=='refresh'){
                            $scope.timeline = data.statuses;
                            $("#warp").animate({'scrollTop':0},300);
                        }else{
                            $scope.timeline = $scope.timeline.concat(data.statuses);
                        }
                        $scope.maxid = data.statuses[data.statuses.length-1].id;
                        chrome.extension.getBackgroundPage().timeline = $scope.timeline;
                        localStorage.maxid = $scope.maxid;
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
            if(nScrollTop + nDivHight >= nScrollHight)
                $scope.get_home_timeline();
        });

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

        $scope.refresh = function(){
            $scope.maxid = null;
            $scope.get_home_timeline('refresh');
        };

        $scope.hideinfo = function(){
            $("#infodiv").hide();
        };

        if(chrome.extension.getBackgroundPage().timeline&&chrome.extension.getBackgroundPage().timeline.length>0){
            $scope.timeline = chrome.extension.getBackgroundPage().timeline
            console.log($scope.timeline);
            $scope.maxid = $scope.timeline[$scope.timeline.length-1].id;
            $scope.unreadTimeLineNum = localStorage.unreadTimeLineNum;
            $scope.unreadCommentNum = localStorage.unreadCommentNum;
            $scope.unreadAtNum = localStorage.unreadAtNum;

        }else{
            $scope.get_home_timeline();
        }

        setInterval(function(){
            $scope.$apply($scope.unreadTimeLineNum = localStorage.unreadTimeLineNum);
        }, 5000);

     }
  ]);






  
  