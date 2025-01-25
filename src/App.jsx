import './App.css'
import Calender from './Calender'
import Movies from './Movies'
import Notice from './notice'

function App() {


  return (
    <>
      <div className="h-screen flex">
        {/*サイドバー*/ }
        <aside className="w-1/5 bg-gray-800 text-white p-4 font-bold">
          サイドバー
        </aside>

        {/*メインコンテンツ*/ }
        <main className="w-4/5 p-4 bg-gray-100 grid grid-rows-3 grid-cols-3 gap-4">
          {/*お知らせコンポーネント*/ }
          <section className="row-span-1 col-span-3 bg-blue-500 p-4">
            <Notice/>
          </section>

          {/*カレンダーコンポーネント*/ }
          <section className="row-span-1 col-span-3 bg-green-500 text-white p-4">
            <Calender/>
          </section>

          {/*動画一覧コンポーネント */}
          <section className="row-span-1 col-span-1 bg-orange-500 text-white p-4">
            <Movies/>
          </section>
          <section className="row-span-1 col-span-1 bg-orange-500 text-white p-4">
            <Movies/>
          </section>
          <section className="row-span-1 col-span-1 bg-orange-500 text-white p-4">
            <Movies/>
          </section>
        </main>
      </div>
    </>
  )
}

export default App
