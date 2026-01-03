//=> use showEvaluationResult(object result_data) -> void;


function showEvaluationResult(result_history_data) {
	const couchDB = new CouchDB();
	
	var elm = getId("evaluation_result");
	if (elm == null) {
		elm = document.createElement("overlay");
		elm.setAttribute("id", "evaluation_result");
		
		document.body.appendChild(elm);
	}
	
	elm.innerHTML = `
<div class="overlay_title">Ergebnisse</div>
<div class="overlay_content" style="display: inline-block; min-width: 90vw; padding: 5px;"></div>
	`;
	
	_updateEvaResContent(showOverlay("evaluation_result"), 0, result_history_data);
}

function _updateEvaResContent(elm, pos, data) {
	const root = elm.querySelector(".overlay_content");
	
	const question = data.questions[pos];
	const result = data.result.map(arr => arr[pos]);
	
	root.innerHTML = `
<span style="text-align: left; display: inline-block; width: 100%;">
	${pos+1}. ${question.title}
</span><br>`;
	
	const span = document.createElement("span");
	span.style = `
width: 100%;
display: inline-block;
padding: 10px;
border-radius: var(--border-radius);
margin-top: 10px;
margin-bottom: 20px;
max-height: 60vh;
min-height: 60vh;
display: flex;
flex-direction: column;
justify-content: center;
background: rgba(255, 255, 255, 0.6);
	`;
	root.appendChild(span);
	
	const span2 = document.createElement("span");
	span2.style = `
width: 100%;
text-align: center;
display: flex;
font-size: 30px;
font-weight: bold;
align-items: middle;
justify-content: center;
flex-direction: row;
	`;
	
	const prevPage = document.createElement("label");
	prevPage.innerHTML = "&nbsp;&lt;&nbsp;";
	if (pos-1 >= 0) {
		prevPage.addEventListener("click", () => _updateEvaResContent(elm, pos-1, data));
		_setEvaResHover(prevPage);
	} else {
		prevPage.style.opacity = "0.4";
	}
	prevPage.style.marginTop = "3px";
	span2.appendChild(prevPage);
	
	for (var i = 0; i < data.questions.length; i++) {
		const isSel = i == pos;
		const div = document.createElement("div");
		div.style = `
display: inline-block;
padding-left: 10px;
padding-right: 10px;
text-align: center;
		`;
		div.innerHTML = `
<label style="border-radius: 50%; display: inline-block; width: 15px; height: 15px; background: ${isSel ? "none": "black"}; border: 2px solid black;"></label>
		`;
		
		if (!isSel) {
			const pos2 = i;
			div.addEventListener("click", () => _updateEvaResContent(elm, pos2, data));
			_setEvaResHover(div);
		}
		span2.appendChild(div);
	}
	
	const nextPage = document.createElement("label");
	nextPage.innerHTML = "&nbsp;&gt;&nbsp;";
	if (pos+1 < data.questions.length) {
		nextPage.addEventListener("click", () => _updateEvaResContent(elm, pos+1, data));
		_setEvaResHover(nextPage);
	} else {
		nextPage.style.opacity = "0.4";
	}
	nextPage.style.marginTop = "3px";
	span2.appendChild(nextPage);
	
	root.appendChild(span2);
	
	if (question.type == "scala" || question.type == "emoji") {
		const canvas = document.createElement("canvas");
		canvas.style = `
width: 100%;
height: calc(100% - 6vh);
border-radius: var(--border-radius);
		`;
		
		const ctx = canvas.getContext("2d");
		_drawEvaResChart(ctx, question, result);
		
		span.appendChild(canvas);
	} else {
		let answers = "";
		for (var i of result) {
			const div = document.createElement("div");
			div.style = `
padding: 10px;
background: rgba(255, 255, 255, 1);
margin-bottom: 10px;
border-radius: var(--border-radius);
			`;
			div.innerText += i;
			answers += div.outerHTML;
		}
		span.innerHTML = `<div style="width: 100%; height: 100%; overflow-y: auto;">
			${answers}
		</div>`;
		span.style.justifyContent = "top";
		span.style.setProperty("justify-content", "start");
	}
}

function _drawEvaResChart(ctx, question, result) {
	const colors = [
		'216, 22, 22',
		'255, 178, 0',
		'255, 236, 0',
		'215, 255, 0',
		'65, 255, 0'
	];
	
	
	if (question.type == "scala") {
		let data = [0,0,0,0,0];
		for (var i of result) {
			if (i < 1) i = 1;
			if (i > 5) i = 5;
			data[i-1]++;
		}
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Sehr schlecht', 'Schlecht', 'Normal', 'Gut', 'Sehr gut'],
				datasets: [{
					label: "Anzahl der Stimmen",
					data: data,
					backgroundColor: [
						'rgba(' + colors[0] + ', 0.2)',
						'rgba(' + colors[1] + ', 0.2)',
						'rgba(' + colors[2] + ', 0.2)',
						'rgba(' + colors[3] + ', 0.2)',
						'rgba(' + colors[4] + ', 0.2)'
					],
					borderColor: [
						'rgba(' + colors[0] + ', 1)',
						'rgba(' + colors[1] + ', 1)',
						'rgba(' + colors[2] + ', 1)',
						'rgba(' + colors[3] + ', 1)',
						'rgba(' + colors[4] + ', 1)'
					],
					borderWidth: 2
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } }
			}
		});
	} else if (question.type == "emoji") {
		let data = [0,0,0];
		for (var i of result) {
			if (i < 1) i = 1;
			if (i > 3) i = 5;
			data[i-1]++;
		}
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Schlecht', 'Ausgeglichen', 'Gut'],
				datasets: [{
					label: "Anzahl der Stimmen",
					data: data,
					backgroundColor: [
						'rgba(' + colors[0] + ', 0.2)',
						'rgba(' + colors[2] + ', 0.2)',
						'rgba(' + colors[4] + ', 0.2)'
					],
					borderColor: [
						'rgba(' + colors[0] + ', 1)',
						'rgba(' + colors[2] + ', 1)',
						'rgba(' + colors[4] + ', 1)'
					],
					borderWidth: 2
				}]
			},
			options: {
				scales: { y: { beginAtZero: true } }
			}
		});
	}
}

function _setEvaResHover(elm) {
	elm.addEventListener('mouseover', function() {
		elm.style.opacity = '0.5';
	});
	elm.addEventListener('mouseout', function() {
		elm.style.opacity = '1';
	});
}