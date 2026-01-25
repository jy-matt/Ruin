/// <reference path="ruin-buildings.js" />
/// <reference path="ruin-script.js" />
/// <reference path="ruin-script-helpers.js" />
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
        L("You burst through the narrow crack in the rocks and into the dark, scraping your arm against a jagged face of stone."),
        L("Your eyes are momentarily blinded by the sudden darkness."),
        L("Behind you, muffled shouts echo through the hidden entrance."),
        L("A growl; a cry of alarm; a thump; silence."),
        DOTS(),
        L("Your companion doesn't make it through."),
        DOTS(),
        L("You slump down against the rocks, exhausted."),
        L("You catch a breath."),
        DOTS(),
        L("And another."),
        DOTS(),
        DOTS(),
        L("A long hallway stretches away into the blackness."),
        L("Only a crack of pale light streams in from behind, getting dimmer by the second. It is dusk outside."),
        L("Your eyes adjust to the gloom."),
        L("The floor is strewn with dirt and rubble."),
        L("A faint, pale light flickers in the distance."),
        L("You get up and walk."),
        DOTS(),
        DOTS(),
        L("The light comes from a small <strong>cube</strong> - perfect, beautiful, unassuming. It's lying on the ground."),
        whisper("Take it.")
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
        L("The dim shapes at the end of the hallway come into focus."),
        L("A niche, and the shattered remains of a pedestal."),
        L("Around it lie scattered fragments and <strong>scraps</strong> of stone.")
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
        L("You pick up a few stones, feeling them over with your hands."),
        L("Some faces are smooth and polished, others ragged - as if cracked apart by a great force."),
        whisper("Build an altar.") 
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
        L("You gather the stone fragments, carefully fitting them together with what remains of the broken pedestal."),
        DOTS(),
        L("A strange impulse seizes you: you set the cube on the makeshift altar."),
    ],
    choices: "",
    played: 0,
    onEventCompleteFunction: eventSpecialActivateButton
}

var event5 = {
    id: 5,
    name: "First Commune",
    preReq: event4,
    nextEvent: "",
    text: [
        ruin("AT LAST", {delayCycles: 0}),
        L("The words crash through your mind, a violent exclamation in the utter silence of the ruined hallway."),
        ruin("I AWAKEN!"),
        ruin("BUT I AM..."),
        ruin("REDUCED.", {delayCycles: 2}),
        DOTS(2, {textStyle: "ruin"}),
        ruin("WHERE ARE MY PEOPLE?"),
        L("You look around - only darkness surrounds you, dimly lit by the warm glow of the cube that rests upon the altar."),
        L("On the back wall of the niche, the dim light illuminates worn carvings."),
        L("Images of multitudes, kneeling before a many-limbed, many-faced figure; their palms upturned."),
        L("The cube's glow pulses again.")
    ],
    choices: "",
    played: 0
}

var event6 = {
    id: 6,
    name: "First Commune 2",
    preReq: event5,
    nextEvent: "",
    text: [
        ruin("YOU"),
        ruin("WILL YOU SERVE?", {delayCycles: 3})
    ],
    choices: "",
    played: 0
}

//Special Events
function eventSpecialActivateButton() {
    reloadButton();
}