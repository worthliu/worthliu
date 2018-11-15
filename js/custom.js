// templatemo 467 easy profile

// PRELOADER

$(window).load(function(){
    $('.preloader').delay(1000).fadeOut("slow"); // set duration in brackets    
});

// HOME BACKGROUND SLIDESHOW
$(function(){

	var bodyEl = document.body,
		openbtn = document.getElementById( 'open-button' ),
		closebtn = document.getElementById( 'close-button' ),
		isOpen = false;
	//
	function initEvents() {
		openbtn.addEventListener( 'click', toggleMenu );
		if( closebtn ) {
			closebtn.addEventListener( 'click', toggleMenu );
		}
	}
	//
	function toggleMenu() {
		if( isOpen ) {
			classie.remove( bodyEl, 'show-menu' );
		}
		else {
			classie.add( bodyEl, 'show-menu' );
		}
		isOpen = !isOpen;
	}

	function init() {
		initEvents();
	}
	//
	init();
	//
    jQuery(document).ready(function() {
		$('body').backstretch([
	 		 "images/bg-slide-1.jpg", 
	 		 "images/bg-slide-2.jpg",
			 "images/bg-slide-3.jpg"
	 			], 	{duration: 3200, fade: 1300});
		});
})


