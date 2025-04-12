import { supabase } from "../lib/supabaseClient";

//お知らせ取得
export async function fetchNotices() {
    const { data, error } = await supabase
        .from("tb_t_notice")
        .select(`
            id, 
            title, 
            content, 
            created_at, 
            tb_m_users!inner(name)
        `)
        .order("created_at", { ascending: false });

    // if (error) {
    //     console.error("お知らせの取得に失敗しました:", error.message);
    //     return [];
    // }
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// ファイルアップロードとDB登録処理
export async function uploadNoticeFile(file: File, noticeId: string) {
    const filePath = `private/notice/${noticeId}/${file.name}`;

    try {
        // ファイルを Supabase バケットにアップロード
        const { error: uploadError } = await supabase.storage
            .from("my_bucket")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("ファイルのアップロードに失敗しました:", uploadError.message);
            throw new Error("ファイルのアップロードに失敗しました");
        }

        console.log("ファイルアップロード成功:", filePath);

        // 添付ファイルテーブルにデータを登録
        const { error: insertError } = await supabase.from("tb_t_notice_file").insert([
            {
                notice_id: noticeId,
                path: filePath,
                file_name: file.name,
                created_at: new Date().toISOString(),
            },
        ]);

        if (insertError) {
            console.error("添付ファイルデータの登録に失敗しました:", insertError.message);
            throw new Error("添付ファイルデータの登録に失敗しました");
        }

        console.log("添付ファイルデータの登録成功");
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error; // 呼び出し元でエラーをキャッチ
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// お知らせ登録処理
export async function createNotice(title: string, content: string, userId: string) {
    try {
        const { data, error } = await supabase
            .from("tb_t_notice")
            .insert([
                {
                    title,
                    content,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            console.error("お知らせの登録に失敗しました:", error.message);
            throw new Error("お知らせの登録に失敗しました");
        }

        console.log("お知らせの登録成功");
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// お知らせ更新処理
export async function updateNotice(noticeId: string, title: string, content: string) {
    try {
        const { data, error } = await supabase
            .from("tb_t_notice")
            .update({
                title,
                content,
            })
            .eq("id", noticeId);

        if (error) {
            console.error("お知らせの更新に失敗しました:", error.message);
            throw new Error("お知らせの更新に失敗しました");
        }

        console.log("お知らせの更新成功");
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// 添付ファイルデータの取得
export async function fetchAttachedFile(noticeId: string) {
    try {
        const { data, error } = await supabase
            .from("tb_t_notice_file")
            .select("file_name, path")
            .eq("notice_id", noticeId)
            .single();

        if (error && error.code !== "PGRST116") { // PGRST116: レコードが見つからない場合
            console.error("添付ファイルデータの取得に失敗しました:", error.message);
            throw new Error("添付ファイルデータの取得に失敗しました");
        }

        console.log("添付ファイルデータの取得成功:", data);
        return data || null; // 添付ファイルがない場合は null を返す
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// 添付ファイル削除処理
export async function deleteAttachedFile(filePath: string, noticeId: string) {
    try {
        if (filePath) {
            // バケットからファイルを削除
            const { error: deleteError } = await supabase.storage
                .from("my_bucket")
                .remove([filePath]);

            if (deleteError) {
                console.error("バケットからのファイル削除に失敗しました:", deleteError.message);
                throw new Error("バケットからのファイル削除に失敗しました");
            }

            console.log("バケットからのファイル削除成功:", filePath);
        }

        // 添付ファイルテーブルからデータを削除
        const { error: dbDeleteError } = await supabase
            .from("tb_t_notice_file")
            .delete()
            .eq("notice_id", noticeId);

        if (dbDeleteError) {
            console.error("添付ファイルデータの削除に失敗しました:", dbDeleteError.message);
            throw new Error("添付ファイルデータの削除に失敗しました");
        }

        console.log("添付ファイルデータの削除成功");
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// お知らせ削除処理
export async function deleteNotice(noticeId: number) {
    try {
        // お知らせデータを削除
        const { error } = await supabase.from("tb_t_notice").delete().eq("id", noticeId);

        if (error) {
            console.error("お知らせの削除に失敗しました:", error.message);
            throw new Error("お知らせの削除に失敗しました");
        }

        console.log(`お知らせ削除成功: ${noticeId}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}

// お知らせ検索処理
export async function searchNotices(keyword: string) {
    try {
        const { data, error } = await supabase
            .from("tb_t_notice")
            .select(`
                id, 
                title, 
                content, 
                created_at, 
                tb_m_users!inner(name)
            `)
            .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);

        if (error) {
            console.error("お知らせの検索に失敗しました:", error.message);
            throw new Error("お知らせの検索に失敗しました");
        }

        console.log("お知らせ検索成功:", data);
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("エラーが発生しました:", error.message);
            throw error;
        } else {
            console.error("予期しないエラーが発生しました:", error);
            throw new Error("予期しないエラーが発生しました");
        }
    }
}