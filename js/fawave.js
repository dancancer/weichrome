'use strict';
var sinaApi = {
	config : {
		result_format : '.json',
		source : '3962237458',
//        source : '3538199806',
		oauth_key : '3962237458',
//        oauth_key : '3538199806',
		oauth_secret : 'bc289a46f3f0af639194383ac884d784',
//        oauth_secret : '18cf587d60e11e3c160114fd92dd1f2b',
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
        favorites:'/favorites.json',
        emotions:'/emotions.json'
	}
};
