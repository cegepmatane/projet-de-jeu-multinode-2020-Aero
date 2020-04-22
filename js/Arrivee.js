var Arrivee = function(scene, position)
{
    var imageArrivee;
    var charge;

    function initialiser()
    {
        //Création de la ligne d'arrivée
        imageArrivee = new createjs.Bitmap("img/arrivee.png");
        charge = false;
        positionnerArrivee();
    }

    function positionnerArrivee()
    {
        imageArrivee.x = position.x;
        imageArrivee.y = position.y;

        imageArrivee.scaleX = imageArrivee.scaleY = 1;
        imageArrivee.setBounds(imageArrivee.x, imageArrivee.y, imageArrivee.scaleX*50, imageArrivee.scaleY*800);

        charge = true;
    }

    this.getPosition = function()
    {
        return {x: imageArrivee.x, y: imageArrivee.y};
    }

    this.afficher = function()
    {
        scene.addChild(imageArrivee);
    }

    this.estCharge = function()
    {
        return charge;
    }

    initialiser();
}