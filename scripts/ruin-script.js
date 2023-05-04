//SET INITIAL VARIABLES
//--------------------------------
var inputbox = document.getElementById("input_textbox");
var timeline = document.getElementById("timeline");
var energybar = document.getElementById("bar_energy");

var currentTextString = "";
var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
var dummyResource = 0;
var commandList = ["pray", "study", "eat", "light"];



//COMMANDS, TIMELINE, TEXT PARSING
//--------------------------------

function singleCase(string) {
    string = removePunctuation(string.toLowerCase());
    string = string.charAt(0).toUpperCase() + string.slice(1);
    return (string + ".");
}

function removePunctuation(string) {
    return string
        .split('')
        .filter(function (letter) {
            return punctuation.indexOf(letter) === -1;
        })
        .join('');
}

function parseText() {
    var currentString = document.getElementById("input_textbox").value;
    var command = removePunctuation(currentString.toLowerCase());
    var keyword_index = commandList.indexOf(command);
    if (keyword_index > -1) {
        textCommand(command);
        updateTimeline(singleCase(command), "text-keyword-user");
    } else {
        updateTimeline(currentString, "text-god");
    }
}

function updateTimeline(string, style = "regular") {
    shouldScroll = timeline.scrollTop + timeline.clientHeight === timeline.scrollHeight;
    timeline.innerHTML = (timeline.innerHTML + "<p class=\"" + style + " fade-text\">" + string + "</p>");
    if (shouldScroll) {
        scrollToBottom(timeline);
    }
}

function textCommand(cmd) {
    if (cmd == "light") {
        if (energybar.autoload == false) {
            autoLoad(energybar, 30);
        }
    }
}




//UI, GRAPHICAL ELEMENTS
//--------------------------------

var fadeUpdate = setInterval(fadeText, 100); //Creates recurring check to fade-in new text

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

function fadeText() {
    // to optimise.
    text = document.getElementsByClassName("fade-text");
    if (text[0] === undefined) {
        return;
    } else {
        //using only array [0] gets around for-loop and also makes a surprisingly nice delay
        text[0].classList.remove("fade-text");
    }
}

inputbox.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        parseText();
        //updateTimeline(currentTextString, "regular");
        inputbox.value = "";
    }
});




//EVENTS AND BUTTONS (TO BE EXPANDED)
//--------------------------------
var loadBarEvent = new CustomEvent("loadBarEvent");


function harvestEnergyBar() {
    dummyResource += 1;
    updateTimeline("You have " + dummyResource + " light energy.");
}

function loadBar(bar, seconds) {
    //harvest from bar
    if (bar.loaded == true) {
        harvestEnergyBar();
        bar.classList.remove("clickable");
    }

    //sets the selected bar to load for n seconds
    var op = 0;
    var id = setInterval(frame, 50); // n minimum 20 for accurate background load. rewrite function to update value accurately according to time, while display updates in a recurring function similar to fade
    var startTime = Date.now();
    var endTime = startTime + (seconds*1000);

    //unload (to put in other function)
    bar.loaded = false;
    bar.style.boxShadow = "0px 0px 0px var(--color-light-alt)";

    function frame() {
        if (Date.now() > endTime) {
            bar.style.opacity = 100;
            document.getElementById("bar_percent").innerHTML = "";
            bar.loaded = true;
            bar.classList.add("clickable");
            bar.style.boxShadow = "0px 0px 15px var(--color-light-alt)";
            bar.dispatchEvent(loadBarEvent);
            clearInterval(id);
        } else {
            op = (Date.now() - startTime)/(endTime - startTime)
            bar.style.opacity = Math.ceil(op*1000)/1000;
            document.getElementById("bar_percent").innerHTML = Math.ceil(op*100);
        }
    }
}

function autoLoad(bar, seconds) {
    bar.addEventListener("loadBarEvent", function (e) { setTimeout(loadBar, 500, bar, seconds) });
    loadBar(bar, seconds);
    bar.autoload = true;
}

energybar.addEventListener("click", function () {
    if (energybar.autoload == false) {
        autoLoad(energybar, 30);
    }
});




//INITIALISATION
//--------------------------------
//loadBar(energybar, 0);
energybar.autoload = false;
inputbox.focus();
