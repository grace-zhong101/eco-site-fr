let pollution = 0;
let energy = 100;
let achievements = [];
let inventory = [];

const encounterChance = 0.3;

const randomEncounters = [
{
    text: "You find a duck tangled in plastic.",
    choices: [
    {
        text: "help the duck",
        result: () => {
            pollution -=10;
            energy -= 10;
        }
    },
    {
        text: "Ignore it",
        result: () => {
            pollution += 15;
        }
    }
      

    ]
},
{
    text: "A volunteer offers free resuable water bottles.",
    choices: [
        {
            text: "take one",
            result: () => {
                inventory.push("reusable water bottle")
            }
        },
        {
            text: "no thanks",
            result: () =>{}
        }
    ]
},
{
    text: "A heatwave rolls through the city park",
    choices: [
        {
            text: "push forward",
            result: () => {
                energy -= 15;
            }
        },
        {
            text: "rest in shade",
            result: () => {
                energy -=5;
                pollution += 5;
            }
        }
    ]
}
];

const gameData = {
    start: {
        text: "You finish feeding the ducks. The air feels noraml... at least, for now",
        choices: [
            {
                text: "throw bread wrapper on the ground",
                next: "pollutionWrapper",
                effect: { pollution: 20, energy: 0}
            },
            {
                text: "Find a trash can",
                next: "Trashcan",
                effect: { pollution: -8, energy: -8}
            }
        ]
    },
    pollutionWrapper: {
        text: "You throw the wrapper on the ground. Somethig seems to change once it hits the ground, it's warmer",
        choices: [{ text: "continue", next: "escalation1"}]
    },
    Trashcan: {
        text: "You find a trashcan and throw the wrapper away. Yet it still feels awfully warm. Maybe you're just sweaty?",
        choices: [{ text: "continue", next: "escalation1"}]
    },
    escalation1: {
        text: "As you head home the air seems to still be a little humid, hopefully it cools down in a few days.",
        choices: [{ text: "continue", next: "escalation2"}]
    },
    escalation2: {
        text: "the next few days it still seems the temperature is getting warmer and warmer, then the news comes, the rising temperature has driven out the beavers and the dam keeping the lake reservoir. The city is now in a water deficit.",
        choices: [{ text: "continue", next: "escalation3"}]
    },
    escalation3: {
        text: "the sudden drop in water led the massive panic, water is indeed the most valuable thing in keeping you alive",
        choices: [{ text: "continue", next: "escalation4"}]
    },
    escalation4: {
        text: "the city is now in chaos, the ducks you once fed are dead, and the people have gotten more and more agitated working to flee but coming to find that other cities are facing the same drought.",
        choices: [{ text: "continue", next: "wastland"}]
    },
    wastland: {
        text: "you managed to survive longer than most, your throat burns, you might not make it. You're only hope is in the small supplies you have left",
        choices: [
            { text: "check supplies", next: "finalstop"}
        ]
    },
    finalstop: {
        text: "youe search your belongings...",
        choices: [
            {
                text: "continue",
                next: "nowater"
            }
        ]
    },
    nowater: {
        text: "fate has been decided there is no changing it now!",
        choices: [
            { 
                text: "reveal outcome",
                next: "ending"
            }
        ]
           
    
    },
    ending: {
        text: "",
        choices: []
    }
};

function typeText(text) {
    const story = document.getElementById("story");
    story.innerText = "";
    let i = 0;

    const interval = setInterval(() => {
        story.innerText += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(interval);
        }
    }, 23);
}

function updateUI() {
    pollution = Math.max(0, Math.min(100, pollution));
    energy = Math.max(0, Math.min(100, energy));
    document.getElementById("pollutionFill").style.width = pollution + "%";
    document.getElementById("energyFill").style.width = energy + "%";
    document.getElementById("inventory").innerText =
        "Inventory: " + (inventory.length ? inventory.join(",") : "Empty");
    saveGame();
}
function saveGame() {
    localStorage.setItem("pollution", pollution);
    localStorage.setItem("energy", energy);
}
function loadGame() {
    pollution = Number(localStorage.getItem("pollution")) || 0;
    energy = Number(localStorage.getItem("energy")) || 100;
}
function triggerRandomEncounter(nextScene) {
    const encounter =
        randomEncounters[Math.floor(Math.random() * randomEncounters.length)];
    document.getElementById("story").innerText = encounter.text;
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    encounter.choices.forEach(choice => {
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.onclick = () => {
            choice.result();
            updateUI();
            loadScene(nextScene);
        };
        choicesDiv.appendChild(button);
    });
}
function resolveending() {
    const hasBottle = inventory.includes("reusable water bottle");
    const scene = hasBottle ? "survival" : "death";
    loadScene(scene);
}
function loadScene(scene) {
    if (scene === "ending") {
        resolveending();
        return;
    }
    const current = gameData[scene];
    if (!current) return;
    typeText(current.text);
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    current.choices.forEach(choice =>{
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.onclick = () => {
            if (choice.effect) {
                pollution += choice.effect.pollution;
                energy += choice.effect.energy;
            }
            updateUI();
            if (Math.random() < encounterChance) {
                triggerRandomEncounter(choice.next);
            } else {
                loadScene(choice.next);
            }
        };
        choicesDiv.appendChild(button);
    });
}
gameData.survival = {
    text: "losing hope, suddenly, you find the reusable water bottle you collected a few months ago. The waters a bit strange, but it's good enough to survive.",
    choices: [{ text: "restart", next: "start"}]
};
gameData.death = {
    text: "you reach the crushing conclusion that theres no water left with your supplies",
    choices: [{ text: "restart", next: "start"}]
}

loadGame();
updateUI();
loadScene("start");