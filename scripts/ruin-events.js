/// <reference path="ruin-buildings.js" />
/// <reference path="ruin-script.js" />
/// <reference path="../lib/jquery.3.7.0.js" />

//Event Variables
var eventVarMysteriousCube = false;
var eventVarStoneDebris = false;


//Events
var eventAlways = {
    id: 0,
    name: "Dummy Event",
    preReq: null,
    nextEvent: null,
    text: [
        "Dummy Text."
    ],
    choices: "",
    played: 1
}

eventAlways.preReq = eventAlways;
eventAlways.nextEvent = eventAlways;

var event1 = {
    id: 1,
    name: "Introduction",
    preReq: eventAlways,
    nextEvent: "",
    text: [
        "You burst through the narrow crack in the rocks and into the dark, scraping your arm against a jagged face of stone.",
        "Your eyes are momentarily blinded by the sudden darkness.",
        "Behind you, muffled shouts echo through the hidden entrance.",
        "A growl; a cry of alarm; a thump; silence.",
        "...",
        "Your companion doesn't make it through.",
        "...",
        "You slump down against the rocks, exhausted.",
        "You catch a breath.",
        "...",
        "And another.",
        "...",
        "...",
        "A long hallway stretches away into the blackness.",
        "Only a crack of pale light streams in from behind, getting dimmer by the second. It is dusk outside.",
        "Your eyes adjust to the gloom.",
        "The floor is strewn with dirt and rubble.",
        "A faint, pale light flickers in the distance.",
        "You get up and walk.",
        "...",
        "...",
        "The light comes from a small <strong>cube</strong> - perfect, beautiful, unassuming. It's lying on the ground.",
        "<i>Take it.</i>"
    ],
    choices: "",
    played: 0
}

var event2 = {
    id: 2,
    name: "Take Stones",
    preReq: event1,
    nextEvent: "",
    text: [
        "The dim shapes at the end of the hallway come into focus.",
        "A niche, and the shattered remains of a pedestal.",
        "Around it lie scattered fragments and broken <strong>stones</strong>."        
    ],
    choices: "",
    played: 0
}

var event3 = {
    id: 3,
    name: "Build Altar",
    preReq: event2,
    nextEvent: "",
    text: [
        "You pick up a few stones, feeling them over with your hands.",
        "Some faces are smooth and polished, others ragged - as if cracked apart by a great force.",
        "<i>Build an altar.</i>"        
    ],
    choices: "",
    played: 0
}

var event4 = {
    id: 4,
    name: "Altar Built",
    preReq: event3,
    nextEvent: "",
    text: [
        "You gather the stone fragments, carefully fitting them together with what remains of the broken pedestal.",
        "...",
        "A strange impulse seizes you: you set the cube on the makeshift altar.",
    ],
    choices: "",
    played: 0,
    onEventCompleteFunction: eventSpecialActivateLight
}

//Special Events
function eventSpecialActivateLight() {
    loadBar(energybar, energyBarLoadTime);
}