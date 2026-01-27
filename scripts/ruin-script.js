//ruin-script.js
/// <reference path="ruin-buildings.js" />
/// <reference path="ruin-events.js" />
/// <reference path="ruin-script-helpers.js" />
/// <reference path="../lib/jquery.3.7.0.js" />

//SET INITIAL VARIABLES
//--------------------------------
//Get HTML fields
var inputbox = document.getElementById("input_textbox");
var timeline = document.getElementById("timeline");
var squareButton = document.getElementById("squareButton");

var resourceDisplay = {
    scrap: document.getElementById("num-resource-scrap"),
    flesh: document.getElementById("num-resource-flesh"),
    script: document.getElementById("num-resource-script"),
    hands: document.getElementById("num-resource-hands"),
    fervor: document.getElementById("num-resource-fervor"),
}

let communeLoadTimeMin = 5;
let communeLoadTimeVar = 5;

//Text parsing variables
let currentTextString = "";
let allowInput = true;
let textDelay = false;
let restrictedCommandInput = "";
let currentTextLength = 0;
const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
let timelineStack = [];

let commandList = ["pray", "study", "eat", "light", "take", "examine", "build", "gather", "divine"];

//Gamestate
let game = {
    turn: 0,
    resources: { 
        scrap: 0,
        flesh: 0,
        script: 0,
        hands: 0,
        fervor: 0
    },
    buildings: {
        shrine: 0,
        //temple: 0,
        altar: 0,
        //lodge: 0,
        lumberyard: 0,
        lumbermill: 0,
        quarry: 0,
        stonecutter: 0,
        storehouse: 0,
        farm: 0,
        //mine: 0,
        //mausoleum: 0,
        //dungeon: 0
        stockpile: 0,
    },
    eventFlags: { },
    actionQueue: [],
    communeEventQueue: [],
    utilityFlags: {
        communeEventQueueEnabled: 1,
    },
};

//Resources
let resourceCap = 20;

const gatherableResources = {
    scrap: { name: "scrap", preReq: "quarry", delay: 1, amount: 1 },
    flesh: { name: "flesh", preReq: "lumberyard", delay: 1, amount: 1 }
}


const buildingDict = {
    shrine: buildingShrine,
    altar: buildingAltar,
    lumberyard: buildingLumberyard,
    lumbermill: buildingLumbermill,
    quarry: buildingQuarry,
    stonecutter: buildingStonecutter,
    storehouse: buildingStorehouse,
    farm: buildingFarm,
    stockpile: buildingStockpile
}


//COMMANDS, TIMELINE, TEXT PARSING
//--------------------------------



//Timeline Management Functions

function updateTimeline(string, { style = "regular", asHtml = false, alwaysScroll = false } = {} ){
    const p = document.createElement("p");
    p.className = `${style} fade-text`;
    
    // check if we want to pass the string as string or html
    if (asHtml) {
        p.innerHTML = string;
    }
    else {
        p.textContent = string;
    }

    const toScroll = isScrollPositionAtBottom();
    timeline.appendChild(p);
    if (toScroll || alwaysScroll) scrollToBottom(timeline);

    return p; //in case of future modification usage
}

function isScrollPositionAtBottom() {
    return timeline.scrollTop + timeline.clientHeight >= timeline.scrollHeight -2; //-2 to account for minor rounding differences
}


async function write(text, { style = "regular", delayCycles = 0, asHtml = false, alwaysScroll = false } = {}) {
    allowInput = false;

    if (delayCycles > 0) {
        
        //create ellipsis element
        const pEllipsis = document.createElement("p");
        pEllipsis.className = style;
        timeline.appendChild(pEllipsis);

        //animate ellipsis element
        for (let d = 0; d < delayCycles; d++) {
            pEllipsis.textContent = ".";
            await wait(500);
            pEllipsis.textContent = "..";
            await wait(500);
            pEllipsis.textContent = "...";
            await wait(500);
        }

        updateTimeline(text, { style: style, asHtml: asHtml, alwaysScroll: alwaysScroll});
        pEllipsis.remove();
    }
    else {
        updateTimeline(text, { style: style, asHtml: asHtml, alwaysScroll: alwaysScroll});
    }
       
    
    allowInput = true;
}

//Commands

async function textCommand(verb, object) {

    //BUILD
    if (verb == "build") {
        let targetBuilding = buildingDict[object[0]];

        if (object[0] == undefined) {
            await write("What do you want to build?");
            restrictedCommandInput = "build";
        }
        else if (targetBuilding != undefined) {
            //check if building has prerequisite and fulfilled
            if (targetBuilding.preReq != undefined && game.buildings[targetBuilding.preReq] <= 0) {
                await write("You need to build a " + textStyleKeyword(firstCaps(targetBuilding.preReq)) + " first.");
            } else if(targetBuilding == buildingAltar) {
                if(hasEnoughResources(targetBuilding.cost)) {
                    buildBuilding(targetBuilding);
                } else {
                    await write("You don't have enough resources to build a " + textStyleKeyword(firstCaps(targetBuilding.name)) + ".");
                }
            } else {
                if(targetBuilding.quota != undefined && game.buildings[targetBuilding.name] >= targetBuilding.quota) {
                    await write("You can't build any more " + textStyleKeyword(firstCaps(targetBuilding.plural)) + ".");
                } else if (hasEnoughResources(targetBuilding.cost)) {
                    buildBuilding(targetBuilding); //note - to pass parameter as key, need to use square bracket syntax
                    await write(textStyleKeyword(firstCaps(targetBuilding.name)) + " built.");
                } else {
                    await write("You don't have enough resources to build a " + textStyleKeyword(firstCaps(targetBuilding.name)) + ".");
                }
            }
            
        }
        else {
            await write("You can't build that.");
        }
    }

    //GATHER
    else if (verb == "gather") {
        let targetResource = gatherableResources[object[0]];

        if (object[0] == undefined) {
            await write("What do you want to gather?"); //to change syntax
            restrictedCommandInput = "gather";
        }
        else if (targetResource != undefined) {
            if (targetResource.preReq != undefined && buildings[targetResource.preReq] <= 0) {
                await write("You can't gather that.");
            } else {
                await write(`You gathered ${simplifyNumber(targetResource.amount)} ${targetResource.name}.`, { delayCycles: targetResource.delay });
                addResource(targetResource.name, targetResource.amount); //note - to pass parameter as key, need to use square bracket syntax
            }
        } else {
            await write("You can't gather that.");
        }
    }

    //TAKE
    else if (verb == "take") {
        if (object[0] == undefined)
        {
            await write("What do you want to take?");
            restrictedCommandInput = "take";
        }
        else if (object[0] == "cube" || stringArrayMatches(object, ["mysterious", "cube"])) //to add multi-word handling
        {
            if(!eventVarMysteriousCube) {
                eventVarMysteriousCube = true;
                await playEvent("intro.intro.02");
            } else {
                await write("You can't take that.");
            }
        }
        else if (object[0] == "scraps" || stringArrayMatches(object, ["fragment", "fragments", "stone", "stones", "scrap"])) {
            if(!eventVarStoneDebris) {
                eventVarStoneDebris = true;

                addResource("scrap", 1);
                await playEvent("intro.intro.03");
            } else {
                await write("You can't take that.");
            }
        } else {
            await write("You can't take that.");
        }
    }

    //CHEATS
    else if (verb == "divine") {
        if (object[0] == "village") {
            buildBuilding(buildingDict.shrine);
            buildBuilding(buildingDict.lumberyard);
            buildBuilding(buildingDict.lumbermill);
            buildBuilding(buildingDict.quarry);
            buildBuilding(buildingDict.stonecutter);
            buildBuilding(buildingDict.storehouse);
            buildBuilding(buildingDict.farm);
            await write("With a flurry of light, buildings rise around you.", { style: "textstyle-ruin" });
        }
        else {
            await write("A bright glow engulfs you briefly, then fizzles out.", { style: "textstyle-ruin" });
        }
    }
}


//UI, GRAPHICAL ELEMENTS
//--------------------------------

const fadeUpdate = setInterval(fadeText, 100); //Creates recurring check to fade-in new text

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
        parseInputText();
        //updateTimeline(currentTextString, "regular");
        inputbox.value = "";
    }
});

function deactivateInputBox() {
    inputbox.readOnly = true;
}

function activateInputBox() {
    inputbox.readOnly = false;
}

//Text Parsing and Stylisation

function singleCase(string) {
    string = removePunctuation(string.toLowerCase());
    string = string.charAt(0).toUpperCase() + string.slice(1);
    return (string + ".");
}

function firstCaps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removePunctuation(string) {
    return string
        .split('')
        .filter(function (letter) {
            return punctuation.indexOf(letter) === -1;
        })
        .join('');
}

function simplifyNumber(number) {
    if (number < 1000) {
        return number;
    } else if (number < 1000000) {
        if ((number / 1000).toFixed(1).slice(-1) == "0") {
            return ((number / 1000).toFixed(0) + "k");
        } else {
            return ((number / 1000).toFixed(1) + "k");
        }
    } else {
        if ((number / 1000000).toFixed(1).slice(-1) == "0") {
            return ((number / 1000000).toFixed(0) + "m");
        } else {
            return ((number / 1000000).toFixed(1) + "m");
        }
    }
}

function textStyleKeyword(string) {
    return ("<span class=\"text-keyword\">" + string + "</span>");
}

function firstWord(string) {
    return string.split(" ")[0];
}

function followingWords(string) {
    return string.split(" ").slice(1);
}

function stringArrayMatches(inputStringArray, referenceStringArray) {
    for(let i=0; i<referenceStringArray.length; i++) {
        if(inputStringArray.includes(referenceStringArray[i])) {
            return true;
        }
    }
    
    return false;
}

async function parseInputText() {
    const currentString = document.getElementById("input_textbox").value;
    const cleanedString = removePunctuation(currentString.toLowerCase());

    if(restrictedCommandInput != "") {
        const verb = restrictedCommandInput;
        restrictedCommandInput = "";
        await textCommand(verb, [firstWord(cleanedString)]);
        return;
    }

    let command = firstWord(cleanedString);
    let keyword_index = commandList.indexOf(command);

    if (keyword_index > -1) {
        await textCommand(command, followingWords(cleanedString));
        console.log(command, followingWords(cleanedString));
    } else {
        updateTimeline(currentString, "textstyle-ruin");
    }
}



// Structural helpers

// TextStyle Converter
function textStyleToClass(style) {
    const map = {
        regular: "textstyle-regular",
        ruin: "textstyle-ruin",
        whisper: "textstyle-whisper"
    };
    return map[style] ?? "textstyle-regular";
}


function normaliseEventString(text) {
    // This function checks for raw string input and converts to L() syntax
    if (typeof text === "string") return L(text);
    return text;
}


//Inline Markdown
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInlineMarkdown(text) {
    if (text == null) return "";

    let s = escapeHtml(text);

    // ^strong^
    s = s.replace(/\^([^^\n]+)\^/g, "<strong>$1</strong>");

    // *italics*
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

    return s;
}



//EVENTS AND BUTTONS (TO BE EXPANDED)
//--------------------------------

//EVENT FUNCTIONS
async function playEvent(_EventID)
{
    //at this point, event prerequisites should already have been validated
    //this function only executes the event sequence and handles all sub-events

    //get event from event const
    const event = getEvent(_EventID);
    if(!events[_EventID]) return;

    //automatically insert delay based on length of previous text
    let prevTextLength = 0;

    for(const eventEntry of event.sequence) {
        //currently, only play text lines. Need to add logic to handle interaction etc
        const entry = normaliseEventString(eventEntry);
        const html = parseInlineMarkdown(entry.t);

        const autoDelay = Math.max(Math.floor(prevTextLength / 50), 1); //compute autoDelay - 1 second per 50 characters, min 1 second
        

        await write(
            html, {
                asHtml: 1, //write as HTML since this is trusted and has been parsed with inline markdown
                ...entry.opts, //put in entry.opts first, then overwrite with properties that have specific logic
                delayCycles: entry.opts?.delayCycles ?? autoDelay, //set delayCycles: check if entry has a delayCycles option and use it; if not, use autoDelay.
                style: textStyleToClass(entry.opts?.textStyle ?? "regular"),
                alwaysScroll: true //always scroll event text! don't want player to miss stuff
            }
        );
        prevTextLength = entry.t.length;
    }
    //need to revise played logic
    //_EventID.played = (_EventID.played ?? 0) + 1; //increment event played counter (can be used as boolean or serial)
    prevTextLength = 0;

    concludeEvent(_EventID);
}

async function concludeEvent(_EventID) {
    await processEffects(events[_EventID].outcomes.default.effects);
    incrementEventPlayed(_EventID);
    //play default outcome (default outcome is ALWAYS played because this function is the 'cleanup' function post event; it does not know what choices were made during event interactions)
}

async function processEffects(effects = []) {
    for(const effect of effects) {
        switch(effect.type) { //switch - advanced if/else structure with parameter matching
            case "call": {
                const fn = effectFns[effect.fnID];
                if(!fn) {
                    console.warn(`Unknown effect function '${effect.fnID}'`, effect);
                    break;
                }
                await fn(effect.args ?? []);
                break;
            }
              

            default: {
                console.warn("Unknown effect type:", effect.type, effect);
                break;
            }
        }
    }
}

function populateEventFlags() {
    for(const eventID of Object.keys(events)) {
        if(game.eventFlags[eventID] === undefined) {
            game.eventFlags[eventID] = 0;
        }
    }
}

function incrementEventPlayed(_EventID) {
    game.eventFlags[_EventID] += 1;
}

function eventPlayed(_EventID) {
    return game.eventFlags[_EventID];
}

async function queueCommuneEvent(_EventID) {
    game.communeEventQueue.unshift(_EventID);
    console.log(game.communeEventQueue);
}

function getEvent(_EventID) {
    return events[_EventID];
}

//COMMUNE / BIG BUTTON
var loadBarEvent = new CustomEvent("loadBarEvent");


async function commune() {

    /*if(eventPlayed("intro.intro.05") == 0) {
        playEvent("intro.intro.05");
        reloadButton(21);
        return;
    }
    if(eventPlayed("intro.intro.06") == 0) {
        playEvent("intro.intro.06");
        reloadButton(6);
        return;
    }*/

    updateResources();
   
    //Event Logic
    if(game.utilityFlags.communeEventQueueEnabled && game.communeEventQueue[0] != null) {
        const eventID = game.communeEventQueue.shift();
        const reloadTime = events[eventID].communeReloadTime ?? communeLoadTimeMin;
        playEvent(eventID);
        reloadButton(reloadTime);
        return;
    }

    reloadButton(communeLoadTimeMin);
    

    return;
}

// cosmetic and mechanical functions to handle button loading and unloading
async function reloadButton(seconds = communeLoadTimeMin) {

    //sets the selected bar to load for n seconds
    var op = 0;
    var id = setInterval(frame, 20); // n minimum 20 for accurate background load. rewrite function to update value accurately according to time, while display updates in a recurring function similar to fade
    var startTime = Date.now();
    var endTime = startTime + (seconds*1000);

    function frame() {
        if (Date.now() > endTime) {
            squareButton.style.opacity = 100;
            document.getElementById("squareButton_percent").innerHTML = "";
            squareButton.loaded = true;
            squareButton.classList.add("clickable");
            squareButton.style.boxShadow = "0px 0px 40px var(--color-light-alt)";
            squareButton.dispatchEvent(loadBarEvent);
            clearInterval(id);
        } else {
            op = Math.pow((Date.now() - startTime)/(endTime - startTime),2)
            squareButton.style.opacity = Math.ceil(op*1000)/1000;
            //document.getElementById("bar_percent").innerHTML = Math.ceil(op*100);
        }
    }
}

async function unloadButton() {
    squareButton.classList.remove("clickable");
    squareButton.loaded = false;
    squareButton.style.opacity = 0;
    squareButton.style.boxShadow = "0px 0px 0px var(--color-light-alt)";
}

/*
function autoLoad(bar, seconds) {
    bar.addEventListener("loadBarEvent", function (e) { setTimeout(loadBar, 500, bar, seconds) });
    loadBar(bar, seconds);
    bar.autoload = true;
}
    */

squareButton.addEventListener("click", async function () {
    if (squareButton.loaded == true && allowInput) {
        unloadButton();
        await commune();
    }
});


//Gamestate Inititialisation Functions

async function startGame()
{
    populateEventFlags();
    console.log(game.eventFlags);
    deactivateInputBox();
    skipIntro2(); return; //skips the long narrative intro. comment to deactivate
    playEvent("intro.intro.01"); //proper game start
}

async function skipIntro()
{
    incrementEventPlayed("intro.intro.01");
    incrementEventPlayed("intro.intro.02");

    eventVarMysteriousCube = true;
    eventVarStoneDebris = true;
    addResource("scrap", 1);

    playEvent("intro.intro.03");
    /*
    const truncatedLines = event3.text.slice(-2);
    for (const line of truncatedLines) {
        await write(line, {asHtml: 1});
    }*/
    activateInputBox();
    inputbox.focus();
}

async function skipIntro2()
{
    incrementEventPlayed("intro.intro.01");
    incrementEventPlayed("intro.intro.02");
    incrementEventPlayed("intro.intro.03");
    incrementEventPlayed("intro.intro.04");
    incrementEventPlayed("intro.intro.05");

    eventVarMysteriousCube = true;
    eventVarStoneDebris = true;

    playEvent("intro.intro.06");
    reloadButton(6);
}

//PROCESS FUNCTIONS
function buildBuilding(bd)
{
    for(const _ResourceType in game.resources) {
        const resourceCost = Number(bd.cost?.[_ResourceType] ?? 0);
        resourceCostSubtraction(_ResourceType, resourceCost);
    }

    game.buildings[bd.name] += 1;

    updateBuildingVariables();
    updateResourceDisplay();

    if(bd.onBuildFunction) {
        bd.onBuildFunction();
    }
}

function updateBuildingVariables()
{
    //update resource cap
    if(game.buildings.stockpile == 0) {
        resourceCap = 20;
    } else {
        resourceCap = game.buildings.stockpile * buildingDict.stockpile.properties.storage;
    }
}


//RESOURCE FUNCTIONS
function updateResourceDisplay()
{
    for(const _ResourceType in game.resources) {
        resourceDisplay[_ResourceType].innerHTML = simplifyNumber(Math.floor(game.resources[_ResourceType]));
    }

}

function addResource(res, amount)
{
    game.resources[res] += amount;

    if (game.resources[res] > resourceCap) {
        game.resources[res] = resourceCap;
    } else if(game.resources[res] < 0) {
        game.resources[res] = 0;
    }

    updateResourceDisplay();
}

function resourceCostSubtraction(res, amount)
{
    //two checks to validate that resources are valid numbers, if not set to 0
    amount = Number(amount) || 0;
    game.resources[res] = Number(game.resources[res]) || 0;

    game.resources[res] -= amount;

    if(game.resources[res] < 0) {
        game.resources[res] = 0;
    } else if (game.resources[res] > resourceCap) {
        game.resources[res] = resourceCap;
    }

    //does not update display values at this point
}

function hasEnoughResources(resourceList)
{
    for (const _ResourceType in resourceList) {
        console.log(resourceList[_ResourceType] + " " + game.resources[_ResourceType]);
        if (resourceList[_ResourceType] > game.resources[_ResourceType]) {
            return false;
        }
    }
    return true;
}

function updateResources()
{
    var newResources = {};

    //Calculate resources gained from buildings
    //basic formula: building resource production * num buildings
    for (const _BuildingType in game.buildings) {
        if (game.buildings[_BuildingType] > 0 && buildingDict[_BuildingType].production != undefined) {
            for (const _ResourceType in game.resources) {
                if(newResources[_ResourceType] == undefined) {
                    newResources[_ResourceType] = buildingDict[_BuildingType].production[_ResourceType] * game.buildings[_BuildingType];
                } else {
                    newResources[_ResourceType] += buildingDict[_BuildingType].production[_ResourceType] * game.buildings[_BuildingType];
                }
            }
        }
    }

    for(_ResourceType in game.resources)
    {
        if (newResources[_ResourceType] != undefined) {

            game.resources[_ResourceType] += newResources[_ResourceType];

            if (game.resources[_ResourceType] > resourceCap) {
                game.resources[_ResourceType] = resourceCap;
            } else if(game.resources[_ResourceType] < 0) {
                game.resources[_ResourceType] = 0;
            }
        }
    }

    //Update display
    updateResourceDisplay();

}

//CULTIST FUNCTIONS
function cultistRecruit() {

}

function cultistKill() {

}

function cultistAssign() {

}

function cultistUnassign() {

}


//BACKEND FUNCTIONS
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//INITIALISATION
//--------------------------------
//loadBar(squareButton, 0);
squareButton.autoload = false;


updateResourceDisplay();

startGame();