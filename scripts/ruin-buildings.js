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
        notifyOnBuild: 0,
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
        showInUI: false,
        messages: {
            onSelfWork: [
                L("You search around for useful pieces of scrap."),
                L("You check the tunnels for scraps of wood or stone.")
            ],
            onAlreadyWorking: L("You are already gathering scrap."),
            onSuccessfulWork: [
                L("You find a pile of rough-cut stones, perfect for building."),
                L("You chance upon an old shelter in the ruins and take it apart for wood."),
                L("You manage to scavenge some rotten planks and building material."),
            ]
        },
    },

    //this building is kind of a dummy, it's just a tutorial prerequisite to build other buildings
    "buildingScrapForge": {
        name: "Scrapforge",
        plural: "",
        description: "Allows you to build buildings.",
        max: 1,
        workable: 1,
        cost: {
            scrap: 1,
        },
        messages: {

        },

    },

    "buildingHearth": {

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