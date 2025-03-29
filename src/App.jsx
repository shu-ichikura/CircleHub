import './App.css'
import Calender from './Calender.tsx'
import Header from './Header.tsx'
import Movies from './Movies.tsx'
import Notice from './Notice.tsx'
import { useAuthRedirect } from './hooks/useAuthRedirect.ts'

function App() {
  //ログイン認証
  const isLoading = useAuthRedirect();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="h-screen flex flex-col">
        {/*ヘッダー */}
        <Header/>
        <div className="flex-grow overflow-y-auto">
          {/*メインコンテンツ*/ }
          <main className="p-4 bg-gray-100 grid grid-cols-3 gap-4 auto-rows-min max-w-6xl mx-auto">
            {/*お知らせコンポーネント*/ }
            <section className="row-span-1 col-span-3 bg-sky-500 p-4">
              <Notice/>
            </section>

            {/*カレンダーコンポーネント*/ }
            <section className="row-span-1 col-span-3 bg-sky-300 text-white p-4">
              <Calender/>
            </section>

            {/*動画一覧コンポーネント */}
            <section className="row-span-1 col-span-3 bg-sky-300 text-black p-4">
              <Movies/>
            </section>
          </main>
        </div>
      </div>


    </>
  )
}

export default App
