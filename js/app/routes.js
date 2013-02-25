
App.Router = Backbone.Router.extend({

	routes: {
			
		'body' : 'body',         // entry point: no hash fragment or #

		'body_login' : 'body_login',

		'events' : 'events',
		'console' : 'console',

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
		
		if(typeof App.Credentials.access_token != 'string' || App.Credentials.prefix_access_token.length < 1){
			
			// var qs = App.Utils.getUrlVars();
			var oauthParams = App.Utils.getOAuthParamsInUrl();

			// if(typeof qs.user_token == "string"){
			if(typeof oauthParams.access_token == "string"){

				// Have an access_token
				// - save it to localStorage
				localStorage.setItem(App.Credentials.prefix_access_token + 'user',oauthParams.user_identifier);
				localStorage.setItem(App.Credentials.prefix_access_token + 'access_token',oauthParams.access_token);
				
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

	events: function(){
		// called either at startup, or during running
		// - create the body, or just modify it
		if($('#switch_view').length < 1){
			// Create body
			Backbone.history.loadUrl('body')
		}

		// Modify body
		$('#switch_view').html('Go to <strong>Console</strong>');
		$('#switch_view').addClass('events');
		$('#console_body').addClass('nodisplay');
		$('#events_body').removeClass('nodisplay');
		
	},

	console: function(){

		if($('#switch_view').length < 1){
			// Create body
			Backbone.history.loadUrl('body')
		}

		$('#switch_view').html('Go to <strong>Events</strong>');
		$('#switch_view').removeClass('events');
		$('#console_body').removeClass('nodisplay');
		$('#events_body').addClass('nodisplay');
	},


	logout: function(){
		// Logout

		// alert('Logging out');

		// Reset user_token
		localStorage.setItem(App.Credentials.prefix_access_token + 'access_token',null);
		
		window.location = [location.protocol, '//', location.host, location.pathname].join('');

	},


});
