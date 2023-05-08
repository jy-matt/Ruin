var buildingNone = {

}

var buildingShrine = {
    name: "shrine",
    description: "",
    cost: {
        light: 0,
        stone: 1,
        wood: 0,
        food: 0,
        gold: 0,
        cultists: 0
    },
    production: {
        light: 0,
        stone: 0,
        wood: 0,
        food: 0,
        gold: 0,
        cultists: 0
    }
}

var buildingAltar = {
    name: "altar",
    description: "",
    cost: {
        light: 0,
        stone: 50,
        wood: 10,
        food: 0,
        gold: 0,
        cultists: 0
    },
    production: {
        light: 0,
        stone: 0,
        wood: 0,
        food: 0,
        gold: 1,
        cultists: 0
    }
}

var buildingLumberyard = {
    name: "lumberyard",
    description: "Allows you to gather wood.",
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
    description: "",
    preReq: "lumberyard",
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
    description: "Allows you to gather stone.",
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
    description: "",
    preReq: "quarry",
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
    description: "",
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
    description: "",
    preReq: "storehouse",
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