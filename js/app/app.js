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
		// Backbone.history.start({silent: true}); // Launches "" router
		Backbone.history.start();
		// App.router.navigate('',true);

		var access_token = localStorage.getItem(App.Credentials.prefix_access_token + 'access_token');
		var user = localStorage.getItem(App.Credentials.prefix_access_token + 'user');
		App.Credentials.access_token = access_token;
		App.Credentials.user = user;

		if(typeof App.Credentials.access_token != 'string' || App.Credentials.access_token.length < 1){
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
					console.log('Failed Test._id search: ' + res.code);
					localStorage.setItem(App.Credentials.prefix_access_token + 'access_token',null);
					App.Credentials.access_token = null;
					// App.router.navigate("body_login", true);
					Backbone.history.loadUrl('body_login')
					return;
				}

				Api.Event.start_listening();

				// Router activated?
				if(Backbone.history.fragment.length < 1){
					Backbone.history.loadUrl('body');
				}
				// App.router.navigate('body',{trigger: false, replace: false});

			}
		});

	}

};


