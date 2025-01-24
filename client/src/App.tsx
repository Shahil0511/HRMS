import Auth from "./pages/Auth"
import Hero from "./pages/Hero"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Auth />} />

      </Routes>
    </Router>

  )
}

export default App