// ruin-events.js
/// <reference path="ruin-buildings.js" />
/// <reference path="ruin-script.js" />
/// <reference path="ruin-script-helpers.js" />
/// <reference path="../lib/jquery.3.7.0.js" />

//Event Variables
let eventVarMysteriousCube = false;
let eventVarStoneDebris = false;

const events = {

    "misc.template.01": {
        id: "eventTemplate", //id
        eventType: "main",
        weight: 1,
        repeatable: false,
        cooldown: 2, //number of turns before repeating, for repeatable events
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            //to insert text
            //to also insert advanced functions e.g. requiring user inputs
            //since events only play one at a time and the game is turn-based, we can hold the player hostage
        ],
        outcomes: {
            //list of effects, will be parsed by an "effects handler"
            //can be different types e.g. changing values, set next event
            //need to put into buckets for different outcomes
        }
    },

    //MAIN QUEST EVENTS

    "intro.intro.01": {
        id: "intro.intro.01", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            L("You burst through the narrow crack in the rocks and into the dark, scraping your arm against a jagged face of stone."),
            L("Your eyes are momentarily blinded by the sudden darkness."),
            L("Behind you, muffled shouts echo through the hidden entrance."),
            L("A growl; a cry of alarm; a thump; silence."),
            dots(),
            L("Your companion doesn't make it through."),
            dots(),
            L("You slump down against the rocks, exhausted."),
            L("You catch a breath."),
            dots(),
            L("And another."),
            dots(),
            dots(),
            L("A long hallway stretches away into the blackness."),
            L("Only a crack of pale light streams in from behind, getting dimmer by the second. It is dusk outside."),
            L("Your eyes adjust to the gloom."),
            L("The floor is strewn with dirt and rubble."),
            L("A faint, pale light flickers in the distance."),
            L("You get up and walk."),
            dots(),
            dots(),
            L("The light comes from a small ^cube^ - perfect, beautiful, unassuming. It's lying on the ground."),
            whisper("Take it.")
        ],
        outcomes: {
            default: {
                effects: [
                    { type: "call", fnID: "effectActivateAndFocusTextBox" }
                ]
            }
        }
    },

    "intro.intro.02": {
        id: "intro.intro.02", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            L("You take the cube."),
            L("The dim shapes at the end of the hallway come into focus."),
            L("A niche, and the shattered remains of a pedestal."),
            L("Around it lie scattered fragments and ^scraps^ of stone.")
        ],
        outcomes: {
            default: {
                
            }
        }
    },

    "intro.intro.03": {
        id: "intro.intro.03", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            L("You pick up a few stones, feeling them over with your hands."),
            L("Some faces are smooth and polished, others ragged - as if cracked apart by a great force."),
            whisper("Build an altar.") 
        ],
        outcomes: {
            default: {
                
            }
        }
    },

    
    "intro.intro.04": {
        id: "intro.intro.04", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            L("You gather the stone fragments, carefully fitting them together with what remains of the broken pedestal."),
            dots(),
            L("A strange impulse seizes you: you set the cube on the makeshift altar."),
        ],
        outcomes: {
            default: {
                effects: [
                    { type: "call", fnID: "effectActivateCommuneButton" },
                    { type: "call", fnID: "effectQueueEvent", args: "intro.intro.05" },
                    { type: "call", fnID: "effectDeactivateTextBox" },
                ]
            }
        }
    },

    "intro.intro.05": {
        id: "intro.intro.05", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            ruin("AT LAST", {delayCycles: 0}),
            L("The words crash through your mind, a violent exclamation in the utter silence of the ruined hallway."),
            ruin("I AWAKEN!"),
            ruin("BUT I AM..."),
            ruin("REDUCED.", {delayCycles: 2}),
            dots(2, {textStyle: "ruin"}),
            ruin("WHERE ARE MY PEOPLE?"),
            L("You look around - only darkness surrounds you, dimly lit by the warm glow of the cube that rests upon the altar."),
            L("On the back wall of the niche, the dim light illuminates worn carvings."),
            L("Images of multitudes, kneeling before a many-limbed, many-faced figure; their palms upturned."),
            L("The cube's glow pulses again.")
        ],
        outcomes: {
            default: {
                effects: [
                    { type: "call", fnID: "effectQueueEvent", args: "intro.intro.06" }
                ]
            }
        },
        communeReloadTime: 21,
    },

    "intro.intro.06": {
        id: "intro.intro.06", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            ruin("YOU"),
            ruin("WILL YOU SERVE?", {delayCycles: 3})
        ],
        outcomes: {
            default: {
                effects: [
                    { type: "call", fnID: "effectQueueEvent", args: "intro.intro.07" }
                ]
            }
        },
        communeReloadTime: 6,
    },

    "intro.intro.07": {
        id: "intro.intro.07", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            L("You kneel and offer your hands upturned, imitating the figures in the carving."),
            ruin("YES. YOU WILL BUILD MY KINGDOM."),
            L("Abruptly, your mind is assaulted by a flurry of images -"),
            L("Towers, crumbled by the march of time", {delayCycles: 0}),
            L("A figure sprawled before an altar", {delayCycles: 0}),
            L("Glyphs etched in a ring of stone", {delayCycles: 0}),
            L("Smiths working the bellows of a dozen forges", {delayCycles: 0}),
            L("- and more, your mind scarcely comprehending image after image"),
            L("The frantic deluge slows, and you begin to see two images in your mind's eye:", {delayCycles: 5}),
            L("A rough assortment of ^scrap^ cobbled together into a ^workbench^, and a small ^hearth^ surrounded by crude implements."),
            ruin("BEGIN THE WORK.")
        ],
        outcomes: {
            default: {
                effects: [
                    { type: "call", fnID: "effectActivateAndFocusTextBox" }
                ]
            }
        }
    },

    "intro.intro.08": {
        id: "intro.intro.08", //id
        eventType: "intro",
        repeatable: false,
        tags: [], //tags for debugging and navigation
        preReq: {},
        sequence: [
            ruin("YOU"),
            ruin("WILL YOU SERVE?", {delayCycles: 3})
        ],
        outcomes: {
            default: {
                
            }
        }
    },


    //GENERIC COMMUNE EVENTS



};

//Generic lines from ruin when no event is played
const ruinLines = {

}

//Effect Functions
const effectFns = {
    
    effectActivateAndFocusTextBox: async () => {
        activateInputBox();
        inputbox.focus();
    },

    effectDeactivateTextBox: async () => {
        deactivateInputBox();
    },

    effectActivateCommuneButton: async () => {
        reloadButton();
    },

    effectEnableFleshConsumption: () => {
        game.utilityFlags.fleshConsumptionEnabled = 1;
    },

    effectQueueEvent: async (eventID) => {
        queueCommuneEvent(eventID);
    }

    //add other effect functions
};