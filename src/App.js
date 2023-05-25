import { useState, useEffect, useRef } from 'react'
import randomWords from 'random-words'
import clickSound from './audio/click.wav'
import successSound from './audio/success.wav'
import useSound from 'use-sound'
import './App.css'
const NUMB_OF_WORDS = 200

function App() {
  const [words, setWords] = useState([])
  const [theme, setTheme] = useState('light');
  const [SECONDS, SETSECONDS] = useState(60)
  const [countDown, setCountDown] = useState(SECONDS)
  const [currInput, setCurrInput] = useState("")
  const [currWordIndex, setCurrWordIndex] = useState(0)
  const [currCharIndex, setCurrCharIndex] = useState(-1)
  const [currChar, setCurrChar] = useState("")
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [status, setStatus] = useState("waiting")
  const [keyCount, setKeyCount] = useState(0)
  const textInput = useRef(null)

  const [clicksound] = useSound(
    clickSound,
    { volume: 1.0 }
  );
  const [Successsound] = useSound(
    successSound,
    { volume: .75 }
  );


  useEffect(() => {
    setWords(generateWords())
  }, [])

  useEffect(() => {
    if (status === 'started') {
      textInput.current.focus()
    }
  }, [status])

  function generateWords() {
    return new Array(NUMB_OF_WORDS).fill(null).map(() => randomWords())
  }

  function start() {

    if (status === 'finished') {
      setWords(generateWords())
      setCurrWordIndex(0)
      setCorrect(0)
      setIncorrect(0)
      setCurrCharIndex(-1)
      setCurrChar("")
      setKeyCount(0)
    }

    if (status !== 'started') {
      setStatus('started')
      let interval = setInterval(() => {
        setCountDown((prevCountdown) => {
          if (prevCountdown === 0) {
            clearInterval(interval)
            Successsound()
            setStatus('finished')
            setCurrInput("")
            return SECONDS
          } else {
            return prevCountdown - 1
          }
        })
      }, 1000)
    }

  }

  function handleKeyDown({ keyCode, key }) {
    // space bar 
    clicksound()
    if (keyCode === 32) {
      checkMatch()
      setCurrInput("")
      setCurrWordIndex(currWordIndex + 1)
      setCurrCharIndex(-1)

    }
    else if (keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1)
      setCurrChar("")
    } else {
      setKeyCount((prevCount) => prevCount + 1)
      setCurrCharIndex(currCharIndex + 1)
      setCurrChar(key)
    }
  }

  function checkMatch() {
    const wordToCompare = words[currWordIndex]
    const doesItMatch = wordToCompare === currInput.trim()
    if (doesItMatch) {
      setCorrect(correct + 1)
    } else {
      setIncorrect(incorrect + 1)
    }
  }

  function getCharClass(wordIdx, charIdx, char) {
    if (wordIdx === currWordIndex && charIdx === currCharIndex && currChar && status !== 'finished') {
      if (char === currChar) {
        return 'has-background-success'
      } else {
        return 'has-background-danger'
      }
    } else if (wordIdx === currWordIndex && currCharIndex >= words[currWordIndex].length) {
      return 'has-background-danger'
    } else {
      return ''
    }
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  useEffect(() => {
    setCountDown(SECONDS)
  }, [SECONDS]);

  const switchTime = () => {
    setCorrect(0)
    if (SECONDS === 60) SETSECONDS(120)
    else if (SECONDS === 120) SETSECONDS(30)
    else SETSECONDS(60)
  }

  return (
    <div className={theme}>
      <div className="wrapper">
        <button className="button is-dark dark__mode" onClick={toggleTheme}>{theme} mode</button>
        <button className="button is-dark dark__mode" onClick={switchTime}>Toggle Time -- {SECONDS}</button>
      </div>
      <div className="section">
        <i class="fa-duotone fa-moon"></i>
        <div className="is-size-1 has-text-centered has-text-primary">
          <h2>{countDown}</h2>
        </div>
      </div>
      <div className="control is-expanded section">
        <input ref={textInput} disabled={status !== "started"} type="text" className="input input__box" onKeyDown={handleKeyDown} value={currInput} onChange={(e) => setCurrInput(e.target.value)} />
      </div>
      <div className="section">
        <button className="button is-info is-fullwidth" onClick={start}>
          Start
        </button>
      </div>
      {status === 'started' && (
        <div className="section" >
          <div className="card">
            <div className="card-content">
              <div className="content">
                {words.map((word, i) => (
                  <span key={i}>
                    <span>
                      {word.split("").map((char, idx) => (
                        <span className={getCharClass(i, idx, char)} key={idx}>{char}</span>
                      ))}
                    </span>
                    <span> </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {status === 'finished' && (
        <div className="section">
          <div className="columns">
            <div className="column has-text-centered">
              <p className="is-size-5">Words per minute:</p>
              <p className="has-text-primary is-size-1">
                {(() => {
                  if (SECONDS === 120) return <p>{correct / 2}</p>
                  else if (SECONDS === 30) return <p>{correct * 2}</p>
                  else return <p>{correct}</p>
                })()}
              </p>
            </div>
            <div className="column has-text-centered">
              <p className="is-size-5">Accuracy:</p>
              {correct !== 0 ? (
                <p className="has-text-info is-size-1">
                  {Math.round((correct / (correct + incorrect)) * 100)}%
                </p>
              ) : (
                <p className="has-text-info is-size-1">0%</p>
              )}
            </div>
            <div className="column has-text-centered">
              <p className="is-size-5">Key Pressed:</p>
              <p className='has-text-info is-size-1'>{keyCount}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;