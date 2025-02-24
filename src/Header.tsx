import React from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from './hooks/supabaseClient';

const Header = () => {
    const navigate = useNavigate();

    // ログアウト処理
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('ログアウトに失敗しました:', error.message);
            return;
        }
        console.log('ログアウト成功');
        navigate('/login'); // /login にリダイレクト
    };

    return (
        <div className="sticky top-0 w-full bg-white shadow-md py-3 px-6 flex items-center justify-center z-10">
            <h1 className="text-gray-400 text-lg font-semibold">ダッシュボード</h1>
            <button 
                onClick={handleLogout} 
                className="absolute right-6 bg-black text-white px-4 py-2 w-32 text-center rounded-full font-bold"
            >
            Logout
            </button>
        </div>
    )
}

export default Header