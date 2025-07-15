import { useState } from 'react'
import './App.css'
import ChessGame from './Chessgame'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <ChessGame/>
      </div>
    </>
  )
}

export default App
