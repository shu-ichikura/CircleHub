// import React from 'react'
import * as React from 'react';
import { useEffect,useState } from 'react';
import { useAuthRedirect } from './hooks/useAuthRedirect.ts'
import { getUserLoginId } from './hooks/getUserLoginId.ts';

//supabaseAPI接続用
import { supabase } from './lib/supabaseClient';

import BackToHome from './components/BackToHome';
import NewNoticeModal from "./components/Notice/NewNoticeModal";
import NoticeDetail from "./components/Notice/NoticeDetail";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import "react-quill/dist/quill.snow.css";
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';


//一覧見出しの型定義
interface Column {
    id: 'title' | 'content' | 'file' | 'name' | 'created_at'| 'actions';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

//一覧ラベル設定と幅
const columns: readonly Column[] = [
    { id: 'title', label: '件名', minWidth: 150 },
    { id: 'content', label: '本文', minWidth: 200 },
    { id: 'content', label: '添付ファイル', minWidth: 100 },
    { id: 'name', label: '作成者', minWidth: 150 },
    { id: 'created_at', label: '作成日時', minWidth: 100 },
    { id: 'actions', label: '編集', minWidth: 80 }
];

//一覧データ部分の型定義
interface Data {
    title: string;
    content: string;
    name: any;
    created_at: string | Date;
}

export default function Noticelist() {
    //ログイン認証
    const isLoading = useAuthRedirect();

    const [notices, setNotices] = useState<Data[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [open, setOpen] = React.useState(false);
    const [searchKeyword, setSearchKeyword] = useState(""); // 検索キーワード

    // **編集モードの管理**
    const [isEdit, setIsEdit] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Data | null>(null);

    //入力フォーム初期値
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [uploadfile, setUploadfile] = useState('')
    const [attachedFile, setAttachedFile] = useState<{ file_name: string; path: string } | null>(null);

    //詳細モーダル状態管理
    const [selectedNoticeRow, setSelectedNoticeRow] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    //初回ページ読み込み時にお知らせデータ取得
    useEffect(() => {
        getNotices();
    }, []);

    //お知らせデータ取得
    async function getNotices() {
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

        if (error) {
            console.error("Error fetching notices:", error);
            return;
        }

        // created_at を JST 形式の "yyyy-mm-dd hh:mm" に変換し、作成者を抽出
        const formattedData = data.map((notice) => ({
            ...notice,
            name: notice.tb_m_users?.name || "不明",
            created_at: new Date(notice.created_at).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Tokyo",
            }).replace(/\//g, '-'),
        }));

        setNotices(formattedData);
    }

    // ファイルアップロードとDB登録処理
    const handleFileUpload = async (file: File, noticeId: string) => {
        if (!file) return;

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
                return;
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
                return;
            }

            console.log("添付ファイルデータの登録成功");
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    };

    // 添付ファイルデータの取得
    const fetchAttachedFile = async (noticeId: string) => {
        const { data, error } = await supabase
            .from("tb_t_notice_file")
            .select("file_name, path")
            .eq("notice_id", noticeId)
            .single();

        if (error) {
            console.error("添付ファイルデータの取得に失敗しました:", error.message);
            return null;
        }

        return data;
    };

    // 添付ファイル削除処理
    const deleteAttachedFile = async (filePath: string, noticeId: string) => {
        try {
            // バケットからファイルを削除
            const { error: deleteError } = await supabase.storage
                .from("my_bucket")
                .remove([filePath]);

            if (deleteError) {
                console.error("バケットからのファイル削除に失敗しました:", deleteError.message);
                return;
            }

            console.log("バケットからのファイル削除成功:", filePath);

            // 添付ファイルテーブルからデータを削除
            const { error: dbDeleteError } = await supabase
                .from("tb_t_notice_file")
                .delete()
                .eq("notice_id", noticeId);

            if (dbDeleteError) {
                console.error("添付ファイルデータの削除に失敗しました:", dbDeleteError.message);
                return;
            }

            console.log("添付ファイルデータの削除成功");
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    };

    // お知らせ登録・更新
    const handleRegister = async () => {
        if (isEdit && selectedNotice?.id) {
            // 更新処理 (UPDATE)
            const { data, error } = await supabase
                .from("tb_t_notice")
                .update({
                    title: title,
                    content: content,
                    //updated_at: new Date().toISOString(), // 更新時刻
                })
                .eq("id", selectedNotice.id); // IDで更新

            if (error) {
                console.error("お知らせの更新に失敗しました:", error.message);
                return;
            }
            console.log("お知らせの更新成功");

            // 添付ファイルの処理
            if (attachedFile && uploadfile) {
                // ① 新たにファイル添付を行った場合
                await deleteAttachedFile(attachedFile.path, selectedNotice.id); // 既存ファイルを削除
                await handleFileUpload(uploadfile, selectedNotice.id); // 新しいファイルをアップロード
            } else if (attachedFile && !uploadfile) {
                // ② 新たにファイル添付を行わなかった場合
                await deleteAttachedFile(attachedFile.path, selectedNotice.id); // 既存ファイルを削除
            } else if (!attachedFile && uploadfile) {
                // 新規ファイルアップロード
                await handleFileUpload(uploadfile, selectedNotice.id);
            }
        } else {
            const userId = await getUserLoginId();
            // 新規登録処理 (INSERT)
            const { data, error } = await supabase.from('tb_t_notice').insert([
                {
                title: title,
                content: content,
                user_id: userId,
                created_at: new Date().toISOString() // 現在時刻
                }
            ])
            .select(); // 挿入されたデータを取得
    
            if (error) {
                console.error("お知らせの登録に失敗しました:", error.message);
                return;
            }

            console.log("お知らせの登録成功");

            // ファイルアップロード処理
            if (uploadfile && data && data.length > 0) {
                await handleFileUpload(uploadfile, data[0].id);
            }
        }
        // 登録成功後、フォームをクリア
        setTitle('')
        setContent('')
        setUploadfile(null);
        setAttachedFile(null);
        handleClose();
        getNotices(); //データを再取得
    }

    // お知らせ削除
    const handleDelete = async (id: number) => {
        if (!window.confirm("本当に削除しますか？")) return; // 確認ダイアログ

        try {
            const { error } = await supabase.from("tb_t_notice").delete().eq("id", id);

            if (error) {
                console.error("削除に失敗しました:", error.message);
                return;
            }

            console.log(`削除成功: ${id}`);
            setNotices((prevNotices) => prevNotices.filter((notice) => notice.id !== id)); // フロント側の状態更新
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    // 検索処理
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setNotices([]); // 一旦リストをクリア
            getNotices(); // 全件取得
            return;
        }
    
        const { data, error } = await supabase
            .from("tb_t_notice")
            .select(`
                id, 
                title, 
                content, 
                created_at, 
                tb_m_users!inner(name)
            `)
            .or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
    
        if (error) {
            console.error("検索エラー:", error);
            return;
        }
    
        const formattedData = data.map((notice) => ({
            ...notice,
            name: notice.tb_m_users?.name || "不明",
            created_at: new Date(notice.created_at).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Tokyo",
            }).replace(/\//g, '-'),
        }));
    
        setNotices(formattedData);
    };

    //一覧ページング
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    //モーダル表示切替
    const handleClickOpen = async (notice?: Data) => {
        if (notice) {
            setSelectedNotice(notice); // 編集時
            setTitle(notice.title);
            setContent(notice.content);
            setIsEdit(true);

            // 添付ファイルデータを取得
            const attachedFile = await fetchAttachedFile(notice.id);
            if (attachedFile) {
                setUploadfile(null); // 新規アップロードをリセット
                setAttachedFile(attachedFile); // 既存の添付ファイルデータを設定
            } else {
                setAttachedFile(null);
            }
        } else {
            setSelectedNotice(null); // 新規作成時
            setTitle("");
            setContent("");
            setIsEdit(false);
            setAttachedFile(null); // 添付ファイルデータをリセット
        }
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    //ログイン中でなければ、ログイン画面に飛ばす
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <div className="bg-gray-50 flex items-center justify-between p-4">
                <div>
                    <BackToHome/>
                </div>
                {/*検索エリア */}
                <div className="flex items-center gap-4">
                    <span>件名・本文</span>
                    <input
                        type="text"
                        placeholder="検索..."
                        className="border rounded px-2 py-1"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)} // 入力をstateに反映
                    />
                    <Button onClick={handleSearch}>
                        <SearchIcon sx={{ color: "blue" }} />
                    </Button>
                </div>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={handleClickOpen}>新規作成</Button>
                </Stack>
                {/*編集・登録モーダル */}
                <NewNoticeModal
                    open={open}
                    onClose={() => setOpen(false)}
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    setContent={setContent}
                    handleRegister={handleRegister}
                    setUploadfile={setUploadfile}
                    attachedFile={attachedFile}
                    setAttachedFile={setAttachedFile}
                />
                {/*詳細モーダル */}
                <NoticeDetail open={detailOpen} onClose={() => setDetailOpen(false)} notice={selectedNotice} />
            </div>
            {/*一覧表示エリア */}
            <div className='mt-10'>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth }}
                            >
                                {column.label}
                            </TableCell>
                            ))}
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {notices
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}
                                    onClick={(e) => {
                                        const target = e.target as HTMLElement | null;
                                        if (target && !target.closest('.MuiSvgIcon-root')) {
                                            setSelectedNotice(row);
                                            setDetailOpen(true);
                                        }
                                    }}
                                >
                                {columns.map((column) => {
                                    if (column.id === 'actions') {
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                <Stack direction="row" spacing={1}>
                                                    <SettingsIcon sx={{ color: "gray", cursor: "pointer" }} 
                                                    onClick={() => handleClickOpen(row)} />
                                                    <DeleteIcon sx={{ color: "gray", cursor: "pointer" }} 
                                                    onClick={() => handleDelete(row.id)} />
                                                </Stack>
                                            </TableCell>
                                        );
                                    } else {
                                        const value = row[column.id];
                                        return (
                                        <TableCell key={column.id} align={column.align}>
                                            {column.id === "content" ? (
                                                <div dangerouslySetInnerHTML={{ __html: row[column.id] }} />
                                            ) : column.id === "created_at" && typeof row[column.id] === "string" ? (
                                                new Date(row[column.id]).toLocaleString() // 日付フォーマット
                                            ) : (
                                                String(row[column.id])
                                            )}
                                        </TableCell>
                                        );
                                    }
                                })}
                                </TableRow>
                            );
                            })}
                        </TableBody>
                    </Table>
                    </TableContainer>
                    <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={notices.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
        </div>

    );
}