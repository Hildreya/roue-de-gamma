function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

document.getElementById('draw-btn').addEventListener('click', function () {
    document.getElementById("draw-btn").style.display = "none";

    // Récupérer la chaîne des participants
    const participantsInput = document.getElementById('participants').value;

    // Vérifier que le champ n'est pas vide
    if (!participantsInput.trim()) {
        alert("Veuillez entrer des participants.");
        return;
    }

    // Séparer les participants par le caractère "|"
    const participants = participantsInput.split("|").map(p => p.trim()).filter(p => p.length > 0);

    if (participants.length === 0) {
        alert("Veuillez entrer des participants valides.");
        return;
    }

    shuffle(participants);
    console.log(participants);

    // Animation du tirage
    const winnerDisplay = document.getElementById('winner');
    document.getElementById('result').style.display = "";

    let index = 0;
    const interval = setInterval(() => {
        winnerDisplay.textContent = participants[index];
        index = (index + 1) % participants.length;
    }, 100);

    // Après 10 secondes, on stoppe l'animation et on affiche le gagnant
    setTimeout(() => {
        clearInterval(interval);
        const winner = participants[Math.floor(Math.random() * participants.length)];
        winnerDisplay.textContent = winner;
        document.getElementById("draw-btn").style.display = "";
    }, 10000);
});
