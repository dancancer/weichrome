'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
 .service('DataHolder', function() {
        return {};
    }).factory('sinaApi',function($http){
        var sinaApi = {};
        sinaApi.access_token = localStorage.access_token;
        sinaApi.uid = localStorage.uid;
        sinaApi.config = {
            source : '3962237458',
            oauth_key : '3962237458',
            oauth_secret : 'bc289a46f3f0af639194383ac884d784',
            google_appkey : 'pnkacoeejlfoikeaiobjennblgpoaaao',
            oauth_callback:'https://api.weibo.com/oauth2/default.html',
            host : 'https://api.weibo.com/2',
            get_uid : '/account/get_uid.json',
            user_show:'/users/show.json',
            user_timeline:'/statuses/user_timeline.json',
            home_timeline:'/statuses/home_timeline.json',
            comments_timeline:'/comments/timeline.json',
            mentions_timeline:'/statuses/mentions.json',
            get_comments:'/comments/show.json',
            post_comments:'/comments/create.json',
            repost_timeline:'/statuses/repost_timeline.json',
            friends:'/friendships/friends.json',
            favorites:'/favorites.json',
            emotions:'/emotions.json',
            repost:'/statuses/repost.json',
            update:'/statuses/update.json',
            upload:'/statuses/upload.json',
            revokeoauth2:'/oauth2/revokeoauth2',
            add_favorites:'/favorites/create.json',
            remove_favorites:'/favorites/destroy.json',
            reply:'/comments/reply.json',
            friendships_create:"/friendships/create.json",
            friendships_destroy:"/friendships/destroy.json",
        };

        sinaApi._get =  function(url,suc,err){
            $http({method:'GET', url: url}).
                success(function(data, status) {
                    suc(data);
                }).
                error(function(data, status) {
                    err(data);
                });
        }

        sinaApi._post =  function(url,data,suc,err){
            $http({
                method:'POST',
                url: url,
                data:data,
                dataType:'text',
                headers:{'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status) {
                    suc(data);
                }).
                error(function(data, status) {
                    err(data);
                });
        }

        sinaApi.reloadCfg = function(){
            sinaApi.access_token = localStorage.access_token;
            sinaApi.uid = localStorage.uid;
        }

        sinaApi.gettoken = function(code,suc,err){
            var param = '&code='+code;
            var path = 'https://api.weibo.com/oauth2/access_token?client_id='+sinaApi.config.oauth_key+
                '&client_secret='+sinaApi.config.oauth_secret+
                '&grant_type=authorization_code&redirect_uri=https://api.weibo.com/oauth2/default.html';
            $http({method:'POST',url: path+param}).
                success(function(data, status) {
                    localStorage.access_token = data.access_token;
                    localStorage.uid = data.uid;
                    sinaApi.reloadCfg();
                    suc(data);
                }).
                error(function(data, status) {
                    err(data);
                });
        };

        sinaApi.friends = function(cursor,suc,err){
            var param = '?access_token='+sinaApi.access_token+"&uid="+sinaApi.uid+"&count=200&cursor="+cursor;
            var url = sinaApi.config.host+sinaApi.config.friends+param;
            sinaApi._get(url,suc,err);
        };

        sinaApi.user_show_byid = function(uid,suc,err){
            var param = '?access_token='+sinaApi.access_token+'&uid='+uid;
            var url = sinaApi.config.host+sinaApi.config.user_show+param;
            sinaApi._get(url,suc,err);
        };

        sinaApi.user_show = function(screen_name,suc,err){
            var param = '?access_token='+sinaApi.access_token+'&screen_name='+screen_name;
            var url = sinaApi.config.host+sinaApi.config.user_show+param;
            sinaApi._get(url,suc,err);
        };

        sinaApi.mentions_timeline = function(maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.mentions_timeline+'?access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.comments_timeline = function(maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.comments_timeline+'?access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.favorites = function(maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.favorites+'?access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.favorites = function(maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.favorites+'?access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.home_timeline = function(maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.home_timeline+'?access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.user_timeline = function(screen_name,maxid,suc,err){
            var url =  sinaApi.config.host+sinaApi.config.user_timeline+'?screen_name='+screen_name+'&access_token='+sinaApi.access_token;
            if(maxid!=null){
                url = url+"&max_id="+maxid;
            }
            sinaApi._get(url,suc,err);
        }

        sinaApi.get_comments = function(id,page,suc,err){
            var param = '?access_token='+sinaApi.access_token+"&id="+id+"&page="+page+"&count=8";
            var url = sinaApi.config.host+sinaApi.config.get_comments+param;
            sinaApi._get(url,suc,err);
        }

        sinaApi.repost_timeline = function(id,page,suc,err){
            var param = '?access_token='+sinaApi.access_token+"&id="+id+"&page="+page+"&count=8";
            var url = sinaApi.config.host+sinaApi.config.repost_timeline+param;
            sinaApi._get(url,suc,err);
        }

        sinaApi.update = function(text,suc,err){
            var _data = 'status='+encodeURI(text)+
                '&access_token='+sinaApi.access_token;
            var url= sinaApi.config.host+sinaApi.config.update;
            sinaApi._post(url,_data,suc,err);
        }

        sinaApi.upload = function(text,pic,suc,err){
            var _data = bulidUploadParam($scope.commentbox.pic,{
                'status':encodeURI($scope.commentbox.comment_txt),
                'access_token':sinaApi.access_token
            });
            var url= sinaApi.config.host+sinaApi.config.upload;
            var _header = {'Content-Type': 'application/x-www-form-urlencoded'}
            $.ajax({
                url : url,
                cache : false,
                timeout : 5 * 60 * 1000,
                type : 'post',
                data : _data.blob,
                dataType : 'text',
                contentType : 'multipart/form-data; boundary=' + _data.boundary,
                processData : false,
                beforeSend : function(req) {
                    for ( var k in _data.auth_args.headers) {
                        req.setRequestHeader(k, _data.auth_args.headers[k]);
                    }
                },
                success : function(data, textStatus, xhr) {
                    suc(data);
                },
                error : function(xhr, textStatus, errorThrown) {
                    err(xhr)                  }
            });
        }

        sinaApi.reply = function(text,cid,id,comment_orig,suc,err){
            var url= sinaApi.config.host+sinaApi.config.reply;
            var _data = 'comment='+encodeURI(text)+
                '&cid='+cid+'&id='+id+'&access_token='+sinaApi.access_token;
            if(comment_orig)
                _data = _data+'&comment_ori=1';
            sinaApi._post(url,_data,suc,err);
        }

        sinaApi.post_comments = function(text,id,also_repost,suc,err){
            var url= sinaApi.config.host+sinaApi.config.post_comments;
            var _data = 'comment='+encodeURI(text)+
                '&id='+id+'&access_token='+sinaApi.access_token;
            if(also_repost){
                url= sinaApi.config.host+sinaApi.config.repost;
                _data = 'status='+encodeURI(text)+
                    '&is_comment=1&id='+id+'&access_token='+sinaApi.access_token;
            }
            sinaApi._post(url,_data,suc,err);
        }

        sinaApi.repost = function(text,id,is_comment,suc,err){
            var url= sinaApi.config.host+sinaApi.config.repost;
            var _data = 'status='+encodeURI(text)+
                '&is_comment='+is_comment+'&id='+id+'&access_token='+sinaApi.access_token;
            sinaApi._post(url,_data,suc,err);
        }


        sinaApi.favorite = function(id,is_favorited,suc,err){
            var url= sinaApi.config.host+sinaApi.config.add_favorites;
            var _data = '&id='+id+'&access_token='+$scope.access_token;
            if(is_favorited)
                url = sinaApi.config.host+sinaApi.config.remove_favorites;
            sinaApi._post(url,_data,suc,err);
        }

        return sinaApi;
    });
