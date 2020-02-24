var ArrierePlan = function(scene)
{
    var conteneur;
    var charge;

    function initialiser()
    {
        conteneur = new createjs.Container();
        charge = false;

        //DANS L'ORDRE DU PLUS LOINTAIN AU PLUS PROCHE
        imageCiel = new Image();
        matriceCiel = new createjs.Matrix2D();
        shapeCiel = new createjs.Shape();
        imageCiel.onload = creerShapePaysage;
        imageCiel.src = "img/arrierePlan-ciel.png";

        imageImmeublesArriere = new Image();
        matriceImmeublesArriere = new createjs.Matrix2D();
        shapeImmeublesArriere = new createjs.Shape();
        imageImmeublesArriere.onload = creerShapePaysage;
        imageImmeublesArriere.src = "img/immeubles-arriere.png";

        imageImmeublesAvant = new Image();
        matriceImmeublesAvant = new createjs.Matrix2D();
        shapeImmeublesAvant = new createjs.Shape();
        imageImmeublesAvant.onload = creerShapePaysage;
        imageImmeublesAvant.src = "img/immeubles-avant.png";

        imageToitAvant = new Image();
        matriceToitAvant = new createjs.Matrix2D();
        shapeToitAvant = new createjs.Shape();
        imageToitAvant.onload = creerShapePaysage;
        imageToitAvant.src = "img/toit-avant.png";
    }

    function creerShapePaysage()
    {
        shapeCiel.graphics.beginBitmapFill(imageCiel, "repeat", matriceCiel).
            drawRect(0,0,1000,800).
            endStroke();

        shapeImmeublesArriere.graphics.beginBitmapFill(imageImmeublesArriere, "repeat", matriceImmeublesArriere).
            drawRect(0,0,1000,800).
            endStroke();

        shapeImmeublesAvant.graphics.beginBitmapFill(imageImmeublesAvant, "repeat", matriceImmeublesAvant).
            drawRect(0,0,1000,800).
            endStroke();

        shapeToitAvant.graphics.beginBitmapFill(imageToitAvant, "repeat", matriceToitAvant).
            drawRect(0,0,1000,800).
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

    this.animer = function(vitesse)
    {
        //Si on avance
        if (vitesse < 0)
        {
            matriceCiel.translate(vitesse,0);
            matriceImmeublesArriere.translate(vitesse - 1 ,0);
            matriceImmeublesAvant.translate(vitesse - 3 ,0);
            matriceToitAvant.translate(vitesse - 5, 0);
        }
        else if (vitesse > 0)
        {
            matriceCiel.translate(vitesse,0);
            matriceImmeublesArriere.translate(vitesse + 1 ,0);
            matriceImmeublesAvant.translate(vitesse + 3 ,0);
            matriceToitAvant.translate(vitesse + 5, 0);
        }
    }

    initialiser();
}