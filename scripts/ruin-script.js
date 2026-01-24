/// <reference path="ruin-buildings.js" />
/// <reference path="ruin-events.js" />
/// <reference path="../lib/jquery.3.7.0.js" />

//SET INITIAL VARIABLES
//--------------------------------
//Get HTML fields
var inputbox = document.getElementById("input_textbox");
var timeline = document.getElementById("timeline");
var energybar = document.getElementById("bar_energy");

var resourceDisplay = {
    light: document.getElementById("num-resource-light"),
    stone: document.getElementById("num-resource-stone"),
    wood: document.getElementById("num-resource-wood"),
    food: document.getElementById("num-resource-food"),
    gold: document.getElementById("num-resource-gold"),
    cultists: document.getElementById("num-resource-cultists")
}

var energyBarLoadTime = 5;

//Text parsing variables
var currentTextString = "";
var allowInput = true;
var textDelay = false;
var restrictedCommandInput = "";
var currentTextLength = 0;
var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
var timelineStack = [];

var commandList = ["pray", "study", "eat", "light", "take", "examine", "build", "gather", "divine"];

//Gamestate
const game = {
    turn: 0,
    resources: { scrap: 0, flesh: 0, hands: 0, script: 0, fervor: 0 },
    buildings: { },
    eventFlags: { },
    actionQueue: [],
};

//Resources
var resourceCap = 20;

var resources = {
    light: 0,
    stone: 0,
    wood: 0,
    food: 0,
    gold: 0,
    cultists: 0
}

var gatherableResources = {
    stone: { name: "stone", preReq: "quarry", delay: 1, amount: 1 },
    wood: { name: "wood", preReq: "lumberyard", delay: 1, amount: 1 },
    food: { name: "food", preReq: "storehouse", delay: 1, amount: 1 },
}

//Buildings
var buildings = {
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
}

var buildingDict = {
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

function parseInputText() {
    var currentString = document.getElementById("input_textbox").value;
    var cleanedString = removePunctuation(currentString.toLowerCase());

    if(restrictedCommandInput != "") {
        textCommand(restrictedCommandInput, firstWord(cleanedString));
        restrictedCommandInput = "";
        return;
    }

    var command = firstWord(cleanedString);
    var keyword_index = commandList.indexOf(command);
    if (keyword_index > -1) {
        textCommand(command, followingWords(cleanedString));
        console.log(followingWords(cleanedString));
    } else {
        updateTimeline(currentString, "text-god");
    }
}

//Timeline Management Functions

function updateTimeline(string, { style = "regular", asHtml = true } = {} ){
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
    if (toScroll) scrollToBottom(timeline);

    return p; //in case of future modification usage
}

function isScrollPositionAtBottom() {
    return timeline.scrollTop + timeline.clientHeight >= timeline.scrollHeight -2; //-2 to account for minor rounding differences
}


async function write(text, { style = "regular", delayCycles = 0, asHtml = true } = {}) {
    allowInput = false;

    if (delayCycles > 0) {
        
        //create ellipsis element
        const pEllipsis = document.createElement("p");
        pEllipsis.className = "regular";
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

        updateTimeline(text, { style: style, asHtml: asHtml});
        pEllipsis.remove();
    }
    else {
        updateTimeline(text, { style: style, asHtml: asHtml});
    }
       
    
    allowInput = true;
}

//Commands

async function textCommand(verb, object) {

    //BUILD
    if (verb == "build") {
        var targetBuilding = buildingDict[object[0]];

        if (object[0] == undefined) {
            await write("What do you want to build?");
            restrictedCommandInput = "build";
        }
        else if (targetBuilding != undefined) {
            //check if building has prerequisite and fulfilled
            if (targetBuilding.preReq != undefined && buildings[targetBuilding.preReq] <= 0) {
                await write("You need to build a " + textStyleKeyword(firstCaps(targetBuilding.preReq)) + " first.");
            } else if(targetBuilding = buildingAltar) {
                if(hasEnoughResources(targetBuilding.cost)) {
                    buildBuilding(targetBuilding);
                } else {
                    await write("You don't have enough resources to build a " + textStyleKeyword(firstCaps(targetBuilding.name)) + ".");
                }
            } else {
                if(targetBuilding.quota != undefined && buildings[targetBuilding.name] >= targetBuilding.quota) {
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
        var targetResource = gatherableResources[object[0]];

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
            if(!eventVarMysteriousCube && event1.played) {
                eventVarMysteriousCube = true;
                await write("You take the " + textStyleKeyword("mysterious cube") + ".");
                await playEvent(event2);
            } else {
                await write("You can't take that.");
            }
        }
        else if (object[0] == "stone" || stringArrayMatches(object, ["fragment", "fragments", "stones"])) {
            if(!eventVarStoneDebris && event2.played) {
                eventVarStoneDebris = true;

                addResource("stone", 1);
                await playEvent(event3);
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
            await write("With a flurry of light, buildings rise around you.", { style: "text-god" });
        }
        else {
            await write("A bright glow engulfs you briefly, then fizzles out.", { style: "text-god" });
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
        parseInputText();
        //updateTimeline(currentTextString, "regular");
        inputbox.value = "";
    }
});




//EVENTS AND BUTTONS (TO BE EXPANDED)
//--------------------------------
var loadBarEvent = new CustomEvent("loadBarEvent");


async function harvestEnergyBar() {
    addResource("light", 1);
    //updateTimeline("You have " + resourceLight + " light energy.");
    await write("You gained 1 light energy.");
    updateResourceDisplay();
}

async function loadBar(bar, seconds) {
    //harvest from bar
    if (bar.loaded == true) {
        await harvestEnergyBar();
        bar.classList.remove("clickable");
    }

    //sets the selected bar to load for n seconds
    var op = 0;
    var id = setInterval(frame, 100); // n minimum 20 for accurate background load. rewrite function to update value accurately according to time, while display updates in a recurring function similar to fade
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
            bar.style.boxShadow = "0px 0px 30px var(--color-light-alt)";
            bar.dispatchEvent(loadBarEvent);
            clearInterval(id);
        } else {
            op = Math.pow((Date.now() - startTime)/(endTime - startTime),2)
            bar.style.opacity = Math.ceil(op*1000)/1000;
            //document.getElementById("bar_percent").innerHTML = Math.ceil(op*100);
        }
    }
}

function autoLoad(bar, seconds) {
    bar.addEventListener("loadBarEvent", function (e) { setTimeout(loadBar, 500, bar, seconds) });
    loadBar(bar, seconds);
    bar.autoload = true;
}

energybar.addEventListener("click", function () {
    if (energybar.autoload == false && energybar.loaded == true) {
        loadBar(energybar, energyBarLoadTime);
    }
});


//STORY FUNCTIONS
async function playEvent(_EventID)
{
    //check if prerequisite event has already fired
    if(_EventID.preReq.played >= 1) {
        let prevTextLength = 0;
        for(let i = 0; i < _EventID.text.length; i++) {
            await write (_EventID.text[i], { delayCycles : Math.floor(prevTextLength / 50) + 1});
            prevTextLength = _EventID.text[i].length;
        }
        _EventID.played += 1;
        prevTextLength = 0;

        if(_EventID.onEventCompleteFunction) {
            _EventID.onEventCompleteFunction();
        }
    }
}

async function startGame()
{
    //playEvent(event1); //proper game start
    skipIntro(); //skips the long narrative intro
}

async function skipIntro()
{
    event1.played = 1;

    const truncatedLines = event1.text.slice(-2);
    for (const line of truncatedLines) {
        await write(line);
    }
}

//PROCESS FUNCTIONS
function buildBuilding(bd)
{
    for(_ResourceType in resources) {
        resourceCostSubtraction(_ResourceType, bd.cost[_ResourceType]);
    }

    buildings[bd.name] += 1;

    updateBuildingVariables();

    if(bd.onBuildFunction) {
        bd.onBuildFunction();
    }
}

function updateBuildingVariables()
{
    //update resource cap
    if(buildings.stockpile == 0) {
        resourceCap = 20;
    } else {
        resourceCap = buildings.stockpile * buildingDict.stockpile.properties.storage;
    }
}


//RESOURCE FUNCTIONS
function updateResourceDisplay()
{
    for(_ResourceType in resources) {
        resourceDisplay[_ResourceType].innerHTML = simplifyNumber(Math.floor(resources[_ResourceType]));
    }

}

function addResource(res, amount)
{
    resources[res] += amount;

    if (resources[res] > resourceCap) {
        resources[res] = resourceCap;
    } else if(resources[res] < 0) {
        resources[res] = 0;
    }

    updateResourceDisplay();
}

function resourceCostSubtraction(res, amount)
{
    resources[res] -= amount;

    if(resources[res] < 0) {
        resources[res] = 0;
    } else if (resources[res] > resourceCap) {
        resources[res] = resourceCap;
    }

    //does not update display values at this point
}

function hasEnoughResources(resourceList)
{
    for (_ResourceType in resourceList) {
        console.log(resourceList[_ResourceType] + " " + resources[_ResourceType]);
        if (resourceList[_ResourceType] > resources[_ResourceType]) {
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
    for (_BuildingType in buildings) {
        if (buildings[_BuildingType] > 0 && buildingDict[_BuildingType].production != undefined) {
            for (_ResourceType in resources) {
                if(newResources[_ResourceType] == undefined) {
                    newResources[_ResourceType] = buildingDict[_BuildingType].production[_ResourceType] * buildings[_BuildingType];
                } else {
                    newResources[_ResourceType] += buildingDict[_BuildingType].production[_ResourceType] * buildings[_BuildingType];
                }
            }
        }
    }

    for(_ResourceType in resources)
    {
        if (newResources[_ResourceType] != undefined) {

            resources[_ResourceType] += newResources[_ResourceType];

            if (resources[_ResourceType] > resourceCap) {
                resources[_ResourceType] = resourceCap;
            } else if(resources[_ResourceType] < 0) {
                resources[_ResourceType] = 0;
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
//loadBar(energybar, 0);
energybar.autoload = false;
inputbox.focus();

updateResourceDisplay();
updateResourcesInterval = setInterval(updateResources, 1000);

startGame();