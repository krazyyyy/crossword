

	var Clock = {
		totalSeconds: 1000,
		start: function () {
		  if (!this.interval) {
			  var self = this;
			  function pad(val) { return val > 9 ? val : "0" + val; }
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


	  
	  (function($) {
		  $(function() {
			  
			  play = document.getElementById("play")
		play.addEventListener("click", function () {
			if (play.classList.contains('tactive'))
			{
				Clock.pause(); 
			   play.classList.remove('tactive')
			   play.classList.add('pactive')
			}
			else
			{
			 Clock.start(); 
			 play.classList.remove('pactive')
			 play.classList.add('tactive')
			}
		});
	
		
		
		
		
		
		opt = document.querySelector('#options_level')
		drop = document.querySelector('.drop')
		
		fetch (`/latest`)
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
			$('#puzzle-wrapper').crossword(puzzleData, data.user);
			Clock.reset();
			play.classList.remove('tactive')
			play.classList.add('pactive')
		})
		
		
		
		
		// opt = document.querySelector('select')
		// fetch (`/puzzle/${1}`)
		// 	.then(resp => resp.json())
		// 	.then(data => {
			// 		console.log("Fetch 2")
			// 		$('#puzzle-wrapper').html('')
			// 		$('#puzzle-clues').html('')
			// 		$('#heading_name').html()
			// 		$('#heading_name').html(data.name)
			// 		$('#heading_user').html()
			// 		$('#heading_user').html(`By ${data.user}`)
			// 		$('#date').html()
			// 		$('#date').html(data.date)
			// 		var puzzleData = data.item
			// 		$('#puzzle-wrapper').crossword(puzzleData); 
			
			// 	})
			
			// 	opt.addEventListener('change', () => {
				// 		fetch (`/puzzle/${opt.value}`)
				// 		.then(resp => resp.json())
				// 		.then(data => {
					// 			console.log("Fetch 2")
					// 			$('#puzzle-wrapper').html('')
					// 			$('#puzzle-clues').html('')
	// 			$('#heading_name').html()
	// 			$('#heading_name').html(data.name)
	// 			$('#heading_user').html()
	// 			$('#heading_user').html(`By ${data.user}`)
	// 			$('#date').html()
	// 			$('#date').html(data.date)
	// 			var puzzleData = data.item
	// 			$('#puzzle-wrapper').crossword(puzzleData); 
	
	// 		})
	// 	})
})
})(jQuery)

function renderPuzzle(f){
	
	fetch (`/puzzle/${f}`)
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
		$('#puzzle-wrapper').crossword(puzzleData, data.user); 
		Clock.reset();
		play.classList.remove('tactive')
		play.classList.add('pactive')
		
		
	})
}

function sendMail() {
	e.preventDefault()
fetch('/subscribe', {
	method : 'POST',
	body : JSON.stringify({
		email : document.querySelector(`#name_email`).value, 
		name : document.querySelector(`#name_form`).value 
	})
})
.then(response => response.json())
.then(data => {
	console.log(data)
	document.querySelector('.newsletter-overlay').style.display = 'none';
})
}