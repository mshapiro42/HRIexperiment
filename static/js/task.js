/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// Task object to keep track of the current phase
var currentview;

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to

/******************************************
 * You will need to update the below code *
 *****************************************/

// All pages to be loaded
var pages = [
    "instruct-1.html",        // instructions
    "demographics.html",      // demographic information
    "check_video.html",       // checks the users audio and video
    "response_video.html",    // video looping page
    "questions.html",         // questions page
    "final_questions.html",   // final thoughts
    "check_question.html"     // check their understanding
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
    "instruct-1.html"
    
];

// This contains the path to the introduction video
var prefix = "/static/videos"
var cond = "/"
var video_conditions = [
  "Path1_3rdPerson",
  "Path1_2ndPerson",
  "Path2_3rdPerson",
  "Path2_2ndPerson"
];
var square_conditions=[];
switch(mycondition % 2){
  case 0:
    square_conditions = [0,1,2,3];
    break;
  case 1:
    square_conditions = [2,3,0,1];
    break;
}


var iter = 0; // This keeps track of which video in square_conditions we are currently showing and is updated in the Questions function
var response_vid = prefix + cond + video_conditions[square_conditions[iter]]; // This builds the path of the video we want to show currently
var question_label = video_conditions[square_conditions[iter]]; // This is just the label of the video so the database is more readable

/********************
 * HTML manipulation
 *
 * All HTML files in the templates directory are requested
 * from the server when the PsiTurk object is created above. We
 * need code to get those pages from the PsiTurk object and
 * insert them into the document.
 *
 ********************/


/*****************************
 * Demographic Questionnaire *
 *****************************/
// You will likely leave this unchanged.
var DemoQuestionnaire = function() {

    psiTurk.finishInstructions();

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        psiTurk.recordUnstructuredData("condition",mycondition);
	//alert(mycondition);

	psiTurk.recordTrialData({'phase':'demoquestionnaire', 'status':'submit'});

	$('input[name=age]').each( function(i, val) {
	    psiTurk.recordUnstructuredData(this.id, this.value);
	});

	var radio_groups = {}
	$(":radio").each(function(i, val){
	    radio_groups[this.name] = true;
	})

	    for(group in radio_groups){
	        psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
	    }

    };

    prompt_resubmit = function() {
	replaceBody(error_message);
	$("#resubmit").click(resubmit);
    };

    resubmit = function() {
	replaceBody("<h1>Trying to resubmit...</h1>");
	reprompt = setTimeout(prompt_resubmit, 10000);

	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt);

	    },
	    error: prompt_resubmit
	});
    };

    // Load the questionnaire snippet
    psiTurk.showPage('demographics.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'demoquestionnaire', 'status':'begin'});

    var r1, r2 = false;

    (function() {
	var empty = true;
	$('#age').keyup(function() {

            empty = false;
            $('#age').each(function() {
		if ($(this).val() == '' || $(this).val() < 18 || $(this).val() > 110) {
                    empty = true;
		}
            });

            if (empty) {
		 r1 = false;
		 checkenable();
            } else {
		r1 = true;
		checkenable();
            }
	});
    })()

    $("input[name=gender]").change(function(){
	r2=true;
	checkenable();
    });

    function checkenable(){
	if (r1 && r2){
	    $('#next').removeAttr('disabled');
	}
	else {
	    $('#next').prop('disabled', true);
	}
    }

    $("#next").click(function () {
    	record_responses();

	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt);

	    },
	    error: prompt_resubmit
	});

	currentview = new VidCheck();
    });
};


/***************
 * Video Check *
 ***************/
// You will likely leave this unchanged.
var VidCheck = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'submit'});
        //alert($("my_text").value());
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('check_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'vidcheck', 'status':'begin'});

    var r1, r2, r3 = false;

    function checkenable(){
        if (r1 && r2 && r3){
            $('#next').removeAttr('disabled');
        }
        else {
            $('#next').prop('disabled', true);
        }
    }

    $("input[name=seeword]").keyup(function(){
        var word = $("input[name=seeword]").val();
        word = word.toLowerCase();
        r1 = false;
        if (word.includes("amazing")) {
            r1=true;
        }
        checkenable();
    });

    $("input[name=hearword]").keyup(function(){
        var word = $("input[name=hearword]").val();
        word = word.toLowerCase();
        r2 = false;
        if (word.includes("forest")) {
            r2 = true;
        }
        checkenable();
    });

    $("#video1").on('ended', function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'video ended'});
        r3 = true;
        checkenable();
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new ResponseVideo();
    });
};


/******************
 * Response Video *
 *****************/
 // This is the video in which the robot issues its response
 // No questions are asked, and no input is required from the user
var ResponseVideo = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'submit'});
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('response_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'response_video', 'status':'begin'});


    $("#mp4src").attr("src", response_vid+".mp4")
    //$("#oggsrc").attr("src", response_vid+".ogg")

    $("#video3").load();


    $("#video3").on('ended', function() {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'video ended'});
        $('#next').removeAttr('disabled');
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'response_video', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new Questions();
    });
};


/**************
 * Questions  *
 **************/
// This asks the user some questions about the videos they just watched.
/*
Note: In a traditional between-subjects experiment this is where we would
stop and call the Check Question function, however in a within-subjects
experiment we want to repeat the Command, Response, and Question functions as
many times as elements in the square_conditions variable.
*/
var Questions = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    // Note that the phase is updated to reflect the new within-subjects assignment.
    record_responses = function() {
        psiTurk.recordTrialData({'phase':'questions_'+response_vid, 'status':'submit'});
        for(i=1; i<=3; i++){
            psiTurk.recordUnstructuredData(question_label +"_"+i,$("input[name='"+i+"']").val());
        }
    };

    prompt_resubmit = function() {
	replaceBody(error_message);
	$("#resubmit").click(resubmit);
    };

    resubmit = function() {
	replaceBody("<h1>Trying to resubmit...</h1>");
	reprompt = setTimeout(prompt_resubmit, 10000);

	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt);

	    },
	    error: prompt_resubmit
	});
    };

    // Load the questionnaire snippet
    psiTurk.showPage('questions.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'questions', 'status':'begin'});
    //alert("mycondition... "+mycondition+ " = 0? "+(mycondition==0));
    
    
    function checkenable(){
        allclicked=true;
        $(".not-clicked").each(function(i, val){
            allclicked=false;
        });
        if(allclicked){
        $('#next').removeAttr('disabled');
        }
    }

    $(".not-clicked").click(function(e){
        $(this).removeClass('not-clicked');
        $(this).addClass('clicked');
        checkenable();
    });

    $("#next").click(function () {
        record_responses();
        iter += 1;
        if (iter >= 4) {
            currentview = new FinalQuestions();
        }
        else{
            response_vid = prefix+cond+video_conditions[square_conditions[iter]];
            question_label = video_conditions[square_conditions[iter]];
            currentview = new ResponseVideo();
        }
    });
};


/********************
 * Final Questions   *
 ********************/
// Some final post-experiment questions about the experiment as a whole.
var FinalQuestions = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {
        psiTurk.recordUnstructuredData("Fname", $("textarea[name='Fname']").val());
        //psiTurk.recordUnstructuredData('final_thoughts_response',$("input[name='Fname']"));
        /*$('input[name=Fname]').each( function(i, val) {
	    psiTurk.recordUnstructuredData(this.id, this.value);
	});*/
        psiTurk.recordTrialData({'phase':'final_question', 'status':'submit'});

    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
	replaceBody("<h1>Trying to resubmit...</h1>");
	reprompt = setTimeout(prompt_resubmit, 10000);

	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt);
	    },
	    error: prompt_resubmit
	});
    };


    // Load the questionnaire snippet
    psiTurk.showPage('final_questions.html');

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
    $('#next').removeAttr('disabled');
    
   /* function checkenable(){
        allclicked=true;
        $(".not-clicked").each(function(i, val){
            allclicked=false;
        });
        if(allclicked){
       
        }
    }

    $(".not-clicked").click(function(e){
        $(this).removeClass('not-clicked');
        $(this).addClass('clicked');
        checkenable();
    });*/

    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'final_question', 'status':'begin'});

    $("#next").click(function () {
        record_responses();
        currentview = new CheckQuestion();
    });

};

/******************
 * Check Question *
 ******************/
// This question ensures that people are paying attention and are not bots
// Incorrect answers to this question mean we can disregard their submission
var CheckQuestion = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

	psiTurk.recordTrialData({'phase':'checkquestion', 'status':'submit'});

	var radio_groups = {}
	$(":radio").each(function(i, val){
	    radio_groups[this.name] = true;
	})

	    for(group in radio_groups){
	        psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
	    }

    };

    prompt_resubmit = function() {
	replaceBody(error_message);
	$("#resubmit").click(resubmit);
    };

    resubmit = function() {
	replaceBody("<h1>Trying to resubmit...</h1>");
	reprompt = setTimeout(prompt_resubmit, 10000);

	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt);

	    },
	    error: prompt_resubmit
	});
    };

    // Load the questionnaire snippet
    psiTurk.showPage('check_question.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'checkquestion', 'status':'begin'});

    $("input[name=check]").change(function(){
	$('#next').removeAttr('disabled');
    });


    $("#next").click(function () {
    	record_responses();
	    psiTurk.saveData({
                success: function(){
                    psiTurk.computeBonus('compute_bonus', function() {
                        psiTurk.completeHIT(); // when finished saving compute bonus, then quit
                    });
                },
                error: prompt_resubmit});
    });
};

/*******************
 * Run Task
 ******************/
 // You will likely leave this unchanged.
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new DemoQuestionnaire(); } // what you want to do when you are done with instructions
    );
});
