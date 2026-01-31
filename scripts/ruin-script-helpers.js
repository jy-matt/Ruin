// ruin-script-helpers.js
/// <reference path="ruin-events.js" />
/// <reference path="ruin-script.js" />
/// <reference path="ruin-buildings.js" />
/// <reference path="../lib/jquery.3.7.0.js" />

//Event Text Handling
//Base Line syntax - takes L('some text', { additional parameters }) and compiles them into one object 
const L = (t, opts = {}) => ({t, opts});

// Presets
const ruin = (t, opts = {}) => L(t, { textStyle: "ruin", ...opts }); //ruin voice
const whisper = (t, opts = {}) => L(t, { textStyle: "whisper", ...opts }); //whisper voice
const rL = (t, opts = {}) => L(t, { textStyle: "regular", ...opts }); //regular line styling - redundant?

// Saved Phrases
const dots = ( delay = 1, opts = {} ) => L("...", { delayCycles: delay, ...opts });

//Non-Text Event Lines
const E = (op, data = {}) => ({ op, ...data});

const WAIT_CMD = (cfg) => E("wait_cmd", cfg);
const WAIT_INPUT = (cfg) => E("wait_input", cfg);
const EFFECTS = (...effects) => E("effects", {effects});

//Effect Syntax: type, fn


//misc functions
function getRandomItem(arr) {
    if (arr.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random()*arr.length);
    return arr[randomIndex];
}

function massAddObjProps(mainObj, secondObj) {
    //only works if all props are numbers!
    for(prop in secondObj) {
        if(mainObj[prop]) {
            mainObj[prop] += secondObj[prop];
        } else {
            mainObj[prop] = secondObj[prop];
        }
        
    }
}

function randomRoll(percentageChance) {
    if(Math.random()*100 < percentageChance) return true;
    return false;
}