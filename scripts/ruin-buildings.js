//ruin-buildings.js
/// <reference path="ruin-events.js" />
/// <reference path="ruin-script.js" />
/// <reference path="ruin-script-helpers.js" />
/// <reference path="../lib/jquery.3.7.0.js" />


const buildings = {
    
    "buildingAltar": {
        name: "altar",
        plural: "altars",
        description: "",
        max: 1,
        cost: {
            scrap: 1,
        },
        announceBuilt: false,
        onBuildFunction: () => playEvent("intro.intro.04")
    },

    //this is a dummy building for the gather scrap action
    "buildingGatherScrap": {
        name: "dummy gatherscrap",
        plural: "dummy gatherscrap",
        description: "",
        max: 1,
        workable: 1,
        production: {
            scrap: 1
        },
        announceBuilt: false,
        showInUI: false,
        messages: {
            onSelfWork: [
                L("You search around for useful pieces of scrap."),
                L("You check the tunnels for scraps of wood or stone.")
            ],
            onAlreadyWorking: L("You are already gathering scrap."),
            onSuccessfulSelfWork: [
                L("You find a pile of rough-cut stones, perfect for building."),
                L("You chance upon an old campsite in the ruins and take it apart for scrap."),
                L("You manage to scavenge some rotten planks and building material."),
                L("You find the remains of an old expedition and salvage some equipment.")
            ]
        },
    },

    //this building is kind of a dummy, it's just a tutorial prerequisite to build other buildings
    "buildingScrapForge": {
        name: "scrapforge",
        plural: "scrapforges",
        description: "Allows you to build buildings.",
        max: 1,
        workable: 1,
        cost: {
            scrap: 1,
        },
        announceBuilt: true,
        messages: {

        },
    },

    "buildingHearth": {
        name: "hearth",
        plural: "hearths",
        description: "",
        max: 1,
        workable: 1,
        production: {
            scrap: -1,
            flesh: 2
        },
        cost: {
            scrap: 5,
        },
        showInUI: true,
        announceBuilt: true,
        messages: {
            onBuilt: L("A ring of stones, fragments of wood, a spark - your ^Hearth^ blazes to life."),
            onSelfWork: [
                L("You head towards the hearth."),
                L("You sit down at the hearth and begin preparing flesh."),
                L("The hearth burns as you stoke the fire.")
            ],
            onAlreadyWorking: L("You are already working the hearth."),
            onSuccessfulSelfWork: [
                L("A chunk of flesh sizzles over the fire."),
                L("You roast some flesh over the hearth."),
                L("You're not sure where this hunk of flesh is from, but you roast it anyway."),
                L("You smoke some strips of flesh over the fire.")
            ]
        },
        onBuildFunction: () => effectFns.effectEnableFleshConsumption(),
    },

    "buildingCrusher": {
        name: "crusher",
        plural: "crushers",
        description: "",
        max: 1,
        workable: 1,
        production: {
            scrap: 2
        },
        cost: {
            scrap: 5,
        },
        showInUI: true,
        announceBuilt: true,
        messages: {
            onBuilt: L("A simple yet powerful mechanism of stone and metal, the ^Crusher^ lets you turn more things into scrap."),
            onSelfWork: [
                L("It's crushing time."),
                L("You drag a large hunk of metal towards the crusher."),
                L("The crusher yawns in anticipation."),
                L("You head towards the crusher."),
                L("A pile of debris sits in front of the crusher, waiting.")
            ],
            onAlreadyWorking: L("You are already working the crusher."),
            onSuccessfulSelfWork: [
                L("You stack the newly crushed scraps near the stockpile."),
                L("The crusher has done well today."),
                L("Scraps of metal and stone are all that remain of the salvage."),
                L("Your hands are covered in scrapes and cuts, but the crusher's work is done.")
            ]
        },
    }

}

var buildingNone = {

}

var buildingShrine = {
    name: "shrine",
    plural: "shrines",
    description: "",
    quota: 1,
    cost: {
        light: 0,
        stone: 1,
        wood: 0,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingAltar = {
    name: "altar",
    plural: "altars",
    description: "",
    quota: 1,
    cost: {
        scrap: 1
    },
    notifyOnBuild: 0,
    onBuildFunction: () => playEvent("intro.intro.04")
}

var buildingLumberyard = {
    name: "lumberyard",
    plural: "lumberyards",
    description: "Allows you to gather wood.",
    quota: 1,
    cost: {
        light: 0,
        stone: 0,
        wood: 0,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingLumbermill = {
    name: "lumbermill",
    plural: "lumbermills",
    description: "",
    preReq: "lumberyard",
    quota: 1,
    cost: {
        light: 0,
        stone: 0,
        wood: 5,
        food: 0,
        gold: 0,
        cultists: 0
    },
    production: {
        light: 0,
        stone: 0,
        wood: 1,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingQuarry = {
    name: "quarry",
    plural: "quarries",
    description: "Allows you to gather stone.",
    quota: 1,
    cost: {
        light: 0,
        stone: 0,
        wood: 5,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingStonecutter = {
    name: "stonecutter",
    plural: "stonecutters",
    description: "",
    preReq: "quarry",
    quota: 1,
    cost: {
        light: 0,
        stone: 0,
        wood: 5,
        food: 0,
        gold: 0,
        cultists: 0
    },
    production: {
        light: 0,
        stone: 1,
        wood: 0,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingStorehouse = {
    name: "storehouse",
    plural: "storehouses",
    description: "Allows you to gather food.",
    quota: 1,
    cost: {
        light: 0,
        stone: 5,
        wood: 5,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingFarm = {
    name: "farm",
    plural: "farms",
    description: "",
    preReq: "storehouse",
    quota: 1,
    cost: {
        light: 0,
        stone: 10,
        wood: 10,
        food: 0,
        gold: 0,
        cultists: 0
    },
    production: {
        light: 0,
        stone: 0,
        wood: 0,
        food: 1,
        gold: 0,
        cultists: 0
    }
}

var buildingStockpile = {
    name: "stockpile",
    plural: "stockpiles",
    description: "Increases the amount of resources you can store.",
    quota: 8,
    cost: {
        light: 0,
        stone: 20,
        wood: 20,
        food: 0,
        gold: 5,
        cultists: 0
    },
    properties: {
        storage: 60
    }
}