var eventAlways = {
    id: 0,
    name: "Dummy Event",
    preReq: eventAlways,
    nextEvent: eventAlways,
    text: [
        "Dummy Text."
    ],
    choices: "",
    played: 1
}

var event1 = {
    id: 1,
    name: "Introduction",
    preReq: eventAlways,
    nextEvent: "",
    text: [
        "You walk through the doorway of the ruined temple alone.", //insert more description here
        "There's a <strong>mysterious cube</strong> lying on the ground. <i>(Take it.)</i>"
    ],
    choices: "",
    played: 0
}

var event2 = {
    id: 2,
    name: "Build Shrine",
    preReq: event1,
    nextEvent: "",
    text: [
        ""
    ],
    choices: "",
    played: 0
}