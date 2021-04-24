var Clock = {
	totalSeconds: 0,
	start: function () {
		function pad(val) {
			return val > 9 ? val : "0" + val;
		}
		if (!this.interval) {
			var self = this;

			this.interval = setInterval(function () {
				self.totalSeconds += 1;

				document.getElementById("hour").innerHTML = pad(parseInt(self.totalSeconds / 3600 % 60));
				document.getElementById("minute").innerHTML = pad(Math.floor(self.totalSeconds / 60 % 60));
				document.getElementById("second").innerHTML = pad(parseInt(self.totalSeconds % 60));
			}, 1000);
		}
	},

	reset: function () {
		Clock.totalSeconds = null;
		clearInterval(this.interval);
		document.getElementById("minute").innerHTML = "00";
		document.getElementById("second").innerHTML = "00";
		document.getElementById("hour").innerHTML = "00";
		delete this.interval;
	},
	pause: function () {
		clearInterval(this.interval);
		delete this.interval;
	},


};

//   user_head = $('#heading_name').text()
//   


(function ($) {
	$(function () {

		play = document.getElementById("play")
		play.addEventListener("click", function () {
			if (play.classList.contains('tactive')) {
				Clock.pause();
				play.classList.remove('tactive')
				play.classList.add('pactive')
			} else {
				Clock.start();
				play.classList.remove('pactive')
				play.classList.add('tactive')
			}
		});



		fetch(`/latest`)
			.then(resp => resp.json())
			.then(data => {
				console.log("Fetch 1")
				$('#heading_name').html()
				$('#heading_name').html(data.name)
				$('#heading_user').html()
				$('#heading_user').html(`By ${data.user}`)
				$('#date').html()
				$('#date').html(data.date)
				var puzzleData = data.item
				$('#puzzle-wrapper').crossword(puzzleData, data.name, data.next);
				Clock.pause();
				play.classList.remove('tactive')
				play.classList.add('pactive')
			})


	})
})(jQuery)

function renderPuzzle(f) {

	fetch(`/puzzle/${f}`)
		.then(resp => resp.json())
		.then(data => {
			console.log("Fetch 2")
			$('#puzzle-wrapper').html('')
			$('#puzzle-clues').html('')
			$('#heading_name').html()
			$('#heading_name').html(data.name)
			$('#heading_user').html()
			$('#heading_user').html(`By ${data.user}`)
			next_id = (parseInt(data.id) + 1)
			$('#date').html()
			$('#date').html(data.date)
			var puzzleData = data.item
			$('#puzzle-wrapper').crossword(puzzleData, data.name, data.next);
			Clock.pause();
			play.classList.remove('tactive')
			play.classList.add('pactive')


		})
}

function sendMail() {
	e.preventDefault()
	fetch('/subscribe', {
			method: 'POST',
			body: JSON.stringify({
				email: document.querySelector(`#name_email`).value,
				name: document.querySelector(`#name_form`).value
			})
		})
		.then(response => response.json())
		.then(data => {
			console.log(data)
			document.querySelector('.newsletter-overlay').style.display = 'none';
		})
}

var delay = 5000; //in milleseconds
setTimeout(function () {
	showNewsletterPopup();
}, delay);

$('.popup-close').click(function () {
	$('.newsletter-overlay').hide();

	//when closed create a cookie to prevent popup to show again on refresh
	setCookie('newsletter-popup', 'popped', 30);
});




function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = jQuery.trim(ca[i]);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function showNewsletterPopup() {
	$('.newsletter-overlay').show();
	setCookie('newsletter-popup', 'popped', 50);
// 	if (getCookie('newsletter-popup') == "") { 
// }
// 	else {
// 		console.log("Newsletter popup blocked.");
// }
}