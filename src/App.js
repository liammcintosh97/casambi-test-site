import { useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.scss';
import Casambi from 'casambi-sdk';

const CASAMBI_API_KEY = process.env.REACT_APP_CASAMBI_API_KEY
const CASAMBI_NETWORK_SESSION_EMAIL = process.env.REACT_APP_CASAMBI_NETWORK_SESSION_EMAIL
const CASAMBI_NETWORK_SESSION_PASSWORD = process.env.REACT_APP_CASAMBI_NETWORK_SESSION_PASSWORD
const CASAMBI_WEBSOCKET_REFERENCE_ID = process.env.REACT_APP_CASAMBI_WEBSOCKET_REFERENCE_ID

function App() {
  const [casambi,setCasambi] = useState(null)
  const [selectedUnits,setSelectedUnits] = useState([])

  useEffect(()=> {
    const _casambi = new Casambi(
      CASAMBI_API_KEY,
      CASAMBI_NETWORK_SESSION_EMAIL,
      CASAMBI_NETWORK_SESSION_PASSWORD,
      CASAMBI_WEBSOCKET_REFERENCE_ID
    )
    _casambi.init()
      .then((casambi)=>{ setCasambi(casambi)})
      .catch((e)=>{console.error(e)})
  },[])

  useEffect(()=>{
    if(!casambi || !casambi.ready) return
    onToggleClick(document.querySelector(".toggle-buttons>button"))
  },[casambi])

  function onToggleClick(element){
    const buttons = document.querySelectorAll(".toggle-buttons button")
    for(const b of buttons) b.className = ""

    element.className += "selected";

    const selected = element.innerText

    if(selected === "Front Bar"){
      const selectedUnits = []
      for(const unit of casambi.api.units){
        if(unit.id === 3 || unit.id === 4) selectedUnits.push(unit.id)
      }

      if(selectedUnits.length === 0) console.error("Can't see Front Bar lights")
      setSelectedUnits(selectedUnits)
    }
    else if(selected === "Brew House"){
      const selectedUnits = []
      for(const unit of casambi.api.units){
        if(unit.id === 5 || unit.id === 6) selectedUnits.push(unit.id)
      }

      if(selectedUnits.length === 0) console.error("Can't see Brew House lights")   
      setSelectedUnits(selectedUnits)
    }
    else console.error("Invalid selection type")

  }

  function onSelectColour(){
    const colorPicker = document.getElementById("light-colour")

    const colour = hexToRgb(colorPicker.value)

    for(const unit of selectedUnits){
      casambi.updateColorRGB(unit,colour.r,colour.b,colour.g)
    }
  }

  function onSelectDim(){
    const dimPicker = document.getElementById("light-dim")
    
    casambi.dimLights(selectedUnits,dimPicker.value/100)
  }

  function onSelectPulse(){
    pulse(1)
  }

  async function pulse(value){

    casambi.dimLights(selectedUnits,value).then(()=>{
      if(value === 1) value = 0
      else if (value === 0 ) value = 1
          
      setTimeout(()=>{
        pulse(value)
      },1000)
    })
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  return (
    <div className="App">
      <header>
        <h1>Casambi Playground</h1>
        <h4>SHG Head Office</h4>
      </header>
      {casambi && casambi.ready ? (
        <>
          <div className='toggle-buttons'>
            <button onClick={(event) => onToggleClick(event.target)}>
              Front Bar
            </button>
            <button onClick={(event) => onToggleClick(event.target)}>
              Brew House
            </button>
          </div>
          <div className="light-inputs">
            <div>
              <label htmlFor="light-colour"><h5>Light Colour</h5></label>
              <input type="color" id="light-colour" name="light-colour"/>
              <button onClick={onSelectColour}>Select</button>
            </div>
            <div>
              <label htmlFor="light-dim"><h5>Light Dim</h5></label>
              <input type="range" id="light-dim" name="light-dim"/>
              <button onClick={onSelectDim}>Select</button>
            </div>
            <div>
              <label htmlFor="light-pulse"><h5>Pulse Light</h5></label>
              <button id="light-pulse" onClick={onSelectPulse}>Toggle</button>
            </div>
          </div>
        </>
        ) : (<></>)
      }
    </div>
  );
}

export default App;
