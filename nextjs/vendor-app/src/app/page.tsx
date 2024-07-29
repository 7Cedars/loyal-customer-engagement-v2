"use client"; 

export default function Home() {
  
  return (
    <main className="grid grid-cols-1 w-full min-h-dvh bg-slate-100 dark:bg-slate-900 justify-items-center content-center border border-blue-500">

      <div className={`h-fit grid grid-cols-1 justify-items-center w-full max-w-3xl md:w-4/5 border border-red-500`}>
        <div className={`w-full h-fit grid grid-cols-2 gap-4 h-48 p-2 border border-green-500`}>
          <div className={`w-fit place-self-start border border-purple-500`}> 
            About
          </div> 
          <div className={`w-fit place-self-end border border-purple-500`}>
            Toggle
          </div> 
        </div>
      
      <div className={`w-full h-fit grid grid-cols-1 max-w-md gap-2 h-48 p-2 border border-green-500`}>
        <div className={`w-full grid grid-cols-1 text-3xl content-start border border-purple-500`}> 
            hi there 
        </div> 
        <div className={`w-full grid grid-cols-1 text-3xl content-end text-end border border-purple-500`}> 
            this is Loyal 
        </div> 
        <div className={`w-full grid grid-cols-1 text-md content-end text-center border border-purple-500`}> 
            A lightweight, composable, app for customer engagement programs.   
        </div> 
      </div>

      </div>
    </main> 
  )

}
