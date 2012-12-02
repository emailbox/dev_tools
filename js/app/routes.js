
App.Router = Backbone.Router.extend({

	routes: {
		
		'body' : 'body',         // entry point: no hash fragment or #

		'body_login' : 'body_login',

		'logout' : 'logout'
		
	},

	showView: function(hash,view){
		// Used to discard zombies
		if (!this.currentView){
			this.currentView = {};
		}
		if (this.currentView && this.currentView[hash]){
			this.currentView[hash].close();
		}
		this.currentView[hash] = view.render();
	},


	body: function(){
		// Analytics
		// console.log(App.Models.Search);
		
		var page = new App.Views.Body();
		App.router.showView('body',page);

	},


	body_login: function(){
		// Redirect through OAuth

		// Unless user_token is already in querystring
		
		if(typeof App.Credentials.user_token != 'string' || App.Credentials.user_token.length < 1){
			
			var qs = App.Utils.getUrlVars();

			if(typeof qs.user_token == "string"){
				// Have a user_token
				// - save it to localStorage
				localStorage.setItem(App.Credentials.prefix_user_token + 'user_token',qs.user_token);
				
				// Reload page, back to #home
				window.location = [location.protocol, '//', location.host, location.pathname].join('');
			} else {
				// Show login splash screen
				var page = new App.Views.BodyLogin();
				App.router.showView('bodylogin',page);
			}

		} else {
			// Reload page, back to #home
			window.location = [location.protocol, '//', location.host, location.pathname].join('');
			return;
		} 

	},

	intro: function(){
		var page = new App.Views.Modal.Intro();
		page.render();
	},


	logout: function(){
		// Logout

		// alert('Logging out');

		// Reset user_token
		localStorage.setItem(App.Credentials.prefix_user_token + 'user_token','');
		
		window.location = [location.protocol, '//', location.host, location.pathname].join('');

	},


});
