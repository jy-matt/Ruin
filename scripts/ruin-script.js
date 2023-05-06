/// <reference path="ruin-buildings.js" />

//SET INITIAL VARIABLES
//--------------------------------
var inputbox = document.getElementById("input_textbox");
var timeline = document.getElementById("timeline");
var energybar = document.getElementById("bar_energy");

var resourceDisplayLight = document.getElementById("num-resource-light");
var resourceDisplayWood = document.getElementById("num-resource-wood");
var resourceDisplayStone = document.getElementById("num-resource-stone");
var resourceDisplayFood = document.getElementById("num-resource-food");
var resourceDisplayCultists = document.getElementById("num-resource-cultists");

var energyBarLoadTime = 5;

var currentTextString = "";
var allowInput = true;
var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
var commandList = ["pray", "study", "eat", "light", "take", "examine", "build"];

var resourceLight = 0;
var resourceStone = 0;
var resourceWood = 0;
var resourceFood = 0;
var resourceGold = 0;
var resourceCultists = 0;

var resources = {
    light: 0,
    stone: 2,
    wood: 0,
    food: 0,
    gold: 0,
    cultists: 0
}

var buildings = {
    shrine: 0,
    temple: 0,
    altar: 0,
    farm: 0,
    lodge: 0,
    quarry: 0,
    mine: 0,
    mausoleum: 0,
    dungeon: 0
}

var buildingDict = {
    shrine: buildingShrine
}


//COMMANDS, TIMELINE, TEXT PARSING
//--------------------------------

//Text Parsing

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

function firstWord(string)
{
    return string.split(" ")[0];
}

function secondWord(string)
{
    return string.split(" ")[1];
}

function parseText() {
    var currentString = document.getElementById("input_textbox").value;
    var cleanedString = removePunctuation(currentString.toLowerCase());
    var command = firstWord(cleanedString);
    var keyword_index = commandList.indexOf(command);
    if (keyword_index > -1) {
        textCommand(command, secondWord(cleanedString));
        console.log(secondWord(cleanedString));
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

function delayedUpdateTimeline(string, delay=1, style='regular') {
    //delay is counted in cycles of ... (each cycle is 1.5 seconds)
    allowInput = false;
    
    timeline.innerHTML = (timeline.innerHTML + "<p class=\"regular\" id=\"ellipsis\">.</p>");
    var ellipsisHTML = document.getElementById("ellipsis");
    var ellipsisInterval = setInterval(ellipsisUpdate, 500);
    var ellipsisCount = 0;

    function ellipsisUpdate()
    {
        if(ellipsisCount>=delay)
        {
            ellipsisHTML.remove();
            //ellipsisHTML.innerHTML = string;
            //ellipsisHTML.removeAttribute("id");
            updateTimeline(string, style);
            clearInterval(ellipsisInterval);
            allowInput = true;
        }

        if(ellipsisHTML.innerHTML == "")
        {
            ellipsisHTML.innerHTML = ".";
        }
        else if(ellipsisHTML.innerHTML == ".")
        {
            ellipsisHTML.innerHTML = "..";
        }
        else if(ellipsisHTML.innerHTML == "..")
        {
            ellipsisHTML.innerHTML = "...";
            ellipsisCount += 1;
        }
        else if(ellipsisHTML.innerHTML == "...")
        {
            ellipsisHTML.innerHTML = ".";
        }

    }
}

//Commands

function textCommand(cmd, param) {
    if (cmd == "light") {
        if (energybar.autoload == false) {
            loadBar(energybar, energyBarLoadTime);
        }
        updateTimeline(singleCase(cmd), "text-keyword-user");
    }
    else if (cmd == "build") {
        if (param == undefined) {
            updateTimeline("What would you like to build?");
        }
        else if (buildingDict[param] != undefined) {
            buildBuilding(buildingDict[param]); //note - to pass parameter as key, need to use square bracket syntax
        }
        else {
            updateTimeline("Can't build that.");
        }
    }
}


//UI, GRAPHICAL ELEMENTS
//--------------------------------

var fadeUpdate = setInterval(fadeText, 100); //Creates recurring check to fade-in new text

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}


//Fade text is done via a css trick - the javascript will remove the fade-text class after a set interval, however, since the paragraph style has a transition setting for opacity, the text will fade in with a delay.
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
    if (event.code === "Enter" && allowInput == true) {
        parseText();
        //updateTimeline(currentTextString, "regular");
        inputbox.value = "";
    }
});




//EVENTS AND BUTTONS (TO BE EXPANDED)
//--------------------------------
var loadBarEvent = new CustomEvent("loadBarEvent");


function harvestEnergyBar() {
    addResource(light, 1);
    //updateTimeline("You have " + resourceLight + " light energy.");
    updateTimeline("You gained 1 light energy.");
    updateResources();
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
        loadBar(energybar, energyBarLoadTime);
    }
});


//STORY FUNCTIONS


//PROCESS FUNCTIONS
function buildBuilding(bd)
{
    addResource("stone", -bd["stone"]);
    buildings[bd.name] += 1;
}


//RESOURCE FUNCTIONS
function updateResources()
{
    resourceDisplayLight.innerHTML = resources.light;
    resourceDisplayWood.innerHTML = resources.wood;
    resourceDisplayStone.innerHTML = resources.stone;
    resourceDisplayFood.innerHTML = resources.food;
    resourceDisplayCultists.innerHTML = resources.cultists;
}

function addResource(res, amount)
{
    resources[res] += amount;
    if(resources[res] < 0) resources[res] = 0;

    updateResources();
}

//INITIALISATION
//--------------------------------
//loadBar(energybar, 0);
energybar.autoload = false;
inputbox.focus();
updateResources();
updateTimeline("You walk through the doorway of the ruined temple alone. There's a <strong>mysterious cube</strong> lying on the pedestal.");