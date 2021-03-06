import React from 'react';
import $ from 'jquery';
import fx from 'money';
import Results from './results';
import SYM from './symbols';


$.getJSON(
  'https://api.fixer.io/latest',
  function(data) {
    if ( typeof fx !== "undefined" && fx.rates ) {
      fx.rates = data.rates;
      fx.base = data.base;
      fx.settings = {
      	from : "EUR",
      	to : "USD"
      };
    } else {
      var fxSetup = {
          rates : data.rates,
          base : data.base
      }
    }
  }
);

export default class Convert extends React.Component {
  constructor(){
    super();
    this.changeAmount = this.changeAmount.bind(this);
    this.changeCurrency = this.changeCurrency.bind(this);
    this.changeSelector = this.changeSelector.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.state = {tosym: '€', fromsym:'$', from_currency: '', to_currency: '',
                  from_amount: 0, to_amount: 0};
    this.selector = 'from';
  }

  componentDidMount() {
    var svgDoc, circle;
    setTimeout(() => {
      svgDoc = document.getElementById('map-svg').contentDocument;
      circle = svgDoc.getElementById("my-circle");
      if(circle === null){
        setTimeout(() => {
          svgDoc = document.getElementById('map-svg').contentDocument;
          circle = svgDoc.getElementById("my-circle");
          circle.addEventListener('click', this.handleMapClick);
        },500)
      }else {
        circle.addEventListener('click', this.handleMapClick);
      }
    }, 500);
    this.setState({from_currency: 'USD', to_currency: 'EUR'});
  }

  _selectDropdown(country){
    const dropdown = this.selector === 'from' ? document.getElementById("from") : document.getElementById("to");
    const otherdropdown = this.selector === 'to' ? document.getElementById("from") : document.getElementById("to");
    for(var i = 0;i < dropdown.length;i++){
       if(dropdown.options[i].value === country){
           dropdown.selectedIndex = i;
       }
     }
     this.changeCurrency(country);
  }

  changeSelector(e){
    if(e.target.value === "from"){
      this.selector = "from";
      document.getElementById('from_picker').style.backgroundColor = '#aaa';
      document.getElementById('to_picker').style.backgroundColor = 'whitesmoke';
    }else {
      this.selector = "to";
      document.getElementById('to_picker').style.backgroundColor = '#aaa';
      document.getElementById('from_picker').style.backgroundColor = 'whitesmoke';
    }
  }

  handleMapClick(e) {
    const otherdropdown = this.selector === 'to' ? document.getElementById("from") : document.getElementById("to");
    if(otherdropdown.value.slice(0,2) === e.target.id ||
      (['AT','FI','BE','DE','CY','EE','ES','FR','GR','IE','DE','IT','LT','LU','LV','NL','PT','SI','SK'].includes(e.target.id) &&
      otherdropdown.value === 'EUR')){
      alert("You can't convert from same currencies.");
      return;
    }
    switch(e.target.id){
      case 'RU':
        this._selectDropdown('RUB');
        break;
      case 'CN':
        this._selectDropdown('CNY');
        break;
      case 'JP':
        this._selectDropdown('JPY');
        break;
      case 'KR':
        this._selectDropdown('KRW');
        break;
      case 'CA':
        this._selectDropdown('CAD');
        break;
      case 'US':
        this._selectDropdown('USD');
        break;
      case 'GB':
        this._selectDropdown('GBP');
        break;
      case 'PH':
        this._selectDropdown('PHP');
        break;
      case 'IL':
        this._selectDropdown('ILS');
        break;
      case 'BG':
        this._selectDropdown('BGN');
        break;
      case 'AT':
      case 'FI':
      case 'BE':
      case 'DE':
      case 'CY':
      case 'EE':
      case 'ES':
      case 'FR':
      case 'GR':
      case 'IE':
      case 'DE':
      case 'IT':
      case 'LT':
      case 'LU':
      case 'LV':
      case 'NL':
      case 'PT':
      case 'SI':
      case 'SK':
        this._selectDropdown('EUR');
        break;
    }
  }

  changeCurrency(e) {
    let from, to, value, direction, country, dropdown, otherdropdown;
    if(typeof e === "string"){
      [dropdown, otherdropdown] = this.selector === 'from' ? [document.getElementById("from"), document.getElementById("to")] : [document.getElementById("to"), document.getElementById("from")];
      country = e;
      direction = this.selector;
      value = direction === "from" ? parseInt($('#from_amount')[0].value) : parseInt($('#to_amount')[0].value);
    }else {
      country = e.target.value
      direction = e.target.name;
      [dropdown, otherdropdown] = direction === 'from' ? [document.getElementById("from"), document.getElementById("to")] : [document.getElementById("to"), document.getElementById("from")];
      value = direction === "from" ? parseInt($('#from_amount')[0].value) : parseInt($('#to_amount')[0].value);
    }
    for(var i = 0;i < dropdown.length;i++){
       if(otherdropdown.options[i].value === country){
         otherdropdown.options[i].disabled = true;
       }else{
         otherdropdown.options[i].disabled = false;
       }
     }
    if(direction === 'from'){
      this.setState({fromsym: SYM[country], from_currency: country});
      from = $('#from_amount')[0];
      to = $('#to_amount')[0];
    }else {
      this.setState({tosym: SYM[country], to_currency: country});
      from = $('#to_amount')[0];
      to = $('#from_amount')[0];
    }
    this._runConversion(from, to, value);
  }

  changeAmount(e) {
    let from, to;
    [to, from] = e.target === $('#from_amount')[0] ? [$('#to_amount')[0],$('#from_amount')[0]] : [$('#from_amount')[0],$('#to_amount')[0]];
    let value = parseInt(e.target.value);
    this._runConversion(from, to, value);
  }

  _runConversion(from, to, value){
    let from_sym, to_sym;
    [from_sym, to_sym] = from.id === "from_amount" ? [$('#from')[0].value, $('#to')[0].value] : [$('#to')[0].value, $('#from')[0].value];
    let converted = fx.convert(value, {from: from_sym, to: to_sym});
    to.value = isNaN(converted) ? "" : Math.round(converted * 1000) / 1000;
    if(from.id === "from_amount"){
      this.setState({from_amount: from.value, to_amount: to.value});
    }else{
      this.setState({from_amount: to.value, to_amount: from.value});
    }

  }

  render() {
    return (
      <div>
        <div className="input_container">
          <div className="amount_container">
            <div id="fromsym">{this.state.fromsym}</div>
            <input className="amount" type="number" id="from_amount" placeholder={`${this.state.fromsym}100`} onInput={this.changeAmount}/>
            <div id="tosym">{this.state.tosym}</div>
            <input className="amount" type="number" id="to_amount" placeholder={`${this.state.tosym}100`} onInput={this.changeAmount}/>
          </div>

          <div className="currency_container">
            <div className="currency_border">
              <select className="currency" id="from" name="from" onChange={this.changeCurrency}>
                <option value="USD">&#36; USD</option>
                <option value="EUR" disabled>&#8364; EUR</option>
                <option value="GBP">&#8356; GBP</option>
                <option value="CAD">&#36; CAD</option>
                <option value="BGN">&#1074; BGN</option>
                <option value="KRW">&#8361; KRW</option>
                <option value="JPY">&#165; JPY</option>
                <option value="RUB">&#1088; RUB</option>
                <option value="PHP">&#8369; PHP</option>
                <option value="ILS">&#8362; ILS</option>
                <option value="CNY">&#165; CNY</option>
              </select>
              <div className="ccw_selector_bg"></div>
              <div className="ccw_selector_arrows"></div>
            </div>

            <div className="currency_border">
              <select className="currency" id="to" name="to" onChange={this.changeCurrency}>
                <option value="EUR">&#8364; EUR</option>
                <option value="USD" disabled>&#36; USD</option>
                <option value="GBP">&#8356; GBP</option>
                <option value="CAD">&#36; CAD</option>
                <option value="BGN">&#1074; BGN</option>
                <option value="KRW">&#8361; KRW</option>
                <option value="JPY">&#165; JPY</option>
                <option value="RUB">&#1088; RUB</option>
                <option value="PHP">&#8369; PHP</option>
                <option value="ILS">&#8362; ILS</option>
                <option value="CNY">&#165; CNY</option>
              </select>
              <div className="ccw_selector_bg"></div>
              <div className="ccw_selector_arrows"></div>
            </div>
          </div>
          <div className="picker_container">
            <button id="from_picker" className="picker" value="from" onClick={this.changeSelector}>FROM</button>
            <button id="to_picker" className="picker" value="to" onClick={this.changeSelector}>TO</button>
          </div>
        </div>

        <div id="map">
          <object width="800" height="640" id="map-svg" type="image/svg+xml" data="./imgs/worldLow.svg"></object>
        </div>

        <div id="results_container">
          <Results info={this.state.from_currency} amount={this.state.from_amount}/>
          <Results info={this.state.to_currency} amount={this.state.to_amount}/>
        </div>
      </div>
    );
  }
}


// export default Convert;
