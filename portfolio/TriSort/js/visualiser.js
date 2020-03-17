const el_factory = function(type, attributes, child){
	const el = document.createElement(type);
	for (key in attributes)
		el.setAttribute(key, attributes[key]);
	if(child != null)
		if (typeof child === 'string')
		  el.appendChild(document.createTextNode(child));
		else if(child.constructor === Array){
			for(var i = 0; i < child.length; i++){
				el.appendChild(child[i]);
			}
		}
	return el;
}

const visualiser = function(options){

	this.visualizer = null;
	this.TriSortStack = [];
	this.ctx = null;
	this.Canvas = null;
	this.drawn_index = 0;
	this.Editor = null;
	
	this.constructor = function(options){
		this.visualizer = el_factory("div", {class: "m-5 jumbotron text-center"});
		var Container = el_factory("div", {class: "container-fluid"});

		var Row = el_factory("div", {class: "row"});
		var col1 = el_factory("div", {class: "col"}, [
			this.make_canvas()
		]);
		var col2 = el_factory("div", {class: "col"}, [
			this.CodeEditor()
		])
		Row.appendChild(col1);
		Row.appendChild(col2);
		Container.appendChild(Row);
		Container.appendChild(this.controller_factory());

		this.visualizer.appendChild(Container);

		//Run the algorithm
		var A = [9, 2, 11, 3, 7, 1, 9, 4, 8, 12];
		this.TriSort(A, 0, A.length-1);

		this.draw_items(this.TriSortStack[0].A, this.draw_items(this.TriSortStack[this.drawn_index].A, this.TriSortStack[this.drawn_index].i, this.TriSortStack[this.drawn_index].j));

		return this.visualizer;
	}
	
	this.playing = false;

	this.sleep = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	  }

	this.controller_factory = function(){

		var _this = this;
		var controller = el_factory("div", {class: "controls p-3 text-center"});
		var controls = el_factory("div");

		var btn_to_beginning = el_factory("i", {class: "fa fa-step-backward text-black px-3"});
		var btn_step_back = el_factory("i", {class: "fa fa-backward text-black px-3"});
		var btn_play_pause = el_factory("i", {class: "fa fa-play text-black px-3"});
		var btn_step_forward = el_factory("i", {class: "fa fa-forward text-black px-3"});
		var btn_to_end = el_factory("i", {class: "fa fa-step-forward text-black px-3"});

		var progress_bar_wrapper = el_factory("div", {class: "progress", style: "height: 20px; border: 1px solid black;"});
		var progress_bar = el_factory("div", {
			class: "progress-bar progress-bar-striped progress-bar-animated",
			role: "progressbar",
			style: "width: 0%;"
		});
		progress_bar_wrapper.appendChild(progress_bar);

		btn_to_beginning.onclick = function(e){
			console.log(1);
		}
		btn_step_back.onclick = function(){
			if(_this.drawn_index -1 == 0)
				return;
			_this.draw_items(_this.TriSortStack[_this.drawn_index].A, _this.TriSortStack[_this.drawn_index].i, _this.TriSortStack[_this.drawn_index].j);

			_this.drawn_index--;

			var Range = ace.require('ace/range').Range;
			var current_line = _this.TriSortStack[_this.drawn_index -1].line -1;
			_this.Editor.getSession().removeMarker(_this.Marker);
			_this.Marker = _this.Editor.session.addMarker(new Range(current_line, 0, current_line, 1), "myMarker", "fullLine");

			
			progress_bar.style.width = ((_this.drawn_index) / _this.TriSortStack.length) * 100 + "%";
		}
		btn_play_pause.onclick = async function(e){
			
			var playing = false;

			if(this.className.indexOf("fa-play") == -1){ //switch to pause
				console.log("pause");

				this.className = "fa fa-play text-black px-3"

				_this.playing = false;

				// while(_this.playing){

				// 	console.log("playing");

				// 	await _this.sleep(1000)
				// }

			} else{ //switch to play


				if(_this.drawn_index == _this.TriSortStack.length){
					console.log("end");
					_this.playing = false;
					return;
				}
				this.className = "fa fa-pause text-black px-3"
				_this.playing = true;

				while(_this.playing){

					_this.draw_items(_this.TriSortStack[_this.drawn_index].A, _this.TriSortStack[_this.drawn_index].i, _this.TriSortStack[_this.drawn_index].j);

					var Range = ace.require('ace/range').Range;
					var current_line = _this.TriSortStack[_this.drawn_index].line -1;
					_this.Editor.getSession().removeMarker(_this.Marker);
					_this.Marker = _this.Editor.session.addMarker(new Range(current_line, 0, current_line, 1), "myMarker", "fullLine");

					_this.drawn_index++;

					progress_bar.style.width = ((_this.drawn_index) / _this.TriSortStack.length) * 100 + "%";

					await _this.sleep(50);
				}

			}
		}
		btn_step_forward.onclick = function(){
			if(_this.drawn_index == _this.TriSortStack.length)
				return;
			_this.draw_items(_this.TriSortStack[_this.drawn_index].A, _this.TriSortStack[_this.drawn_index].i, _this.TriSortStack[_this.drawn_index].j);

			var Range = ace.require('ace/range').Range;
			var current_line = _this.TriSortStack[_this.drawn_index].line -1;
			_this.Editor.getSession().removeMarker(_this.Marker);
			_this.Marker = _this.Editor.session.addMarker(new Range(current_line, 0, current_line, 1), "myMarker", "fullLine");

			_this.drawn_index++;

			progress_bar.style.width = ((_this.drawn_index) / _this.TriSortStack.length) * 100 + "%";
		}

		this.Marker = null;

		btn_to_end.onclick = function(){
			console.log(1);
		}

		controls.appendChild(btn_to_beginning);
		controls.appendChild(btn_step_back);
		controls.appendChild(btn_play_pause);
		controls.appendChild(btn_step_forward);
		controls.appendChild(btn_to_end);
		controller.appendChild(controls);

		controller.appendChild(progress_bar_wrapper);

		return controller;
	}

	this.make_canvas = function(){
		
		var Container = el_factory("div", {class: "container"});
		var Panel = el_factory("div", {class: "panel panel-default"});
		var PanelHeading = el_factory("h3", {class: "panel-heading"}, [
			el_factory("h3", {class: "panel-title"}, "Visualization")
		]);
		var PanelBody = el_factory("div", {class: "panel-body text-center"});
		this.Canvas = el_factory("canvas", {height: 600, width: 600});
		PanelBody.appendChild(this.Canvas);
		Panel.appendChild(PanelHeading);
		Panel.appendChild(PanelBody);
		Container.appendChild(Panel);

		this.ctx = this.Canvas.getContext("2d");

		return Container;
	}
	
	this.draw_items = function(A, _i, _j){
	
		//clear the canvas
		this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);

		this.draw_item = function(ulx, width, height, text, index, color){
			const item_uly = this.Canvas.height - height -1;
			this.ctx.beginPath();
			this.ctx.rect(ulx, item_uly - 20, width, height);
			this.ctx.fillStyle = color;
			this.ctx.strokeRect(ulx, item_uly - 20, width +1, height);
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.fillStyle = "black";
			this.ctx.fillText(text, ulx + ((width / 2) - 2), item_uly + height - 25);
			this.ctx.fill();
			this.ctx.fillText(index, ulx + ((width / 2) - 2), item_uly + height - 5);
			this.ctx.fillStyle = "black";
			this.ctx.fill();
			
		}

		//Assumes a single transition has occured
		this.draw_transition = function(before, after){
			for(var i = 0; i < before.length; i++){
				if(before[i] != after[i]){

				}
			}
		}

		// var b = [2,4,3];
		// var a = [2,3,4];

		for(var i = 0; i < A.length; i++){
			const item_width = this.Canvas.width / A.length
			var color = "#e9ecef";
			if(i >= _i && i <= _j)
			color = "blue";
			this.draw_item(item_width * i, item_width, A[i]*20, A[i], i+1, color);
		}
	}

	this.mem_cpy = function(input){
		return JSON.parse(JSON.stringify(input));
	}

	this.TriSort = function(A, i, j){
		this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 1});
		if(i + 1 == j && A[i] > A[j]){ //if the partition has two items and the item on the left is greater than the item on the right, swap them.
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 2});
			var tmp = A[i];
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 3});
			A[i] = A[j];
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 4});
			A[j] = tmp;
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 5});
		}
		if(i + 1 < j){
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 7});
			var k = parseInt((j - i + 1) / 3);
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 8});

			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 9});
			this.TriSort(A, i, j - k); //Sort the first two-thirds
			
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 10});
			this.TriSort(A, i + k, j); //Sort the last two-thirds
			
			this.TriSortStack.push({A: JSON.parse(JSON.stringify(A)), i: this.mem_cpy(i), j: this.mem_cpy(j), line: 11});
			this.TriSort(A, i, j - k); //Sort the first two-thirds again
			
		}
	}

	this.CodeEditor = function(){

		var Container = el_factory("div", {class: "container-fluid"});
		var Panel = el_factory("div", {class: "panel panel-default"});
		var PanelHeading = el_factory("h3", {class: "panel-heading"}, [
			el_factory("h3", {class: "panel-title"}, "Code")
		]);
		var PanelBody = el_factory("div", {class: "panel-body text-center  my-auto"});
		var Component = el_factory("div", {style: "height: 300px;"});
		this.Editor = ace.edit(Component, {
			mode: "ace/mode/javascript",
			theme: "ace/theme/monokai"
		});
		PanelBody.appendChild(Component);
		Panel.appendChild(PanelHeading);
		Panel.appendChild(PanelBody);
		Container.appendChild(Panel);

		
var TriSortString = `function TriSort(A, i, j){
	if(i + 1 == j && A[i] > A[j]){
		var tmp = A[i];
		A[i] = A[j];
		A[j] = tmp;
	}
	if(i + 1 < j){
		var k = parseInt((j - i + 1) / 3);
		TriSort(A, i, j - k);
		TriSort(A, i + k, j);
		TriSort(A, i, j - k);
	}
}`;
	this.Editor.setValue(TriSortString);
	this.Editor.setReadOnly(true);

		
		
		return Container;
	}

	

	return this.constructor(options);
	
}