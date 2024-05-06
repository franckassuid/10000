if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
}

  
document.addEventListener('DOMContentLoaded', function() {
    let nbJoueurs;
    let nomsJoueurs = [];
    const scores = [];
    const scoreTemporaire = [];
    const historiqueScores = [];

    document.getElementById('demarrer').addEventListener('click', function() {
        nbJoueurs = parseInt(document.getElementById('nb_joueurs').value, 10);
        if (isNaN(nbJoueurs) || nbJoueurs <= 0) {
            alert('Veuillez entrer un nombre valide de joueurs.');
            return;
        }

        let configuration = document.getElementById('configuration');

        configuration.style.display = 'none';
        for (let i = 0; i < nbJoueurs; i++) {
            const nom = prompt(`Entrez le nom du joueur ${i + 1}:`, `Joueur ${i + 1}`);
            nomsJoueurs.push(nom);
            scores.push(0);
            scoreTemporaire.push(0);
            historiqueScores.push([]);
        }
        initialiserJeu();
    });

    function initialiserJeu() {
        const joueursDiv = document.getElementById('joueurs');
        joueursDiv.innerHTML = '';
    
        for (let i = 0; i < nbJoueurs; i++) {
            const joueurDiv = document.createElement('div');
            joueurDiv.className = 'joueur';
            joueurDiv.innerHTML = `
                    <div class="score-total" id="total${i}">Total : 0</div>
                    <h3>${nomsJoueurs[i]}</h3>
                    <div class="score-temp" id="scoreTemp${i}">En attente: 0</div>
                    <div class="buttons-positive">
                        <button class="score-btn btn-positive" data-joueur="${i}" data-score="100">+100</button>
                        <button class="score-btn btn-positive" data-joueur="${i}" data-score="500">+500</button>
                        <button class="score-btn btn-positive" data-joueur="${i}" data-score="1000">+1000</button>
                    </div>
                    <div class="buttons-negative">
                        <button class="score-btn btn-negative" data-joueur="${i}" data-score="-100">-100</button>
                        <button class="score-btn btn-negative" data-joueur="${i}" data-score="-500">-500</button>
                        <button class="score-btn btn-negative" data-joueur="${i}" data-score="-1000">-1000</button>
                    </div>
                    <div class="validations">
                        <button id="validerScore${i}" class="validate-score-btn">Valider Score</button>
                        <button id="ajouterBarre${i}" class="barre-btn">|</button>
                    </div>
                    <div class="score-historique" id="historique${i}"></div>
            `;
            joueursDiv.appendChild(joueurDiv);
            setupScoreButtons(i);
        }
        // Ensure setupScoreButtons is called for each player
    }

    function setupScoreButtons(joueur) {
        // Attach event listeners to add and subtract score buttons
        document.querySelectorAll(`.joueur:nth-child(${joueur + 1}) .score-btn`).forEach(btn => {
            btn.addEventListener('click', function() {
                const scoreChange = parseInt(btn.dataset.score, 10);
                updateScoreTemporaire(joueur, scoreChange);
            });
        });
    
        // Attach event listener to the validate score button
        document.getElementById(`validerScore${joueur}`).addEventListener('click', function() {
            validerScore(joueur);
        });
    
        // Attach event listener to the add bar button
        document.getElementById(`ajouterBarre${joueur}`).addEventListener('click', function() {
            ajouterBarre(joueur);
        });
    }

    function updateScoreTemporaire(joueur, points) {
        scoreTemporaire[joueur] += points;
        scoreTemporaire[joueur] = Math.max(scoreTemporaire[joueur], 0); // Prevent negative temporary score
        document.getElementById(`scoreTemp${joueur}`).textContent = `En attente: ${scoreTemporaire[joueur]}`;
    }

    function validerScore(joueur) {
        // Vérifier si le score temporaire est inférieur à 200
        if (scoreTemporaire[joueur] < 200) {
            alert("Le score en attente doit être d'au moins 200 points pour être validé.");
            return; // Ne pas valider le score et sortir de la fonction
        }
    
        scores[joueur] += scoreTemporaire[joueur];
        historiqueScores[joueur].push({ score: scores[joueur], barres: 0, barré: false });
        scoreTemporaire[joueur] = 0;
        miseAJourAffichage(joueur);
    
        // Si nécessaire, vérifiez et barrez les scores doublons après la validation
        barrerScoresDoublons(joueur, scores[joueur]);
    }
    
    function ajouterBarre(joueur) {
    // Trouver le dernier score non barré si le dernier score est déjà barré
    let cibleScoreIndex = historiqueScores[joueur].length - 1;
    if (historiqueScores[joueur][cibleScoreIndex].barré) {
        for (let i = historiqueScores[joueur].length - 2; i >= 0; i--) {
            if (!historiqueScores[joueur][i].barré) {
                cibleScoreIndex = i;
                break;
            }
        }
    }

    // Ajouter une barre au score cible (dernier score non barré ou le dernier score si non barré)
    const cibleScore = historiqueScores[joueur][cibleScoreIndex];
    if (!cibleScore) return; // S'il n'y a pas de score, ne rien faire

    cibleScore.barres += 1;

    if (cibleScore.barres === 3) {
        cibleScore.barré = true; // Marquer le score comme barré

        // Trouver le score total à revenir après avoir barré le score actuel
        let scoreRevenir = 0; 
        for (let i = cibleScoreIndex - 1; i >= 0; i--) {
            if (!historiqueScores[joueur][i].barré) {
                scoreRevenir = historiqueScores[joueur][i].score;
                break;
            }
        }

        scores[joueur] = scoreRevenir;
    }

    miseAJourAffichage(joueur);
}

    

    function miseAJourAffichage(joueur) {
        document.getElementById(`scoreTemp${joueur}`).innerText = `En attente: ${scoreTemporaire[joueur]}`;
        document.getElementById(`total${joueur}`).innerText = `Total : ${scores[joueur]}`;
        const historiqueDiv = document.getElementById(`historique${joueur}`);
        historiqueDiv.innerHTML = historiqueScores[joueur].map(score => {
            let scoreText = score.score;
            if (score.barré) {
                scoreText = `<strike>${score.score}</strike>`;
            }
            return `${scoreText} ${'|'.repeat(score.barres)}`;
        }).join('<br>');
    }

    function barrerScoresDoublons(joueurActuel, nouveauScore) {
        nomsJoueurs.forEach((_, index) => {
            if (index !== joueurActuel) {
                historiqueScores[index].forEach(score => {
                    if (score.score === nouveauScore && !score.barré) {
                        score.barré = true;
                        // Mettre à jour le score total après avoir barré le score doublon
                        miseAJourScoreTotal(index);
                    }
                });
            }
        });
    }

    function miseAJourScoreTotal(joueur) {
        let scoreNonBarréLePlusRécent = scores[joueur]; // Commencez avec le score actuel en tant que fallback
    
        // Trouvez le dernier score non barré dans l'historique
        const scoresNonBarrés = historiqueScores[joueur].filter(score => !score.barré);
        if (scoresNonBarrés.length > 0) {
            scoreNonBarréLePlusRécent = scoresNonBarrés[scoresNonBarrés.length - 1].score;
        } else {
            // Si tous les scores sont barrés, vous pourriez choisir de réinitialiser le score
            scoreNonBarréLePlusRécent = 0; // Décommentez cette ligne si c'est le comportement désiré
        }
    
        // Mettre à jour le score total
        scores[joueur] = scoreNonBarréLePlusRécent;
        miseAJourAffichage(joueur);
    }
        
});
