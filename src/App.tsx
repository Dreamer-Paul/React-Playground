import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Panel from './components/DragStaticPanel';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Panel>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio expedita veniam porro accusamus odio voluptatem facilis amet omnis reiciendis! Quia sit fuga ex tenetur deserunt soluta recusandae ut quibusdam? Quasi.</p>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores dolore a deleniti unde, hic eum dicta iste cumque nobis adipisci quas laborum quod vitae veritatis! Facilis obcaecati earum sapiente itaque!</p>
      </Panel>
    </div>
  )
}

export default App
