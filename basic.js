const getId = (id) => document.getElementById(id);

function showOverlay(id) {
	const elm = getId(id);
	const overlay = document.createElement("div");
	overlay.classList.add("overlay");
	overlay.setAttribute("name", id);
	overlay.innerHTML = `
<div onclick="_onOverlayDestroy(this.parentElement);"></div>
<div>
	<button class="close" onclick="_onOverlayDestroy(this.parentElement.parentElement);">X</button>
	${elm.innerHTML}
</div>
	`;
	document.body.appendChild(overlay);
}
function _onOverlayDestroy(elm) {
	const ori_elm = getId(elm.getAttribute("name"));
	if (ori_elm) {
		const cb = ori_elm.getAttribute("onclose");
		if (typeof(cb) == "string") {
			try { eval(cb); } catch(err) { console.error(err); }
		}
	}
	elm.remove();
}
function hideOverlay(id) {
	const elms = document.getElementsByName(id);
	for (var i of elms) _onOverlayDestroy(i);
}


function _main_events() {
	const header_bar_1 = document.querySelector(".header_bar_1");
	if (header_bar_1 != null) {
		let isFloating = false;
		window.addEventListener("load", function () {
			if (window.pageYOffset > 0) {
				header_bar_1.style.animationDuration = "0s";
				header_bar_1.classList.add("header_bar_1_undocked");
				isFloating = true;
			}
		});
		window.addEventListener("scroll", function() {
			if (window.pageYOffset > 0 && !isFloating) {
				header_bar_1.style.animationDuration = "0.5s";
				header_bar_1.classList.remove("header_bar_1_docked");
				header_bar_1.classList.add("header_bar_1_undocked");
				isFloating = true;
			} else if (window.pageYOffset === 0 && isFloating) {
				header_bar_1.style.animationDuration = "0.5s";
				header_bar_1.classList.remove("header_bar_1_undocked");
				header_bar_1.classList.add("header_bar_1_docked");
				isFloating = false;
			}
		});
	}
}
_main_events();