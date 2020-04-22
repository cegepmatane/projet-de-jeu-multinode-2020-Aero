var ArrierePlan = function(scene)
{
    var conteneur;
    var charge;

    var LARGEUR_ECRAN = window.innerWidth;
    var HAUTEUR_ECRAN = window.innerHeight;

    function initialiser()
    {
        conteneur = new createjs.Container();
        charge = false;

        //DANS L'ORDRE DU PLUS LOINTAIN AU PLUS PROCHE
        imageCiel = new Image(LARGEUR_ECRAN, HAUTEUR_ECRAN);
        matriceCiel = new createjs.Matrix2D();
        shapeCiel = new createjs.Shape();
        imageCiel.onload = creerShapePaysage;
        imageCiel.src = "img/arrierePlan-ciel.png";

        imageImmeublesArriere = new Image(LARGEUR_ECRAN, HAUTEUR_ECRAN);
        matriceImmeublesArriere = new createjs.Matrix2D();
        shapeImmeublesArriere = new createjs.Shape();
        imageImmeublesArriere.onload = creerShapePaysage;
        imageImmeublesArriere.src = "img/immeubles-arriere.png";

        imageImmeublesAvant = new Image(LARGEUR_ECRAN, HAUTEUR_ECRAN);
        matriceImmeublesAvant = new createjs.Matrix2D();
        shapeImmeublesAvant = new createjs.Shape();
        imageImmeublesAvant.onload = creerShapePaysage;
        imageImmeublesAvant.src = "img/immeubles-avant.png";

        imageToitAvant = new Image(LARGEUR_ECRAN, HAUTEUR_ECRAN);
        imageToitAvant.height = 10;
        matriceToitAvant = new createjs.Matrix2D();
        shapeToitAvant = new createjs.Shape();
        imageToitAvant.onload = creerShapePaysage;
        imageToitAvant.src = "img/toit-avant.png";

    }

    function creerShapePaysage()
    {
        shapeCiel.graphics.beginBitmapFill(imageCiel, "repeat-x", matriceCiel).
            drawRect(0,0,LARGEUR_ECRAN, HAUTEUR_ECRAN).
            endStroke();

        shapeImmeublesArriere.graphics.beginBitmapFill(imageImmeublesArriere, "repeat-x", matriceImmeublesArriere).
        drawRect(0,0,LARGEUR_ECRAN, HAUTEUR_ECRAN).
        endStroke();

        shapeImmeublesAvant.graphics.beginBitmapFill(imageImmeublesAvant, "repeat-x", matriceImmeublesAvant).
        drawRect(0,0,LARGEUR_ECRAN, HAUTEUR_ECRAN).
        endStroke();

        shapeToitAvant.graphics.beginBitmapFill(imageToitAvant, "repeat-x", matriceToitAvant).
        drawRect(0,0,LARGEUR_ECRAN, HAUTEUR_ECRAN).
        endStroke();

        conteneur.addChild(shapeCiel);
        conteneur.addChild(shapeImmeublesArriere);
        conteneur.addChild(shapeImmeublesAvant);
        conteneur.addChild(shapeToitAvant);
        charge = true;
    }

    this.estCharge = function()
    {
        return charge;
    }

    this.afficher = function()
    {
        scene.addChild(conteneur);
    }

    this.animer = function(vitesseArrierePlan, vitesseJoueur)
    {
        //Si on avance
        if (vitesseArrierePlan < 0)
        {
            conteneur.x += vitesseJoueur;
            matriceCiel.translate(vitesseArrierePlan,0);
            matriceImmeublesArriere.translate(vitesseArrierePlan - 1 ,0);
            matriceImmeublesAvant.translate(vitesseArrierePlan - 3 ,0);
            matriceToitAvant.translate(vitesseArrierePlan - 5, 0);
        }
        else if (vitesseArrierePlan > 0)
        {
            conteneur.x -= vitesseJoueur;
            matriceCiel.translate(vitesseArrierePlan,0);
            matriceImmeublesArriere.translate(vitesseArrierePlan + 1 ,0);
            matriceImmeublesAvant.translate(vitesseArrierePlan + 3 ,0);
            matriceToitAvant.translate(vitesseArrierePlan + 5, 0);
        }
    }

    initialiser();
}