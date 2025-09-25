import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


//import App from './App.tsx'
import Login from './pages/login.tsx'
import Voting from './pages/voting.tsx'
import SimpleSlider from './pages/test.tsx';
import MainVoting from './pages/main-voting.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Login />
  </StrictMode>,
)

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )



