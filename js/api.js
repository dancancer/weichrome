'use strict';
var sinaApi = {
	config : {
		result_format : '.json',
		source : '3962237458',
		oauth_key : '3962237458',
		oauth_secret : 'bc289a46f3f0af639194383ac884d784',
		google_appkey : 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk',
        oauth_callback:'https://api.weibo.com/oauth2/default.html',
		host : 'https://api.weibo.com/2',
		get_uid : '/account/get_uid.json',
        user_show:'/users/show.json',
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
        remove_favorites:'/favorites/destroy.json'
	}
};
