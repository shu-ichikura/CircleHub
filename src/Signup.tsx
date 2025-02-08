import React from 'react'

const Signup = () => {
  return (
    <div className="max-w-[400px] mx-auto">
    <div className="text-center font-bold text-xl mb-10">サインアップ</div>
    <form>
        {/*名前 */}
        <div className="mb-3">
            <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                placeholder="名前"
                id="name"
                // {...register('name', { required: true})}
            />
            {/* <div className="my-3 text-center text-sm text-red-500">{errors.name?.message}</div> */}
        </div>

        {/*メールアドレス */}
        <div className="mb-3">
            <input
                type="email"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                placeholder="メールアドレス"
                id="email"
                // {...register('email', { required: true})}
            />
            {/* <div className="my-3 text-center text-sm text-red-500">{errors.email?.message}</div> */}
        </div>

        {/*パスワード */}
        <div className="mb-5">
        <input
                type="password"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                placeholder="パスワード"
                id="password"
                // {...register('password', { required: true})}
        />
        {/* <div className="my-3 text-center text-sm text-red-500">{errors.password?.message}</div> */}
        </div>

        {/*サインアップボタン */}
        <div className="mb-5">

                <button
                    type="submit"
                    className="font-bold bg-sky-500 hover:brightness-95 w-full rounded-full p-2 text-white text-sm"
                >
                    サインアップ
                </button>

        </div>
    </form>

    {/* {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>} */}

    <div className="text-center text-sm">
            ログインはこちら
    </div>
</div>
  )
}

export default Signup