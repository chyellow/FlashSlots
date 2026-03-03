import { useState } from 'react';
import './App.css'
import { Calendar } from './components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
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
    <div className='flex items-center justify-start h-screen flex-col'>
      <h1 className='text-3xl'>FlashSlots--Alpha Release</h1>
      <p>
        FlashSlots is a real-time marketplace for last-minute service openings.
        This alpha release demonstrates the foundational frontend
        infrastructure for the product.
      </p>
    <Tabs defaultValue="business" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="client">Client</TabsTrigger>
      </TabsList>
      <TabsContent value="business">Business UI goes here</TabsContent>
      <TabsContent value="client">Client UI goes here</TabsContent>
    </Tabs>

    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel>One</ResizablePanel>
    <ResizableHandle />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
       
    </div>
       
  );
}
// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
