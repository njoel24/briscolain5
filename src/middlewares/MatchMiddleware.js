import _ from 'lodash'

const matchMiddleware = store => next => action => {
  const state = store.getState() // perché ?
	switch(action.type){
    case 'INIT_MATCH':
    action.cardsPlayed = resetCardsPlayed()
    break
		case 'START_MATCH':
			action.shuffleCards = shuffleCards()
      action.cardsPlayed = resetCardsPlayed()
    break
		case 'PLAY':
      const card = playCardOnTheTable(action.value)
      action.cardPlayed = card
      action.inTurn = getNextInTurn()
      action.turnFinished = isTurnFinished()
    break
    case 'CHANGE_TURN':
      action.inTurn = getNextInTurn()
      action.turnFinished = isTurnFinished()
    break
		case 'END_TURN':  
			action.winnerTurn = getWinnerTurn()
  		action.cardsPlayed = resetCardsPlayed()
      action.inTurn = getNextInTurn(action.winnerTurn)
      action.turnFinished = false
      action.turns = getNextTurn() // increase a value      
  		action.finishedMatch = isMatchFinished()
    break
		case 'SET_WINNER':
			action.winner = setWinnerMatch()
      action.cardsPlayed = resetCardsPlayed()
    break
    case 'CHANGE_TURN_AUCTION':
			action.inTurn = getNextInTurn()
      action.winnerAuction = getWinnerAuction()
    break
		case 'PLAY_AUCTION':
    	action.inAuction = isUserInAuction()
			action.auctionForUser = setAuctionForUser(action.value)
      action.inTurn = getNextInTurn()
      action.winnerAuction = getWinnerAuction()
    break
 		case 'CHOOSE_COMPAGNO':
      const choosenCard = chooseCompagno(action.compagno)
    	action.compagno = choosenCard.id
      action.inTurn = getNextInTurn()
      action.area = 'match'
      //TODO: do not know if this works
      action.seed = choosenCard.seme
      // action.alleato = getAlleato()
    break
    case 'EXIT_AUCTION':
    	action.inAuction = false
      action.inTurn = getNextInTurn()
      action.winnerAuction = getWinnerAuction()
    break
	}

  
  function getNextInTurn(winnerTurn) {
    if(state.area == "auction" && state.auction.winner != undefined){
      return state.auction.winner
    }
    if(state.area == "match" && state.match.isTurnFinished ){
      return winnerTurn.winner;
    }
      var next = (state.inTurn+1)%5
      return next
    }

    function getNextTurn() {
      var next = (state.match.turns+1)%9
      return next
    }


    function resetCardsPlayed() {
      return [{id:0, value:0},{id:1, value:0},{id:2, value:0},{id:3, value:0},{id:4, value:0}]
    }

    function shuffleCards() {
      let array = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];
      var currentIndex = array.length, temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }
      return array;
    }

function getMyAllCards(cards){
  const allCards = state.cards
  const myAllCards = []
  for(let i=0; i<cards.length; i++){
    if(cards[i]) {
     for (var key in allCards) {
        if(allCards.hasOwnProperty(key)){
          if(allCards[key].id == cards[i]){
            myAllCards.push(allCards[key])
          }
        }
      }
    }
  }
  return myAllCards
}

function addBriscolaValueToMyAllCards(myAllCards) {
  const myNewAllCards = []
  for(i=0; i<myAllCards.length; i++){
    if(myAllCards[i].seed === state.auction.seed){
      const tmpObject = { 
        value: myAllCards[i].value+100, 
        points: myAllCards[i].points, 
        seme: myAllCards[i].seme, 
        nome: myAllCards[i].nome}
      myNewAllCards.push(tmpObject)
    }else{
      myNewAllCards.push(myAllCards[i])
    }
  }
}


// MATCH


    //WINNER MATCH
    function setWinnerMatch() {
      let team1=0,team2=0;
      for(let i=0; i<state.players.length; i++ ) {
          let player = state.players[i];
          if(player.id === state.auction.winner || player.id === state.auction.compagno) {
            team1 += player.points;
          } else {
            team2 += player.points;
          }
      }
      if(team1 > team2) {
        return "chiamante"
      } else {
        return "others"
      }
    }

   

    function isMatchFinished(){
      return (state.match.turns === 8)
    }


    // WINNER TURN
     function isTurnFinished(){
      var res = state.match.cardsPlayed.filter( c => { return c.value == 0 } );
      return res.length == 1
    }

    function getWinnerTurn(){
      let maxValue = 0;
      let winner =0;
      let totalPoints = 0;
      let startFrom = 0;
      if(state.match.winnerTurn) {
        startFrom = state.match.winnerTurn
      } else {
        startFrom = state.auction.winner;
      }

      for( let i = startFrom; i< 5+startFrom; i++ ) {
          let indexPlayer = i%5;
          let c = state.match.cardsPlayed[indexPlayer];
          let valueCurrentcard =  0
          if(state.auction.seed === state.cards[c.value].seme ) {
            valueCurrentcard = state.cards[c.value].value + 100
          } else {
            valueCurrentcard = state.cards[c.value].value
          }
          if(valueCurrentcard > maxValue) {            
            maxValue = valueCurrentcard
            winner = c.id
          }
          totalPoints += state.cards[c.value].points
      }
      return { winner: winner, totalPoints: totalPoints }
    }

// MATCH - CARD PLAY

  function playCardOnTheTable(cardToPlay = null){
      let c = null;
      if (!cardToPlay) {
        return getCardToPlay()
      } else {
        return cardToPlay
      }
    }

    function getCardByPlayerProfile () {
      if(state.players[state.inTurn].profile === "aggressive") {
        return playSafe();
      } else {
        return playSafe();
      }
    }

    function getCurrentContext(p){
      return {
        maxValuePlayed: getMaxValueFromCardsPlayed(),
        tmpSumPunti: getTmpMaxPuntiTurno(),
        auctionValue:  state.players[state.auction.winner].auction.points,
        puntiConsumatiByTeam: getPuntiConsumatiByTeam(),
        tmpWinnerTeam: getTmpWinnerTurn(getPuntiConsumatiByTeam()),
        hasCompagnoAlreadyPlayed: state.match.cardsPlayed[getAlleato()]!==undefined,
        hasChiamanteAlreadyPlayed: state.match.cardsPlayed[state.auction.winner]!==undefined,
        lastOneToPlay: whichIsTheLastOneToPlay(),
        isOther: !(state.auction.winner === p.id) && !(state.auction.compagno === p.id),
        isChiamante: state.auction.winner === p.id,
        isCompagno: state.auction.compagno === p.id,
        currentTurn: state.turns,
        amITheLastOne: state.match.cardsPlayed.length === 4,
        amItheFirstOne: state.match.cardsPlayed.length === 0
      }
    }
    
    function getCardToPlay() {
      let p = state.players.filter( p => { return p.id == state.inTurn } )[0]
      if(p) {
        const context = getCurrentContext(p);
          if (context.isChiamante) {
              const tryToWinCard = tryToWin(context.maxValuePlayed)
              if(!tryToWinCard){
                return getCardByPlayerProfile();
              }else{
                return tryToWinCard
              }

          } else if(context.isCompagno) {
            const tryToWinCard = tryToWin(context.maxValuePlayed)
            if(!tryToWinCard){
              return getCardByPlayerProfile();
            }else{
              return tryToWinCard
            }
          } else {
            const tryToWinCard = tryToWin(context.maxValuePlayed)
            if(!tryToWinCard){
              return getCardByPlayerProfile();
            }else{
              return tryToWinCard
            }
          }
      }
      return 1
    }


// deve considerare il primo seme giocato che puo non essere briscola ma ha piu valore di un altro seme
  function tryToWin(maxValuePlayed) {
    console.log("-----------------------------------")
    const myAllCards = getMyAllCards(state.players[state.inTurn].cards)
    const myAllCardsByValue = _.sortBy(myAllCards, ['value'])
    console.log("maxValuePlayed:"+ maxValuePlayed);
    for(let i =0; i<myAllCardsByValue.length; i++) {
      let tmpVal = myAllCardsByValue[i].value
      const firstPlayedSeed = getFirstPlayedSeed()
      console.log(myAllCardsByValue[i].seme)
      if(firstPlayedSeed && (myAllCardsByValue[i].seme == firstPlayedSeed)  && (myAllCardsByValue[i].seme != state.auction.seed)) {
        tmpVal += 100
      } else if(myAllCardsByValue[i].seme == state.auction.seed){
        tmpVal += 1000
      }
      console.log("tmpVal:"+ tmpVal);
      if(tmpVal > maxValuePlayed) {
        
        return myAllCardsByValue[i].id
      }
    }
    console.log("-----------------------------------")
  }

// case null
  function getFirstPlayedSeed() {
    for(let i=0; i<state.match.cardsPlayed.length; i++) {
      const currentIndexCard = state.match.cardsPlayed[i].value;
      const player = state.match.cardsPlayed[i].id;
      if(currentIndexCard > 0 ) {
        if(state.match.winnerTurn && state.match.winnerTurn === player ) {
          return currentIndexCard
        } else if (state.auction.winner && state.auction.winner === player ) {
          return currentIndexCard
        }
      }
    }
  }

  // try to play a low value card, no briscola
  function playSafe(){
    let minValue = 1000;
    let tmpCard = 0
    const myAllCards = getMyAllCards(state.players[state.inTurn].cards)
    const myAllCardsByValue = _.sortBy(myAllCards, ['value'])

    for(let i =0; i<myAllCardsByValue.length; i++) {
      if(myAllCardsByValue[i].value < minValue && (myAllCardsByValue[i].seme !== state.auction.seed )){
        minValue = myAllCardsByValue[i].value
        tmpCard = myAllCardsByValue[i].id
      }
    }

    if(tmpCard == 0) {
      tmpCard = myAllCardsByValue[0].id
    }

    return tmpCard
  }

    function playAggressive(){
      let minValue = 1;
      let tmpCard = 0
      const myAllCards = getMyAllCards(state.players[state.inTurn].cards)
      const myAllCardsByValue = _.sortBy(myAllCards, ['value'], ['desc'])

      for(let i =0; i<myAllCardsByValue.length; i++) {
        if(myAllCardsByValue[i].value > minValue){
          minValue = myAllCardsByValue[i].value
          tmpCard = myAllCardsByValue[i].id
        }
      }

      if(tmpCard == 0) {
        tmpCard = myAllCardsByValue[0].id
      }

      return tmpCard
    }

    function playStandard(){

    }


    function whichIsTheLastOneToPlay(){
      if(state.turns == 1){
        return 5
      } else {
        return state.players[state.match.winnerTurn-1];
      }
    }

    function getTmpWinnerTurn(puntiByTeam) {
      if(puntiByTeam.alleati > puntiByTeam.others){
        return "alleati"
      }else{
        return "others"
      }
    }

    function getPuntiConsumatiByTeam() {
      let sumPoints = {alleati: 0, others: 0}
      state.players.map(p => {
        if(p.id === state.auction.winner ||  p.id == getAlleato()){
          sumPoints.alleati += p.points
        }else {
          sumPoints.others += p.points
        }
      })
      return sumPoints
    }

    function getTmpMaxPuntiTurno() {
      var sumPoints = 0
      state.match.cardsPlayed.map(card => {
        if(card.value > 0 ) {
          sumPoints += state.cards[card.value].points
        }
      })
      return sumPoints
    }

    function getMaxValueFromCardsPlayed() {
      let maxValue = 0
      let currentValue = 0
      state.match.cardsPlayed.map(card => {
        if(card.value > 0) {
          currentValue = state.cards[card.value].value
          console.log("state.cards[card.value].seme:"+state.cards[card.value].seme);
          console.log("getFirstPlayedSeed:"+getFirstPlayedSeed());
          console.log(state.cards[card.value]);
          if(state.cards[card.value].seme == state.auction.seed){
              currentValue += 1000
          } else if(state.cards[card.value].seme == getFirstPlayedSeed()){
              currentValue += 100
          }
          if(currentValue > maxValue){
            maxValue = currentValue
          }
        }
      })
      return maxValue
    }








// AUCTION 


    //END AUCTION CHOOSE COMPAGNO
    function chooseCompagno(card) {
      if(card){
        return state.cards[card]
      } else {
        const cardsBySeed = getCardsBySeed(state.players[state.auction.winner].cards)
        const valuesBySeed = {"coppe": 0, "spade": 0, "denari": 0, "bastoni": 0}

      for (var key in cardsBySeed) {
        if(valuesBySeed.hasOwnProperty(key)){
          valuesBySeed[key] = getValueFromCardsBySeed(cardsBySeed[key])
        }
      } 

      const maxSeed = getBiggestSeedValueFromValuesBySeed(valuesBySeed);
        // does not work if you have all 10 cards belongs to the same seed
      const choosenCard = getHighestValuedCardFromBiggestSeed(maxSeed, cardsBySeed)
      
      return state.cards[choosenCard]
      }
    }

    
  function getHighestValuedCardFromBiggestSeed(maxSeed, cardsBySeed) {
    const cards = cardsBySeed[maxSeed]
    for(let i=10; i>=1; i-- ){
     if(cards.filter((card) => {
       return card.value == i
     }).length==0){
       const allCards = state.cards
       for (var key in allCards) {
          if(allCards.hasOwnProperty(key)){
            if(allCards[key].value == i && allCards[key].seme == maxSeed){
              return key
            }
          }
       }
     }
    }
  }

    function getAlleato() {
      state.players.map(p => {
        for(let i=0; i<p.cards.length; i++){
          if(p.cards[i] == state.auction.compagno)
          return p.id
        }
      })
    }

    function getWinnerAuction() {
      let playersInAuction = state.players.filter( p => {  return p.auction.isIn === true })
      if( playersInAuction.length == 1) {
        return playersInAuction[0].id
      } else {
        return undefined
      }
    }




    // AUCTION IN PROGRESS

    function isUserInAuction(){
      return state.players[state.inTurn].auction.isIn
    }


    function setAuctionForUser(value = null) {
      const biggestAuction = getBiggestAuction(state.players);

      if(value){
        if(value > biggestAuction) {
          return  {points:value, isIn:true}
        } else {
          return {points:value, isIn:false}
        }
      }

      if(state.players[state.inTurn].auction.isIn === true) {
        return getAIChoice(state.players[state.inTurn].auction, biggestAuction)
      } else {
        return state.players[state.inTurn].auction
      }
    }

    function getBiggestAuction(players) {
      let tmpMax = 60
      players.map((player) => {
        if(player.auction.points > tmpMax ){
          tmpMax = player.auction.points
        } 
      })
      return tmpMax
    }




// group of utility functions to calculate the value of the auction for a BOT USER
    
    function getAIChoice(auction, biggestAuction) {
      
      let tmpVal = getAuctionValue(state.players[state.inTurn].cards)
      if(tmpVal < biggestAuction) {
        auction.isIn = false
        auction.points = tmpVal
      } else {
        auction.isIn = true
        auction.points = biggestAuction+5;
        if(auction.points > 120) {
          auction.points = 120
        }
      }

      return auction
    }

  
  function getCardsBySeed(cards) {
    const myAllcards = getMyAllCards(cards)
    const cardsBySeed = {"coppe": [], "spade": [], "denari": [], "bastoni": []}
    myAllcards.map((card) => {
      cardsBySeed[card.seme].push(card)  
    })
    return cardsBySeed
  }

  function getValueFromCardsBySeed(cards) {
    let value = 0
    cards.map((card) => {
      value += card.value
    })
    return value
  }

  function getBiggestValueFromCardsBySeed(valueBySeed){
    let biggestValue = 0
    for (var key in valueBySeed) {
      if(valueBySeed.hasOwnProperty(key)){
        if(valueBySeed[key] > biggestValue ){
          biggestValue = valueBySeed[key]
        }
      }
    }
    return biggestValue  
  }

  function getBiggestSeedValueFromValuesBySeed(valueBySeed){
    let biggestSeed = null
    let biggestValue = 0
    for (var key in valueBySeed) {
      if(valueBySeed.hasOwnProperty(key)){
        if(valueBySeed[key] > biggestValue ){
          biggestValue = valueBySeed[key]
          biggestSeed = key
        }
      }
    }
    return biggestSeed
  }

  function getAuctionValue(cards){
    const cardsBySeed = getCardsBySeed(cards)
    const valueBySeed = {"coppe": 0, "spade": 0, "denari": 0, "bastoni": 0}

    for (var key in cardsBySeed) {
      if(valueBySeed.hasOwnProperty(key)){
        valueBySeed[key] = getValueFromCardsBySeed(cardsBySeed[key])
      }
    } 

    const maxValue = getBiggestValueFromCardsBySeed(valueBySeed);
    let myMaxAuction = 70; 
    if(maxValue >= 20 ){
      myMaxAuction = 70;
    }
    if(maxValue >= 25 ){
      myMaxAuction = 80;
    }
    if(maxValue >= 30 ){
      myMaxAuction = 90;
    }
    if(maxValue >= 35 ){
      myMaxAuction = 100;
    }

    if(maxValue >= 40 ){
      myMaxAuction = 105;
    }

    if(maxValue >= 45 ){
      myMaxAuction = 110;
    }

    if(maxValue == 50 ){
      myMaxAuction = 120;
    }

    return myMaxAuction
  
  }

    next(action);
};

  
export default matchMiddleware