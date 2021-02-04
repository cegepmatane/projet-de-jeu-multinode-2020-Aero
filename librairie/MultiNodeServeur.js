//Implementing URL Paths in NodeJs
//https://medium.com/@jstubblefield7939/implementing-url-paths-in-nodejs-fbf3d4e66592
//https://github.com/theturtle32/WebSocket-Node/blob/master/test/scripts/libwebsockets-test-server.js
//https://github.com/theturtle32/WebSocket-Node/blob/master/lib/WebSocketRouter.js
//https://github.com/theturtle32/WebSocket-Node/blob/master/test/scripts/libwebsockets-test-client.js

(function(){

    var http = require('http');
    var websocket = require('websocket');

    var serveurHTTP;
    var websocketServeur;
    var websocketRouter;

    var listeConnection;
    var listeJoueur;

    var messageTransfertVariable = {etiquette:"TRANSFERT_VARIABLE"};
    var messageDemandeAuthentification = {etiquette:"DEMANDE_AUTHENTIFICATION"};
    // messages recus
    var messageNotificationAuthentification = {etiquette:"NOTIFICATION_AUTHENTIFICATION"};
    var messageNotificationVariable = {etiquette:"NOTIFICATION_VARIABLE"};
    var messageConfirmationAuthentification = {etiquette:"CONFIRMATION_AUTHENTIFICATION"};
    

    (function initialiser(){

        serveurHTTP = http.createServer();
        serveurHTTP.listen(8080);

        websocketServeur = new websocket.server({httpServer: serveurHTTP});
        websocketRouter = new websocket.router({server: websocketServeur});

        listeConnection = [];
        listeJoueur = [];

        websocketRouter.mount('/multinode', null, agirSurRequeteConnection);
        
    })();

    function agirSurRequeteConnection(requete){

        var connection = requete.accept(requete.origin);
        
        listeConnection.push(connection);
    
        connection.on('message', agirSurReceptionMessage);    
    
        connection.on('close', agirSurFermetureConnection);
        
        connection.on('error', agirSurErreurConnection);    

    }

    function agirSurReceptionMessage(message){

        console.log(this.remoteAddress + " message. type: " +message.type);
        // We only care about text messages
        if (message.type === 'utf8') {
            
            console.log("message.utf8Data : ",message.utf8Data);
            
            messageReconstruit = JSON.parse(message.utf8Data);
            
            switch(messageReconstruit.etiquette) {

                case messageDemandeAuthentification.etiquette:

                    repondreDemandeAuthentification(this, messageReconstruit);
                    
                break;

                case messageTransfertVariable.etiquette:

                    repondreTransfertVariable(traiterVariableJeu(messageReconstruit));
                    
                break;

            }

            validerFinPartie();

        }
    }

    function validerFinPartie()
    {
        console.log("validerFinPartie", "entrée");

        var variable = null;

        listeJoueur.forEach(function (itemListeJoueur, indexListeJoueur)
        {
            /*
            if(itemListeJoueur.pointDeVie <= 0)
            {
                variable =
                {
                    type: "booleen",
                    cle: itemListeJoueur.pseudonyme + "=>" + VARIABLE.FIN_PARTIE,
                    valeur: true
                };
            }
            */
        });

        //Si variable a été définie, alors cela veut dire que la partie est terminée
        if(variable)
        {
            messageTransfertVariable.variable = variable;
            repondreTransfertVariable(messageTransfertVariable);
        }
    }

    function agirSurFermetureConnection(raison, description){

        /*
        var index = mirrorConnections.indexOf(connection);
        if (index !== -1) {
            console.log((new Date()) + ' lws-mirror-protocol peer ' + connection.remoteAddress + ' disconnected, code: ' + closeReason + '.');
            mirrorConnections.splice(index, 1);
        }
        */

    }

    function agirSurErreurConnection(erreur){
        
        console.log('Connection error for peer ' + this.remoteAddress + ': ' + erreur);

    }

    function repondreDemandeAuthentification(connection, messageDemandeAuthentification){

        console.log(messageDemandeAuthentification.etiquette);

        messageConfirmationAuthentification.listePseudo = 
            getListeAutrePseudonyme(messageDemandeAuthentification.pseudonyme);

        var reponse = JSON.stringify(messageConfirmationAuthentification);

        connection.send(reponse);

        console.log(reponse);

        identifiantConnection = listeConnection.indexOf(connection);
        
        listeJoueur[identifiantConnection] = 
        {
            pseudonyme : messageDemandeAuthentification.pseudonyme,
            //pointDeVie : POINTS_DE_VIE_MAXIMUM
        };

        messageNotificationAuthentification.pseudonyme = 
            messageDemandeAuthentification.pseudonyme;
        
        reponse = JSON.stringify(messageNotificationAuthentification);
        
        console.log("#2 ------->",reponse);

        listeConnection.forEach(function (itemListeConnection, indexListeConnection) {

            if(identifiantConnection != indexListeConnection){

                itemListeConnection.send(reponse);

            }

        });

        messageConfirmationAuthentification.listePseudo = null;
        messageNotificationAuthentification.pseudonyme = null;

    }

    function repondreTransfertVariable(messageTransfertVariable){

        messageNotificationVariable.variable = 
            messageTransfertVariable.variable;

        var reponse = JSON.stringify(messageNotificationVariable);

        listeConnection.forEach(function (itemListeConnection, indexListeConnection) {

            itemListeConnection.send(reponse);

        });

        messageNotificationVariable.variable = null;

    }

    function traiterVariableJeu(messageReconstruit)
    {
        console.log("traiterVariableJeu", "entrée");

        var variable = messageReconstruit.variable;
        var cle = identifierComposantCleVariable(variable.cle);
        console.log("traiterVariableJeu - variables", variable , "=" , cle);

        /*
        if(cle.nomAnonyme == VARIABLE.ATTAQUE)
        {            
            variable = attaquer(cle.pseudonyme, variable.valeur);
        }
        else if(cle.nomAnonyme = VARIABLE.SOIN)
        {
            variable = soigner(cle.pseudonyme, variable.valeur);
        }
        */
        if(variable)
        {
            console.log("traiterVariableJeu si variable", variable);
            messageReconstruit.variable = variable;
        }

        return messageReconstruit;
    }

    function identifierComposantCleVariable(cleVariable)
    {
        var composantCle = cleVariable.split('=>');
        var cle =
        {
            pseudonyme : composantCle[0],
            nomAnonyme : composantCle[1]
        }

        return cle;
    }
    
    function getListeAutrePseudonyme(pseudonyme){
        listePseudonyme = [];
        listeJoueur.forEach(function (itemListeJoueur, indexListeJoueur) {
            
            if(pseudonyme != itemListeJoueur.pseudonyme){

                listePseudonyme[listePseudonyme.length] = 
                    itemListeJoueur.pseudonyme;

            }

        });
        
        return listePseudonyme;
    }

    /*
    function attaquer(pseudonymeAttaquant, valeur)
    {
        console.log("attaquer", "entrée");
        var variable = null;
        listeJoueur.forEach(function (itemListeJoueur, indexListeJoueur)
        {
            //On cherche le joueur attaqué
            if(itemListeJoueur.pseudonyme.indexOf(pseudonymeAttaquant) < 0)
            {
                //On applique les points de vie à enlever
                itemListeJoueur.pointDeVie -= valeur;
                variable = 
                {
                    type: "numerique",
                    cle : itemListeJoueur.pseudonyme + "=>" + VARIABLE.POINT_DE_VIE,
                    valeur : itemListeJoueur.pointDeVie
                };
            }
        });
        //Retour des points de vie du joueur qui a été attaqué
        return variable;    
    }

    function soigner(pseudonymeJoueurASoigner, valeurSoin)
    {
        var variable = null;
        listeJoueur.forEach(function (itemListeJoueur, indexListeJoueur)
        {
            if(itemListeJoueur.pseudonyme.indexOf(pseudonymeJoueurASoigner) >= 0)
            {
                if(itemListeJoueur.pointDeVie + valeurSoin > POINTS_DE_VIE_MAXIMUM)
                {
                    itemListeJoueur.pointDeVie = POINTS_DE_VIE_MAXIMUM;
                }
                else
                {
                    itemListeJoueur.pointDeVie += valeurSoin;
                }
                variable = 
                {
                    type: "numerique",
                    cle : itemListeJoueur.pseudonyme + "=>" + VARIABLE.POINT_DE_VIE,
                    valeur : itemListeJoueur.pointDeVie
                };
            }
        });
        return variable;    
    }
    */

})();

