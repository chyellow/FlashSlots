import { useState } from 'react';
import './App.css'
import { Calendar } from './components/ui/calendar';
import { getTheme, applyTheme } from "@/lib/theme"

function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme())
  return (
    <button
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark"
        applyTheme(next)
        setTheme(next)
      }}
    >
      Theme: {theme}
    </button>
  )
}


function App() {

  const [date, setDate] = useState(new Date())

  return (
    <div className='flex items-center justify-center h-screen flex-col'>
      <h1 className='text-6xl'>FlashSlots</h1>
      <h2 className='text-2xl m-2'>Alpha Release</h2>
      <p>
        FlashSlots is a real-time marketplace for last-minute service openings.
        This alpha release demonstrates the foundational frontend
        infrastructure for the product.
      </p>

       <div className='m-15'>
        <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-lg border "
  />

    </div>
       </div>
       
  );
}
// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
