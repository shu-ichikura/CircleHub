import React from 'react'
import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // パスワード発行用メール
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // フォームのデフォルト送信を防ぐ
        setLoading(true)
        setMessage('')

        try {
            // パスワードリセットメールを送信
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/ResetPasswordConfirm`,
            })
            //エラーチェック
            if(error) {
                setMessage('エラーが発生しました。' + error.message)
                return
            }

            setMessage('パスワードリセットに必要なメールを送信しました。')
        }catch (error) {
            setMessage('エラーが発生しました。' + error)
            return
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="max-w-[400px] mx-auto">
            <div className="text-center font-bold text-xl mb-10">パスワードを忘れた場合</div>
            <form onSubmit={handleSubmit}>
                {/*メールアドレス */}
                <div className="mb-5">
                    <div className="text-sm mb-1 font-bold">メールアドレス</div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        className="border rounded-md w-full py-2 px-3 focus:outline-none focus:border-sky-500"
                        placeholder="メールアドレス"
                        id="email"
                        required
                    />
                    {/* <div className="my-3 text-center text-sm text-red-500">{errors.email?.message}</div> */}
                </div>
                {/*送信ボタン */}
                <div className="mb-5">
                {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <button
                            type="submit"
                            className="font-bold bg-sky-500 hover:brightness-95 w-full rounded-full p-2 text-white text-sm"
                        >
                            送信
                        </button>
                )}
                </div>
            </form>
            {message && <div className="my-5 text-center text-red-500 mb-5">{message}</div>}
        </div>
    )
}

export default ResetPassword