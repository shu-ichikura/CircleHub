import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//supabaseAPI接続用
import { supabase } from './lib/supabaseClient';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // React Router のナビゲーション

    useEffect(() => {
        // ビューポートをリセット
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
            metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }, []);

    // ログイン処理
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); // エラーメッセージをリセット

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setErrorMessage('ログインに失敗しました: ' + error.message);
            return;
        }

        console.log('ログイン成功:', data);
        navigate('/'); 
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
                <div className="text-center font-bold text-2xl mb-6">ログイン</div>
                <form onSubmit={handleLogin}>
                    {/*メールアドレス */}
                    <div className="mb-4">
                        <input
                            type="email"
                            className="border rounded-md w-full py-2 px-3 text-base focus:outline-none focus:border-sky-500"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/*パスワード */}
                    <div className="mb-6">
                    <input
                            type="password"
                            className="border rounded-md w-full py-2 px-3 text-base focus:outline-none focus:border-sky-500"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>

                    {/*ログインボタン */}
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="font-bold bg-sky-500 hover:brightness-95 w-full rounded-full p-2 text-white text-sm"
                        >
                            ログイン
                        </button>
                    </div>
                </form>

                {errorMessage && <div className="my-5 text-center text-sm text-red-500">{errorMessage}</div>}

                <div className="text-center text-sm mb-5">
                    <a href="/ResetPassword" className="text-gray-500 font-bold">
                        パスワードを忘れた方はこちら
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Login