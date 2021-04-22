
(function ($) {
	$.fn.crossword = function (entryData, user_head) {

		var puzz = {}; // put data array in object literal to namespace it into safety
		puzz.data = entryData;

		
		
			
		
			
			// append clues markup after puzzle wrapper div
		// This should be moved into a configuration object
		this.after('<div id="puzzle-clues"><h2>Across</h2><ul id="across"></ul><h2>Down</h2><ul id="down"></ul></div>');
		
		// initialize some variables
		var tbl = ['<table id="puzzle">'],
			puzzEl = this,
			clues = $('#puzzle-clues'),
			clueLiEls,
			coords,
			entryCount = puzz.data.length,
			entries = [],
			rows = [],
			cols = [],
			solved = [],
			tabindex,
			$actives,
			activePosition = 0,
			activeClueIndex = 0,
			currOri,
			targetInput,
			mode = 'interacting',
			solvedToggle = false,
			z = 0;
			
		var puzInit = {
			
			init: function () {
				
				currOri = 'across'; // app's init orientation could move to config object
				
				// Reorder the problems array ascending by POSITION
				puzz.data.sort(function (a, b) {
					return a.position - b.position;
				});
				
				// Set keyup handlers for the 'entry' inputs
				puzzEl.delegate('input', 'keyup', function (e) {
					mode = 'interacting';
					
					
					// need to figure out orientation up front, before we attempt to highlight an entry
					switch (e.which) {
						case 39:
							case 37:
								currOri = 'across';
								break;
						case 38:
							case 40:
								currOri = 'down';
								break;
								default:
							break;
						}
						
						if (e.keyCode === 9) {
							return false;
					} else if (
						e.keyCode === 37 ||
						e.keyCode === 38 ||
						e.keyCode === 39 ||
						e.keyCode === 40 ||
						e.keyCode === 8 ||
						e.keyCode === 46) {

							
							
							if (e.keyCode === 8 || e.keyCode === 46) {
								currOri === 'across' ? nav.nextPrevNav(e, 37) : nav.nextPrevNav(e, 38);
							} else {
								nav.nextPrevNav(e);
						}
						
						e.preventDefault();
						return false;
					} else {
						
						// console.log('input keyup: '+solvedToggle);
						
						puzInit.checkAnswer(e);
					}
					
					e.preventDefault();
					return false;
				});
				
				// tab navigation handler setup
				puzzEl.delegate('input', 'keydown', function (e) {
					
					if (e.keyCode === 9) {
						
						mode = "setting ui";
						if (solvedToggle) solvedToggle = false;
						
						//puzInit.checkAnswer(e)
						nav.updateByEntry(e);
						
					} else {
						return true;
					}
					
					e.preventDefault();
					
				});
				
				// tab navigation handler setup
				puzzEl.delegate('input', 'click', function (e) {
					mode = "setting ui";
					if (solvedToggle) solvedToggle = false;

					// console.log('input click: '+solvedToggle);
					
					nav.updateByEntry(e);
					e.preventDefault();
					
				});


				// click/tab clues 'navigation' handler setup
				clues.delegate('li', 'click', function (e) {
					mode = 'setting ui';
					
					if (!e.keyCode) {
						nav.updateByNav(e);
					}
					e.preventDefault();
				});
				
				
				// highlight the letter in selected 'light' - better ux than making user highlight letter with second action
				puzzEl.delegate('#puzzle', 'click', function (e) {
					$(e.target).focus();
					$(e.target).select();
				});
				
				// DELETE FOR BG
				puzInit.calcCoords();
				
				// Puzzle clues added to DOM in calcCoords(), so now immediately put mouse focus on first clue
				clueLiEls = $('#puzzle-clues li');
				$('#' + currOri + ' li').eq(0).addClass('clues-active').focus();
				
				// DELETE FOR BG
				puzInit.buildTable();
				puzInit.buildEntries();
				
			},
			
			/*
			- Given beginning coordinates, calculate all coordinates for entries, puts them into entries array
				- Builds clue markup and puts screen focus on the first one
				*/
				calcCoords: function () {
					/*
					Calculate all puzzle entry coordinates, put into entries array
					*/
					for (var i = 0, p = entryCount; i < p; ++i) {
						// set up array of coordinates for each problem
						entries.push(i);
						entries[i] = [];
						
					for (var x = 0, j = puzz.data[i].answer.length; x < j; ++x) {
						entries[i].push(x);
						coords = puzz.data[i].orientation === 'across' ? "" + puzz.data[i].startx++ + "," + puzz.data[i].starty + "" : "" + puzz.data[i].startx + "," + puzz.data[i].starty++ + "";
						entries[i][x] = coords;
					}
					
					// while we're in here, add clues to DOM!
					$('#' + puzz.data[i].orientation).append('<li tabindex="1" data-position="' + i + '">' + puzz.data[i].position + ". " + puzz.data[i].clue + '</li>');
				}

				// Calculate rows/cols by finding max coords of each entry, then picking the highest
				for (var i = 0, p = entryCount; i < p; ++i) {
					for (var x = 0; x < entries[i].length; x++) {
						cols.push(entries[i][x].split(',')[0]);
						rows.push(entries[i][x].split(',')[1]);
					};
				}
				
				rows = Math.max.apply(Math, rows) + "";
				cols = Math.max.apply(Math, cols) + "";
				
			},
			
			/*
				Build the table markup
				- adds [data-coords] to each <td> cell
				*/
				
				buildTable: function () {
					
					for (var i = 1; i <= rows; ++i) {
						tbl.push("<tr>");
						for (var x = 1; x <= cols; ++x) {
							tbl.push('<td data-coords="' + x + ',' + i + '"></td>');
						};
					tbl.push("</tr>");
				};
				
				tbl.push("</table>");
				puzzEl.append(tbl.join(''));
			},
			
			/*
				Builds entries into table
				- Adds entry class(es) to <td> cells
				- Adds tabindexes to <inputs> 
				*/
			buildEntries: function () {
				var puzzCells = $('#puzzle td'),
					light,
					$groupedLights,
					hasOffset = false,
					positionOffset = entryCount - puzz.data[puzz.data.length - 1].position; // diff. between total ENTRIES and highest POSITIONS

					for (var x = 1, p = entryCount; x <= p; ++x) {
					var letters = puzz.data[x - 1].answer.split('');
					
					for (var i = 0; i < entries[x - 1].length; ++i) {
						light = $(puzzCells + '[data-coords="' + entries[x - 1][i] + '"]');
						
						// check if POSITION property of the entry on current go-round is same as previous. 
						// If so, it means there's an across & down entry for the position.
						// Therefore you need to subtract the offset when applying the entry class.
						if (x > 1) {
							if (puzz.data[x - 1].position === puzz.data[x - 2].position) {
								hasOffset = true;
							};
						}
						
						if ($(light).empty()) {
							$(light)
							.addClass('entry-' + (hasOffset ? x - positionOffset : x) + ' position-' + (x - 1))
								.append(`<input maxlength="1" val=""  type="text" tabindex="-1" />`);
						}
					};
					
				};

				// Put entry number in first 'light' of each entry, skipping it if already present
				for (var i = 1, p = entryCount; i < p; ++i) {
					$groupedLights = $('.entry-' + i);
					if (!$('.entry-' + i + ':eq(0) span').length) {
						$groupedLights.eq(0)
							.append('<span>' + puzz.data[i].position + '</span>');
						}
				}

				util.highlightEntry();
				util.highlightClue();
				$('.active').eq(0).focus();
				$('.active').eq(0).select();

			},
			

			/*
			- Checks current entry input group value against answer
				- If not complete, auto-selects next input for user
				*/
				checkAnswer: function (e) {
					
					var valToCheck, currVal;
					
					util.getActivePositionFromClassGroup($(e.target));
	
					valToCheck = puzz.data[activePosition].answer.toLowerCase();
					
					currVal = $('.position-' + activePosition + ' input')
					.map(function () {
						return $(this)
						.val()
						.toLowerCase();
					})
					.get()
					.join('');
					
					//console.log(currVal + " " + valToCheck);
					if (valToCheck === currVal) {
						$('.active')
						.addClass('done')
						.removeClass('active');
						
						$('.clues-active').addClass('clue-done');
						
						solved.push(valToCheck);
						solvedToggle = true;
						win(entryCount, solved.length)
						return;
					}
					
				currOri === 'across' ? nav.nextPrevNav(e, 39) : nav.nextPrevNav(e, 40);
				
				//z++;
				//console.log(z);
				//console.log('checkAnswer() solvedToggle: '+solvedToggle);
				
			}
			
			
		}; // end puzInit object
		
		
		var nav = {

			nextPrevNav: function (e, override) {
				// console.log(e.target);
				var len = $actives.length,
				struck = override ? override : e.which,
				el = $(e.target),
				p = el.parent(),
				ps = el.parents(),
				selector;
				
				util.getActivePositionFromClassGroup(el);
				util.highlightEntry();
				util.highlightClue();
				
				$('.current').removeClass('current');
				
				selector = '.position-' + activePosition + ' input';
				
				// move input focus/select to 'next' input
				switch (struck) {
					case 39:
						p
						.next()
						.find('input')
						.addClass('current')
						.select();
						
						break;
						
						case 37:
							p
							.prev()
							.find('input')
							.addClass('current')
							.select();

							break;

							case 40:
						ps
						.next('tr')
							.find(selector)
							.addClass('current')
							.select();
							
						break;
						
						case 38:
						ps
						.prev('tr')
						.find(selector)
						.addClass('current')
						.select();
						
						break;
						
						default:
							break;
						}
						
					},
					
					updateByNav: function (e) {
						var target;
						
				$('.clues-active').removeClass('clues-active');
				$('.active').removeClass('active');
				$('.current').removeClass('current');
				currIndex = 0;
				
				target = e.target;
				activePosition = $(e.target).data('position');
				
				util.highlightEntry();
				util.highlightClue();
				
				$('.active').eq(0).focus();
				$('.active').eq(0).select();
				
				
				// store orientation for 'smart' auto-selecting next input
				currOri = $('.clues-active').parent('ul').prop('id');
				
				activeClueIndex = $(clueLiEls).index(e.target);
				//console.log('updateByNav() activeClueIndex: '+activeClueIndex);
				
			},
			
			// Sets activePosition var and adds active class to current entry
			updateByEntry: function (e, next) {
				var classes, next, clue, e1Ori, e2Ori, e1Cell, e2Cell;
				
				if (e.keyCode === 9 || next) {
					// handle tabbing through problems, which keys off clues and requires different handling		
					activeClueIndex = activeClueIndex === clueLiEls.length - 1 ? 0 : ++activeClueIndex;
					
					$('.clues-active').removeClass('.clues-active');
					
					next = $(clueLiEls[activeClueIndex]);
					currOri = next.parent().prop('id');
					activePosition = $(next).data('position');
					
					// skips over already-solved problems
					util.getSkips(activeClueIndex);
					activePosition = $(clueLiEls[activeClueIndex]).data('position');
					
					
				} else {
					activeClueIndex = activeClueIndex === clueLiEls.length - 1 ? 0 : ++activeClueIndex;
					
					util.getActivePositionFromClassGroup(e.target);
					
					clue = $(clueLiEls + '[data-position=' + activePosition + ']');
					activeClueIndex = $(clueLiEls).index(clue);

					currOri = clue.parent().prop('id');
					
				}
				
				util.highlightEntry();
				util.highlightClue();
				
				$('.active').eq(0).focus();
				$('.active').eq(0).select();
				
			}
			
		}; // end nav object
		
		
		var util = {
			highlightEntry: function () {
				// this routine needs to be smarter because it doesn't need to fire every time, only
				// when activePosition changes
				$actives = $('.active');
				$actives.removeClass('active');
				$actives = $('.position-' + activePosition + ' input').addClass('active');

			},
			
			highlightClue: function () {
				var clue;
				$('.clues-active').removeClass('clues-active');
				$(clueLiEls + '[data-position=' + activePosition + ']').addClass('clues-active');
				
				if (mode === 'interacting') {
					clue = $(clueLiEls + '[data-position=' + activePosition + ']');
					activeClueIndex = $(clueLiEls).index(clue);
				};
				active_clue = document.querySelector('.clues-active').innerHTML
				document.querySelector('#clues_top').innerHTML = active_clue
				
			},
			
			getClasses: function (light, type) {
				if (!light.length) return false;

				var classes = $(light).prop('class').split(' '),
				classLen = classes.length,
				positions = [];
				
				// pluck out just the position classes
				for (var i = 0; i < classLen; ++i) {
					if (!classes[i].indexOf(type)) {
						positions.push(classes[i]);
					}
				}
				
				return positions;
			},
			
			getActivePositionFromClassGroup: function (el) {

				classes = util.getClasses($(el).parent(), 'position');

				if (classes.length > 1) {
					// get orientation for each reported position
					e1Ori = $(clueLiEls + '[data-position=' + classes[0].split('-')[1] + ']').parent().prop('id');
					e2Ori = $(clueLiEls + '[data-position=' + classes[1].split('-')[1] + ']').parent().prop('id');

					// test if clicked input is first in series. If so, and it intersects with
					// entry of opposite orientation, switch to select this one instead
					e1Cell = $('.position-' + classes[0].split('-')[1] + ' input').index(el);
					e2Cell = $('.position-' + classes[1].split('-')[1] + ' input').index(el);
					
					if (mode === "setting ui") {
						currOri = e1Cell === 0 ? e1Ori : e2Ori; // change orientation if cell clicked was first in a entry of opposite direction
					}
					
					if (e1Ori === currOri) {
						activePosition = classes[0].split('-')[1];
					} else if (e2Ori === currOri) {
						activePosition = classes[1].split('-')[1];
					}
				} else {
					activePosition = classes[0].split('-')[1];
				}
				
				// console.log('getActivePositionFromClassGroup activePosition: '+activePosition);
				
			},
			
			checkSolved: function (valToCheck) {
				for (var i = 0, s = solved.length; i < s; i++) {
					if (valToCheck === solved[i]) {
						return true;
					}
					
				}
			},
			
			getSkips: function (index) {
				
				if ($(clueLiEls[index]).hasClass('clue-done')) {
					activeClueIndex = index === clueLiEls.length - 1 ? 0 : ++activeClueIndex;
					util.getSkips(activeClueIndex);
				} else {
					return false;
				}
			}
			
		}; // end util object
		
		
		puzInit.init();
		
		
		$('table').click(() => {
			Clock.start();
			play.classList.remove('pactive')
			play.classList.add('tactive')
			
		})
		
		
		function randomSolve() {
			random_one = Math.floor(Math.random() * entryCount)
			t = puzz.data[random_one]
			
			random_letter = t.answer.split('')
			td = (document.querySelectorAll(`.position-${t.position}`))
			console.log(random_one)
			console.log(td)
			console.log(td.length)
			console.log(t)
			random_two = Math.floor(Math.random() * td.length)
			td[random_two].querySelector('input').value = random_letter[random_two]
			// td[random_two].querySelector('input').classList.add('done')  
			
		}

		function checkSolvedPuzzle() {
			for (var i = 0; i < entryCount; i++) {
				
				t = puzz.data[i].answer.toLowerCase().split('')
				td = (document.querySelectorAll(`.position-${i}`))
				
				for (var j = 0; j < t.length; j++) {
					
					td[j].querySelector('input').value = t[j]
					td[j].querySelector('input').classList.add('done');

				}
				
			}
			storeData()
			win()
			
			
		}

		function solveWord() {
			data = puzz.data[activePosition]
			ans = data.answer.toLowerCase().split('')
			console.log(ans)
			td = document.querySelectorAll(`.position-${data.position}`)
			for (var i = 0; i < td.length; i ++ )
			{
				inp = td[i].querySelector('input')
				inp.value = ans[i]
				inp.classList.add('done')
			}
			storeData()
		}
		
		td = document.querySelectorAll('td')
		input = document.querySelectorAll('input')
		// console.log(td.length)
		input.forEach(element => {
			element.addEventListener('change', () => {
				storeData()
			})
		});
		
		function storeData() {
			for (var i = 0; i < td.length; i++) {
				item = {}
				coords = (td[i].getAttribute('data-coords'))
				inp = td[i].querySelector('input')
				if (inp != null) {
					
					
					window.localStorage.setItem(`Puzzle-${user_head},${coords}`, inp.value)
					
					window.localStorage.setItem(`Puzzle-${user_head}-class,${coords}`, $(inp).attr('class'))
					
				}
				console.log('test')
			}
			
		}
		document.querySelector("#solve_all").onclick = checkSolvedPuzzle
		document.querySelector("#word_solve").onclick = solveWord
		document.querySelector("#solve_random").onclick = randomSolve
		
		var delay = 5000; //in milleseconds

		
		setTimeout(function(){ showNewsletterPopup(); }, delay);
		
  $('.popup-close').click(function(){
	  $('.newsletter-overlay').hide();
	  
      //when closed create a cookie to prevent popup to show again on refresh
      setCookie('newsletter-popup', 'popped', 30);
	});
	
	


function setCookie(cname,cvalue,exdays)
{
	var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires+"; path=/";
}

function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
		var c = jQuery.trim(ca[i]);
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

function showNewsletterPopup(){
	$('.newsletter-overlay').show();
	setCookie('newsletter-popup', 'popped', 50);
// 	  if( getCookie('newsletter-popup') == ""){
//   }
//   else{
// 	console.log("Newsletter popup blocked.");
//   }
}

		function loadData() {
			
			for (var i = 0; i < td.length; i++) {
				item = {}
				coords = (td[i].getAttribute('data-coords'))
				inp = td[i].querySelector('input')
				if (inp != null) {

					head = ($('#heading_name').html())
					// inp.value = window.localStorage.removeItem(`Puzzle-${head},${coords}`)
					inp.value = window.localStorage.getItem(`Puzzle-${user_head},${coords}`)
					// clas = window.localStorage.removeItem(`Puzzle-${head}-class,${coords}`)
					clas = window.localStorage.getItem(`Puzzle-${user_head}-class,${coords}`)
					
					if (clas.split(' '))
					{
						classes = (clas.split(' '))
						classes_length = classes.length
					}
					else
					{
						
						classes_length = 0
					}
					for (var j = 0; j < classes_length; j++) 
					{
						if (classes != ""){
							inp.classList.add(classes[j])
						}
					}
					// inp.value = window.localStorage.removeItem(`Puzzle-${head},${coords}`)
					
					
				}
			}
			
		}
		


		
		
		
		loadData()
		
	}
	// Check for Win
	function win(total, current) {
		if (total == current) {
			$('#congratz').addClass('iactive')
		}
		
	}
	


	$('.modal-close').click( ()=> {
		$('#congratz').removeClass('iactive')
	})

	

	info = document.querySelector('#info')
	info_menu = document.querySelector('#info_menu')
	
	info.addEventListener('click', () => {
	  info_menu.classList.toggle('iactive')
	})
	
	calendar = document.querySelector('#calendar')
	calendar_menu = document.querySelector('#calendar_menu')
	
	calendar.addEventListener('click', () => {
		calendar_menu.classList.toggle('iactive')
	})
	
	hint = document.querySelector('#hint')
	hint_menu = document.querySelector('#hint_menu')
	
	hint.addEventListener('click', () => {
		hint_menu.classList.toggle('iactive')
	})
	

	
})(jQuery);
