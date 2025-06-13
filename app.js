function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

document.getElementById('draw-btn').addEventListener('click', function () {
    document.getElementById("draw-btn").style.display = "none";

    const participantsInput = document.getElementById('participants').value;
    const numWinnersInput = parseInt(document.getElementById('numWinners').value, 10);

    if (!participantsInput.trim()) {
        alert("Veuillez entrer des participants.");
        document.getElementById("draw-btn").style.display = "";
        return;
    }

    const participants = participantsInput.split(/[\|\/]/).map(p => p.trim()).filter(p => p.length > 0);

    if (participants.length === 0) {
        alert("Veuillez entrer des participants valides.");
        document.getElementById("draw-btn").style.display = "";
        return;
    }

    if (isNaN(numWinnersInput) || numWinnersInput < 1) {
        alert("Veuillez entrer un nombre de gagnants valide.");
        document.getElementById("draw-btn").style.display = "";
        return;
    }

    if (numWinnersInput > participants.length) {
        alert("Le nombre de gagnants ne peut pas dépasser le nombre de participants.");
        document.getElementById("draw-btn").style.display = "";
        return;
    }

    shuffle(participants);

    const winnerDisplay = document.getElementById('winner');
    document.getElementById('result').style.display = "";

    let index = 0;
    const interval = setInterval(() => {
        winnerDisplay.textContent = participants[index];
        index = (index + 1) % participants.length;
    }, 100);

    setTimeout(() => {
        clearInterval(interval);

        const winners = participants.slice(0, numWinnersInput);
        winnerDisplay.textContent = winners.join(', ');
        document.getElementById("draw-btn").style.display = "";
    }, 3000); // Durée réduite à 3 secondes pour lisibilité
});
