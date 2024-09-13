const colours = ["red", "yellow", "green", "blue"];
let gamePattern = [];
let playerPattern = [];
let index = 0;

const correctButton = new Audio("audio/correctButton.mp3");
const levelUp = new Audio("audio/levelup.mp3");
const wrongButton = new Audio("audio/wrongButton.mp3");
correctButton.volume = 0.05;
levelUp.volume = 0.05;
wrongButton.volume = 0.05;

const playButton = document.querySelector(".play");
playButton.addEventListener("click", createPattern);

const resetLeaderboardButton = document.querySelector(".reset-leaderboard");
resetLeaderboardButton.addEventListener("click", resetLeaderboard);

const score = document.querySelector(".score > h1");

fetchLeaderboardData();

function playAgain() {
    gamePattern = [];
    createPattern();
}

function buttonFlash(colour) {
    let buttonToFlash = document.querySelector("." + colour);
    buttonToFlash.style.background = "#fff";
    setTimeout(() => {buttonToFlash.style.background = colour}, 100);
}

function buttonClicked(event) {
    const colour = event.target.classList[0];
    buttonFlash(colour);
    checkPattern(playerPattern, colour);
}

function checkPattern(playerPattern, colour) {

    playerPattern.push(colour);

    for (let i=0; i<gamePattern.length; i++) 
    if (playerPattern[index] == gamePattern[index]) {
        correctButton.pause();
        correctButton.currentTime = 0;
        correctButton.play();
        if (index == gamePattern.length - 1) {
            removeEventListenerFromButton();
            setTimeout(() => {
                levelUp.play();
            }, 1000);
            setTimeout(() => {
                createPattern();
            }, 1000);
            return;
        } else {
            index++;
            inputPattern();
            return;
        }
    } else {
        removeEventListenerFromButton();
        wrongButton.play();
        score.innerText = `Wrong Colour! Final Score: ${gamePattern.length-1}`;
        submitScore("Alex", `${gamePattern.length-1}`);
        playButton.innerText = "Play Again";
        playButton.classList.remove("hide");
        playButton.addEventListener("click", playAgain);
        return;
    }
}

function removeEventListenerFromButton() {
    const buttons = document.querySelectorAll(".game-button");
    buttons.forEach(button => {
        button.removeEventListener("click", buttonClicked); // using buttonClicked() instead would have called the function immediately before any clicks
    });
}

// cannot use anonymous function as each anonymous function is distinct even 
// if they have the same code so therefore removeEventListener didn' work as
// it was removing the listener using different anonymous
// function instances. It wasn't the same function as the one originally added as the listener.                                         

function inputPattern() {
    const buttons = document.querySelectorAll(".game-button");
    buttons.forEach(button => {
        button.addEventListener("click", buttonClicked); // using buttonClicked() instead would have called the function immediately before any clicks
    });
}

function createPattern() {
    removeEventListenerFromButton();
    playButton.classList.add("hide");
    playButton.removeEventListener("click", createPattern);
    score.innerText = `Score: ${gamePattern.length}`;
    playerPattern = [];
    index = 0;
    randomColour = colours[Math.floor(Math.random() * colours.length)];
    gamePattern.push(randomColour);
    for (let i = 0; i < gamePattern.length; i++) {
        setTimeout(() => {
            buttonFlash(gamePattern[i]);
        }, (i + 1) * 800);
    }
    setTimeout(inputPattern
    , 800);
    return;
}

function submitScore(playerName, score) {
    fetch("/submit-score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ playerName, score })
    })
    .then(response => {
        if (response.ok) {
            // Fetch updated leaderboard data after successful submission
            fetchLeaderboardData();
        } else {
            console.error("Error submitting score", response.statusText);
        }
    })
    .catch(error => console.error("Error submitting score:", error));
}

function updateLeaderboard(leaderboardData) {
    const leaderboardElement = document.querySelector(".leaderboard");
    leaderboardElement.innerHTML = `<div class="title centre">Leaderboard</div>`; // Clear existing entries
    let position = 0;
    // Add new entries based on fetched data
    leaderboardData.forEach((entry, index) => {
        position++;
        const entryHtml = `
            <div class="entry">
                <div>${position}. ${entry.name} scored ${entry.score} in ${entry.year}</div>
            </div>`;
        leaderboardElement.innerHTML += entryHtml;
    });
}

function fetchLeaderboardData() {
    fetch("/leaderboard")
    .then(response => response.json())
    .then(leaderboardData => {
        updateLeaderboard(leaderboardData); // Pass fetched data to update leaderboard
    })
    .catch(error => console.error("Error fetching leaderboard:", error));
}

function resetLeaderboard() {
    fetch("/reset-leaderboard", {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            // Fetch updated leaderboard data after successful reset
            fetchLeaderboardData();
        } else {
            console.error("Error resetting leaderboard:", response.statusText);
        }
    })
    .catch(error => console.error("Error resetting leaderboard:", error));
}
