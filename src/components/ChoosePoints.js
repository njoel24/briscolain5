import React from 'react'
import { connect } from 'react-redux'
import { startMatch, setWinner,  endTurn,
		changeTurn, play, playBot} from '../actions/match'
import { playAuctionBot, 
	 playAuction,
	 endAuction, 
	 exitAuction,
	 changeTurnAuction } from '../actions/auction'

class ChoosePoints extends React.Component {
	constructor() {
		super()
	}
	updateValue() {
		if(document.getElementById("range")) {
			document.getElementById("value").innerHTML = document.getElementById("range").value
		}
	}
	render () {	
		if(this.props.show) {	
		return (
			<div>
				<input id="range" type="range" min={70} max={120} defaultValue={70} step={1} onChange={this.updateValue.bind(this)}  />
				<span id="value"></span>
				<button onClick={ this.props.playAuction}>Ok</button>
				<button onClick={ this.props.exitAuction}>Exit</button>
			</div>
		)
		} else {
			return null
		}
	}
}  

const mapStateToProps = function(store) {
  return {};
}

const mapDispatchToProps = function(dispatch, ownProps) {
	
	
  return {
    playAuction: () => {
			let value= 0
			if(document.getElementById("range")){
				value = document.getElementById("range").value
			}
      dispatch(playAuction(value));
    },
		exitAuction: () => {
      dispatch(exitAuction());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChoosePoints);
