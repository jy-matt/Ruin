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
const DOTS = ( delay = 1, opts = {} ) => L("...", { delayCycles: delay, ...opts });