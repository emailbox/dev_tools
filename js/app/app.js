//forge.debug = true;

var clog = function(v){
	window.console.log(v);
};

var App = {
	Models:      {},
	Collections: {},
	Views:       {},
	Utils:       {},
	Plugins:     {},
	Data: 		 {},
	Credentials: tmp_credentials,

	// Called once, at app startup
	init: function () {

		var currentUrl = window.location.href;

		// Load apps
		// - including development apps (default?)

		// init Router
		// - not sure if this actually launches the "" position...
		App.router = new App.Router();
		Backbone.history.start({silent: true}); // Launches "" router
		App.router.navigate('',true);

		var user_token = localStorage.getItem(App.Credentials.prefix_user_token + 'user_token');
		App.Credentials.user_token = user_token;

		if(typeof App.Credentials.user_token != 'string' || App.Credentials.user_token.length < 1){
			// App.router.navigate("body_login", true);
			Backbone.history.loadUrl('body_login')
			return;
		}

		// Validate credentials

		Api.search({
			data: {
				model: 'Test',
				paths: ['_id'],
				conditions: {},
				limit: 1
			},
			success: function(res){
				var res = JSON.parse(res);
				if(res.code != 200){
					localStorage.setItem(App.Credentials.prefix_user_token + 'user_token',null);
					App.Credentials.user_token = null;
					// App.router.navigate("body_login", true);
					Backbone.history.loadUrl('body_login')
					return;
				}

				Backbone.history.loadUrl('body');
				//App.router.navigate('body',{trigger: true, replace: false});

			}
		});

	}

};


