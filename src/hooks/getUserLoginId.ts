import React from 'react'
import { supabase } from '../lib/supabaseClient';

export const getUserLoginId = async () => {
        // セッションの取得
        const {
            data: { session },
            error: sessionError
        } = await supabase.auth.getSession();
    
        if (sessionError) {
            console.error("セッションの取得に失敗しました:", sessionError.message);
            return;
        }
    
        const userId = session?.user?.id; // セッションからユーザIDを取得
    
        if (!userId) {
            console.error("ユーザIDが取得できませんでした。");
            return;
        }
        return userId;
}
