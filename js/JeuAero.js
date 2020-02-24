var JeuAero = function(nomJoueurEntre)
{
    var TOUCHE_GAUCHE = 37;
    var TOUCHE_HAUT = 38;
    var TOUCHE_DROITE = 39;
    var TOUCHE_BAS = 40;
    var NOMBRE_PIECES = 10;
    var TICKER = 60;
    var INTENSITE_PESANTEUR = 9.81;
    var TIMER = 20;
    var REPARTITION_PIECES_X = 5000;
    var REPARTITION_PIECES_Y = 500;

    var vitesseYJoueur;
    var arrierePlan;
    var vitesseArrierePlan;
    var scene;
    var piece;
    var joueur;
    var testChargement;
    var touches = {};
    var affichageTimer;
    var tempsRestant;
    var nomJoueur;
    var tableauObstacles = [];

    function initialiser()
    {
        var ecranJeu = document.querySelector("#ecran-jeu");
        scene = new createjs.Stage(ecranJeu);
        createjs.Ticker.setFPS(TICKER);

        vitesseArrierePlan = 0;
        vitesseYJoueur = 0;

        affichageTimer = new createjs.Text("Temps restant: ", "30px Arial", "#000000");
        affichageTimer.x = 25;
        affichageTimer.y = 60;

        var tempsDebut = (new Date()).getTime();
        var tempsEnLair = tempsDebut;

        nomJoueur = new createjs.Text("Joueur: ", "30px Arial", "#000000");
        nomJoueur.x = 25;
        nomJoueur.y = 20;

        var piecesRestantes = NOMBRE_PIECES;
        affichagePoints = new createjs.Text("Points: ", "30px Arial", "#000000");
        affichagePoints.x = 25;
        affichagePoints.y = 100;

        //Rafraichit la scène
        createjs.Ticker.addEventListener("tick", rafraichir);

        function rafraichir(evenementTick)
        {
            //Calcul du temps écoulé
            tempsActuel = (new Date()).getTime();
            var temps = (tempsActuel-tempsEnLair)/1000;

            //Calcul du timer
            tempsRestant =TIMER-((tempsActuel-tempsDebut)/1000);
            if(tempsRestant <= 0)
            {
                createjs.Ticker.removeEventListener("tick", rafraichir);
                window.location = "#fin-partie-perdue";
            }
            else
            {
                //console.log(tempsRestant);
                affichageTimer.set({text: "Temps restant: "+Math.floor(tempsRestant) + "s"});
            }

            //Appliquer la gravité
            if(!joueur.estAuSol())
            {
                vitesseYJoueur += 0.5 * INTENSITE_PESANTEUR * (temps*temps);
                //console.log("VITESSE JOUEUR EN Y : " + vitesseYJoueur);
                joueur.tomber(vitesseYJoueur);
            }

            //Vérification à chaque tick
            //En comparaison avec le systeme de mouvement vu en cours (switch) celui-ci est plus fluide est réactif
            //
            //Le déplacement de l'environnement se fait selon les déplacements du joueur
            if (touches[TOUCHE_GAUCHE])
            {
                joueur.reculer();

                for (var i = 0; i < NOMBRE_PIECES; i++)
                {
                    pieces[i].animer(vitesseArrierePlan);
                }
                for (var i = 0; i < tableauObstacles.length; i++)
                {
                    tableauObstacles[i].animer(vitesseArrierePlan);
                }

                arrierePlan.animer(vitesseArrierePlan);
                vitesseArrierePlan = 5;
            }
            if (touches[TOUCHE_DROITE])
            {  
                joueur.avancer();

                for (var i = 0; i < NOMBRE_PIECES; i++)
                {
                    pieces[i].animer(vitesseArrierePlan);
                }
                for (var i = 0; i < tableauObstacles.length; i++)
                {
                    tableauObstacles[i].animer(vitesseArrierePlan);
                }

                arrierePlan.animer(vitesseArrierePlan);
                vitesseArrierePlan = -5;
            }
            if (touches[TOUCHE_HAUT])
            { 
                if(joueur.estAuSol())
                {
                    vitesseYJoueur = 0.5 * INTENSITE_PESANTEUR * (temps*temps) - 15;
                    joueur.sauter(vitesseYJoueur);
                    tempsEnLair =  (new Date()).getTime();
                    joueur.setAuSol(false);
                }
            }

            //Détection de la collision avec la pièce
            for (var i = 0; i < NOMBRE_PIECES; i++)
            {
                if (gererCollisionPiece(joueur.getRectangle(), pieces[i].getRectangle()))
                {
                    console.log("Le joueur a touché la piece");
                    pieces[i].disparaitre();
                    piecesRestantes--;
                    affichagePoints.set({text: "Points: " + (NOMBRE_PIECES - piecesRestantes)});
                }
                if(piecesRestantes == 0)
                {
                    createjs.Ticker.removeEventListener("tick", rafraichir);
                    window.location = "#fin-partie-gagnee";
                }
            }

            if(gererCollisionSol(joueur.getRectangle()))
            {
                vitesseYJoueur = 0;
                joueur.setAuSol(true);
            }

            nomJoueur.set({text: "Joueur: " + nomJoueurEntre});
            scene.addChild(affichageTimer);
            scene.addChild(affichagePoints);
            scene.addChild(nomJoueur);

            scene.update(evenementTick);
        }

        //APPUI SUR UNE TOUCHE
        window.addEventListener("keydown", gererToucheEnfoncee);
        //AU RELEVEMENT D'UNE TOUCHE
        window.addEventListener("keyup", gererToucheRelevee);

        arrierePlan = new ArrierePlan(scene);
        joueur = new Joueur(scene, {x: ecranJeu.width/3 ,y: ecranJeu.height/2});

        pieces = new Array();
        for(var i = 0; i < NOMBRE_PIECES; i++)
        {
            pieces.push(new Piece(scene, {x: getNombreAleatoire(REPARTITION_PIECES_X), y: getNombreAleatoire(REPARTITION_PIECES_Y)}));
        }

        sol = new createjs.Rectangle(0,750,1000,100);

////////////////////////////////////////////////////////////////////////////////////

        var donneesObstacles = [
            {
                x : 50,
                y : 50,
                width: 2,
                height: 1
            },
            {
                x : 1000,
                y : 100,
                width: 1,
                height: 4
            },
            {
                x : 1000,
                y : 300,
                width: 4,
                height: 1
            },
            {
                x : 1600,
                y : 200,
                width: 2,
                height: 2
            }
        ];

        donneesObstacles.forEach(element => {
            tableauObstacles.push(new Obstacle(element.x, element.y, element.width, element.height, scene));
        });


////////////////////////////////////////////////////////////////////////////////////


        //Vérification du chargement du poteau
        testChargement = setInterval(testerChargement, 100);
    }

    function getNombreAleatoire(valeurMax)
    {
        return (Math.floor(Math.random() * valeurMax));
    }

    function gererToucheRelevee(evenement)
    {
        //Annulation du ralentissement/acceleration
        vitesseArrierePlan = 0;

        delete touches[evenement.keyCode];
        joueur.attendre();
    }

    function gererToucheEnfoncee(evenement)
    {
        touches[evenement.keyCode] = true;
    }
    
    function testerChargement()
    {
        if(joueur.estCharge() && arrierePlan.estCharge())
        {
            afficherJoueurEtArrierePlan();
            for (var i = 0; i < NOMBRE_PIECES; i++)
            {
                if(pieces[i].estCharge()){  pieces[i].afficher();   }
            }

            for (var i = 0; i < tableauObstacles.length; i++)
            {
                tableauObstacles[i].afficher();
            }

            clearInterval(testChargement);
        }
        
    }
    
    function afficherJoueurEtArrierePlan()
    {
        arrierePlan.afficher();
        joueur.afficher();
    }

    function gererCollisionPiece(rectangleJoueur, rectanglePiece)
	{
		if(rectangleJoueur.x >= rectanglePiece.x + rectanglePiece.width ||
			rectangleJoueur.x + rectangleJoueur.width <= rectanglePiece.x ||
			rectangleJoueur.y >= rectanglePiece.y + rectanglePiece.height ||
			rectangleJoueur.y + rectangleJoueur.height <= rectanglePiece.y)
		{
			return false;
		}
		else
		{
			return true;
        }
    }

    function gererCollisionSol(rectangleJoueur)
    {
        if(rectangleJoueur.y + rectangleJoueur.height <= sol.y)
        {
            return false;
        }
        else
        {
            //joueur.y = sol.y - rectangleJoueur.height;
            return true;
        }
    }

    initialiser();

}