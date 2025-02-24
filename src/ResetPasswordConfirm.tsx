import React from 'react'
import { useState } from 'react'
import { supabase } from './hooks/supabaseClient'

const ResetPasswordConfirm = () => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // デフォルト送信防止
        setLoading(true)
        setMessage('')

        // パスワード確認のバリデーション
        if (password !== confirmation) {
            setMessage('パスワードが一致しません。');
            setLoading(false);
            return;
        }

        try {
            // パスワードの更新
            const { data, error } = await supabase.auth.updateUser({
                password: password,
            })
            //エラーチェック
            if(error) {
                setMessage('エラーが発生しました。' + error.message)
                return
            }

            // Supabase認証のユーザー情報を取得
            const user = data?.user;
            if (!user) {
                setMessage('ユーザー情報が取得できませんでした。');
                return;
            }

            // パスワード変更履歴　※あとで考える
            // const { error: dbError } = await supabase
            //     .from("tb_m_users")
            //     .update({
            //         password_last_updated: new Date().toISOString(),
            //     })
            //     .eq("id", user.id); // SupabaseのUUIDを元に更新

            // if (dbError) {
            //     setMessage('データベース更新時にエラーが発生しました: ' + dbError.message);
            //     return;
            // }

            setMessage('パスワードは正常に更新されました。')

        }catch (error) {
            setMessage('エラーが発生しました。' + error)
            return
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="max-w-[400px] mx-auto">
        <div className="text-center font-bold text-xl mb-10">パスワード変更</div>

        <form onSubmit={handleSubmit}>
            {/*新しいパスワード */}
            <div className="mb-5">
                <div className="text-sm mb-1 font-bold">新しいパスワード</div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                    placeholder="新しいパスワード"
                    required
                />
                {/* <div className="my-3 text-center text-sm text-red-500">{errors.password?.message}</div> */}
            </div>
            {/*確認用パスワード */}
            <div className="mb-5">
                <div className="text-sm mb-1 font-bold">確認用パスワード</div>
                <input
                    type="password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)} 
                    className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                    placeholder="確認用パスワード"
                    required
                />
                {/* <div className="my-3 text-center text-sm text-red-500">{errors.confirmation?.message}</div> */}
            </div>
            {/*変更ボタン */}
            <div className="mb-5">
                {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <button
                            type="submit"
                            className="font-bold bg-sky-500 hover:brightness-95 w-full rounded-full p-2 text-white text-sm"
                        >
                            変更
                        </button>
                )}
            </div>
            {/*メッセージ */}
            {message && <div className="my-5 text-center text-red-500 mb-5">{message}</div>}
        </form>
        <div className="text-center text-sm mb-5">
            <a href="/" className="text-gray-500 font-bold">
                ログインページへ
            </a>
        </div>
    </div>
  )
}

export default ResetPasswordConfirm