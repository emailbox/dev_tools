Backbone.View.prototype.close = function () {
	if (this.beforeClose) {
		this.beforeClose();
	}
	//this.remove();
	//this.unbind();
};


Backbone.View.prototype.garbage = function (view_list) {
	// Trash views that are not currently needed

	// passes in a view_list of things to trash



};


App.Views.Body = Backbone.View.extend({
	
	el: 'body',

	events: {
		'click #switch_view' : 'switch_view',
		'click span.data_id' : 'show_log',
		'keyup input#limit' : 'limit',
		'click .fill-defaults' : 'fill_defaults'
	},

	db: [], // database of events

	initialize: function() {
		_.bindAll(this, 'render');

	},


	switch_view: function(ev){
		// Toggle between console and event logs

		var elem = ev.currentTarget;

		if($(elem).hasClass('events')){
			App.router.navigate("console", true);
		} else {
			App.router.navigate("events", true);
			// $(elem).addClass('events');
			// $('#console_body').addClass('nodisplay');
			// $('#events_body').removeClass('nodisplay');
		}

		return false;

	},


	show_log: function(ev){
		// Show event log result

		var elem = ev.currentTarget;
		
		for(i in this.db){	
			if(this.db[i].id != $(elem).attr('data-id')){
				continue;
			}
			var stringd = this.db[i].data;
			var json = JSON.parse(stringd);
			var meta = JSON.parse(stringd);

			// delete meta.data; // display content below the meta info

			// highlight correct row
			$('span.data_id').removeClass('chosen');
			$(elem).addClass('chosen');

			// Add to page
			// console.log(json);
			$('#latest pre#meta').html(JSON.stringify(meta, undefined, 4));
			// $('#latest pre#data').html(JSON.stringify(json.data, undefined, 4));

			/*
			if(typeof(json) != 'undefined'){
				$('#latest pre').html(json);
			}
			*/
		}

		return false;

	},

	fill_defaults: function(ev){
		// Read in the defaults and fill up the JSON tables with each default
		var that = this,
			elem = ev.currentTarget;


		// Get current position_index
		var position_index = localStorage.getItem('position_index');
		if(position_index == null || position_index < 1){
			position_index = 1;
		}

		_.each(App.Data.DefaultSearches, function(obj, idx){
			var id = $('#switcher a').eq(idx).attr('data-id');
			var json_item = js_beautify(JSON.stringify(obj.json));

			// Set localstorage values
			localStorage.setItem('saved_post_name_'+id, obj.name);
			localStorage.setItem('saved_post_json_' + id, json_item);
			localStorage.setItem('saved_url_' + id, obj.url);

			// Update on-page text
			$('#switcher a').eq(idx).text(obj.name);

			// Update currently displayed JSON editor also
			if(position_index == id){
				// Update existing values in JSON editor
				console.info(position_index);
				that.editor_json.getSession().setValue(json_item);
			}


		});

		// Reload the currently-selected one (with new data)
		// - todo

			
		return false;

	},


	render: function() {

		var self = this;
		var that = this;

		// Template
		var template = App.Utils.template('t_body');

		// Write HTML
		$(this.el).html(template());


		// Build Editors
		var editor_js;
		that.editor_json = null;
		var editor_result;
		var ticks = {};
		var cticks = {};
		var api_url = App.Credentials.base_api_url + '/';

		// function tick(name){
		// 	// Register a tick

		// 	var d = new Date();
		// 	var now = d.getMilliseconds();

		// 	if(ticks[name] != undefined){

		// 		var elapsed = now - ticks[name][0];
				
		// 		delete ticks[name];

		// 		// Return the result of the time
		// 		return elapsed;

		// 	} else {

		// 		// doesn't exist, create the starter
		// 		ticks[name] = [];
		// 		ticks[name].push(now);
				
		// 	}

		// }


		// JSON
		that.editor_json = ace.edit("editor_json");
		var JsonMode = require("ace/mode/json").Mode;
		that.editor_json.getSession().setMode(new JsonMode());
		//editor_json.getSession().setFoldStyle('markbegin'); // can't get folding to work
		that.editor_json.setBehavioursEnabled(false); // turn off auto-complete brackets (annoying)
		
		// Result JSON
		editor_result = ace.edit("editor_result");
		var JsonMode2 = require("ace/mode/json").Mode;
		editor_result.getSession().setMode(new JsonMode());
		//editor_result.getSession().setFoldStyle('markbegin'); // can't get folding to work
		editor_result.setBehavioursEnabled(false); // turn off auto-complete brackets (annoying)

		// Get position, use #1 if position not saved in localStorage
		// - set by default
		var position_index = localStorage.getItem('position_index');
		if(position_index != null && position_index > 0){
			// Good
		} else {
			position_index = 1;
		}


		// Activate Switcher (tabs)
		for(var i = 1; i <= 10; i++){
			// Get name
			var name = i;
			var saved_name = localStorage.getItem('saved_post_name_'+i);
			if(saved_name != null && saved_name.length > 0){
				name = saved_name;
			}

			$('#switcher').append('<li><a href="#" data-id="'+i+'">'+name+'</a></li>');
		}

		// Number clicked
		$('#switcher a').click(function(){
			
			// position_index
			var id = $(this).attr('data-id');

			// Get values from localStorage
			// - add to page

			// POST Editor
			var saved_post_json = localStorage.getItem('saved_post_json_' + id);
			if(saved_post_json != null && saved_post_json != false){
				
				that.editor_json.getSession().setValue(saved_post_json);
				
			} else {
				// No data saved for this one, yet
				// - clear out the entry form
				that.editor_json.getSession().setValue("");
			}

			// Results Editor
			var saved_post_result = localStorage.getItem('saved_post_result_' + id);
			if(saved_post_result != null && saved_post_result != false){
				
				editor_result.getSession().setValue(saved_post_result);
				
			} else {
				// No data saved for this one, yet
				// - clear out the entry form
				editor_result.getSession().setValue("");
			}


			// Add saved URL
			var saved_url = localStorage.getItem('saved_url_' + id);
			if(saved_url != null && saved_url != false){
				$('.url').val(saved_url);
			} else {
				// Set to ecko
				$('.url').val('api/echo');
			}

			// Add colors
			$('#switcher li').removeClass('active');
			$(this).parent('li').addClass('active');

			// Set position_index for localStorage
			localStorage.setItem('position_index',id);

			return false;

		});

		$('#switcher a').dblclick(function(){

			// Prompt for new tab name
			var name = prompt('Enter Tab Name',$(this).text());

			// Add to html
			$(this).text(name);

			// Get position_index
			var id = $(this).attr('data-id');

			// Set in localStorage
			localStorage.setItem('saved_post_name_'+id,name);

			return false;

		}); 


		// Click the right button and it does the rest
		$('#switcher a[data-id="'+position_index+'"]').click();

		// Getting actual code
		//editor_json.getSession().getValue();

		$('.beautify').click(function(){
			that.editor_json.getSession().setValue(js_beautify(that.editor_json.getSession().getValue()));
			return false;
		});

		$('.swap').toggle(function(){
			$('#editor_result').addClass('nodisplay');
			$('#json_result').removeClass('nodisplay');
			return false;
		},function(){
			$('#editor_result').removeClass('nodisplay');
			$('#json_result').addClass('nodisplay');
			return false;
		});

		// invalid json checker
		var checkJSON = function(){
			try {
				var data_json = $.parseJSON(that.editor_json.getSession().getValue());
				$('.invalid_json').empty();
			} catch(err){
				$('.invalid_json').html('<span class="label label-important">Invalid JSON</span>');
			}

			window.setTimeout(checkJSON, 300);
		};
		checkJSON();

		$('.btn-submit').click(function(){

			// tick('post');

			// $(this).parent().find('.label').remove();
			// $('.invalid_json').empty();

			// Get URL
			var url = $('.url').val();

			// Get actual value
			var data = that.editor_json.getSession().getValue();

			// Validate that this is JSON
			
			//if(url != 'api/js'){
				try {
					var data_json = $.parseJSON(data);
				} catch(err){
					// $('.invalid_json').html(' <span class="label label-important">Invalid JSON</span>');
					alert('Invalid JSON');
					return false;
				}
			//}

			// Add authentication to JSON
			// - if asked
			if($('#auth:checked').length > 0){
				var data = {
					auth: {
							app: App.Credentials.app_key,
							access_token: App.Credentials.access_token
						},
					data: data_json
				};
			} else {
				var data = data_json;
			}


			// Stringify before sending
			data = JSON.stringify(data);


			$('#json_result').html('');

			$.ajax({
				url: api_url + url,
				cache: false,
				type: 'post',
				data: data,
				dataType: 'html',
				headers: {"Content-Type" : "application/json"},
				error: function(err){
					//alert('Error with return data (page failed to display. 404 or 500 is likely)');
					console.log(err);
				},
				success: function(html){

					try {
						var json = $.parseJSON(html);
					} catch(err){
						alert('Failed parsing JSON');
						$('#json_result').html(html);
						$('#json_result').prepend('FAILED PARSING, NO VALID JSON RETURNED<br /><br />');
						return;
					}


					if(json == null){
						json = { result: null}
					}

					// Elapsed versus received "time"
					// - showing latency
					// var elapsed = tick('post') / 1000;
					var elapsed = 1;
					var diff = '';
					var diff_perc = '';
					if(json.time != undefined){
						diff = elapsed - json.time;
						diff_perc = (diff / elapsed) * 100;
					}
					$('#elapsed').text(elapsed + ' ' + diff + ' ' + diff_perc);


					// Insert the JSON

					// Logging to console
					console.log('Returned JSON Object:');
					console.log(json);

					var beautify_json = js_beautify(JSON.stringify(json));

					// Get position_index for current Tab
					var position_index = localStorage.getItem('position_index');
					if(position_index != null && position_index > 0){

					} else {
						position_index = 1;
					}

					// Save to localStorage
					localStorage.setItem('saved_post_result_' + position_index,beautify_json);
					localStorage.setItem('saved_post_json_' + position_index,data);
					localStorage.setItem('saved_url_' + position_index,url);

					// Insert into right-side editor
					editor_result.getSession().setValue(beautify_json);

					// Also update the other thing

					JSONFormatter.format(json, {'appendTo' : '#json_result',
												'collapse' : true});

					// Getting path to highlighted element
					$('.key').each(function(i,that){
						var paths = [];
						$($(that).parents('ul:not(#json)').get().reverse()).each(function(i,elem){
							paths.push($(elem).parent().find('> span.key').text());
						});
							
						var path;

						if(paths.length == 0){
							path = $(that).text();
						} else {
							path = paths.join('.');
							path += '.' + $(that).text();
						}

						$(that).attr('title',path);

					});

					$('.key').after('<span class="colon">:</span>');

					$('.key').tooltip();


				}
			});

			return false;

		});
		
		// Resize the box on window resize
		$(window).resize(function() {
			// resizeEditors();

			var win_h = $(window).height();

			var from_top = $('#editor_json').offset().top;

			var new_h = win_h - from_top;

			$('#editor_json').height(new_h + 'px')
			$('#editor_result').height(new_h + 'px')

			that.editor_json.resize();
			editor_result.resize();

		});
		

		// Save the Editor values constantly (every 500 milliseconds)
		window.setInterval(function(){

			// This checks localStorage waaaay too often
			// - not sure about the consequences for that

			// Get position_index
			var position_index = localStorage.getItem('position_index');
			if(position_index == null || position_index <= 0){
				position_index = 1;
			}

			// Match the previous with the currently displayed
			var saved_post_json = localStorage.getItem('saved_post_json_' + position_index);
			if(saved_post_json == null || saved_post_json == false){
				// It is empty
				saved_post_json = "";
			}

			// Current value
			var current_value = that.editor_json.getSession().getValue();

			// Match?
			if(current_value != saved_post_json){
				// Save the new one
				localStorage.setItem('saved_post_json_' + position_index,current_value);
			}


		},500);

		// App.Plugins.DevTools.resizeEditors();

		var win_h = $(window).height();

		var from_top = $('#editor_json').offset().top;

		var new_h = win_h - from_top;

		$('#editor_json').height(new_h + 'px')
		$('#editor_result').height(new_h + 'px')

		that.editor_json.resize();
		editor_result.resize();

		// Set listener for new events
		console.log(Api.Event.on({
			event: '*'
		},
		function(d){
			// Update panels

			// Update the created
			var t = new Date();
			d.created = t.getTime();

			var j = JSON.stringify(d);

			that.db.push({
				id: d.id,
				data: j
			});

			// Add to list
			var template = App.Utils.template('t_item');

			// Render the new list
			that.render_list();

		}));

		return this;
	}, 


	limit: function(ev){
		var elem = ev.currentTarget;
		var that = this;

		// Get previous version
		that.filter = that.filter || null;

		if($(elem).val() != that.filter){
			that.filter = $(elem).val();
			that.render_list(that.filter);
			console.log('rendered');
		}

	},

	render_list: function(filter){
		var that = this;

		filter = filter || null;

		$('#list .empty').remove();

		$('#list').html("");

		var template = App.Utils.template('t_item');

		// Limit the size of that.db
		that.db = that.db.splice(-1 * App.Credentials.max_event_display)

		$.each(that.db,function(i,d){
			var ev = JSON.parse(d.data);
			if(filter){
				// See if filter is in any of the fields we test against
				var fields = ['event','id'];
				var found = false;
				$.each(fields,function(k,field){
					if(ev[field].indexOf(filter) != -1){
						found = true;
						console.log(ev[field]);
					}
				});
				if(typeof ev.data.response_to == 'string' && ev.data.response_to.indexOf(filter) != -1){
					found = true;
				}
				if(!found){
					return;
				}
			}
			$('#list').prepend(template(ev));
		});

		$('.timeago').timeago();

	}
});


App.Views.BodyLogin = Backbone.View.extend({
	
	el: 'body',

	events: {
		'click button' : 'login' // composing new email,
	},

	initialize: function() {
		_.bindAll(this, 'render');

	},

	login: function(ev){
		// Start OAuth process

		var p = {
			response_type: 'token',
			client_id : App.Credentials.app_key,
			redirect_uri : [location.protocol, '//', location.host, location.pathname].join('')
			// state // optional
			// x_user_id // optional	
		};
		var params = $.param(p);

		window.location = "https://getemailbox.com/apps/authorize/?" + params;

		return false;

	},

	render: function() {

		var template = App.Utils.template('t_body_login');

		// Write HTML
		$(this.el).html(template());

		return this;
	}
});

