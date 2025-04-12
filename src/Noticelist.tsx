// import React from 'react'
import * as React from 'react';
import { useEffect,useState } from 'react';
import { useAuthRedirect } from './hooks/useAuthRedirect.ts'
import { getUserLoginId } from './hooks/getUserLoginId.ts';
import { fetchNotices, createNotice, updateNotice, uploadNoticeFile, fetchAttachedFile, deleteAttachedFile, deleteNotice, searchNotices } from './api/notice.ts';

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
    { id: 'name', label: '作成者', minWidth: 150 },
    { id: 'created_at', label: '作成日時', minWidth: 100 },
    { id: 'actions', label: '編集', minWidth: 80 }
];

//一覧データ部分の型定義
interface Data {
    id: number;
    title: string;
    content: string;
    name: string;
    created_at: string;
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
    const getNotices = async () => {
        try {
            const data = await fetchNotices();
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
        } catch (error) {
            // エラーをキャッチして alert() を表示
            if (error instanceof Error) {
                alert("エラーが発生しました");
                console.error("Error:", error.message);
            } else {
                alert("予期しないエラーが発生しました");
            }
        }
    }

    // お知らせ登録・更新
    const handleRegister = async () => {
        if (isEdit && selectedNotice?.id) {
            // 更新処理
            try {
                await updateNotice(selectedNotice.id, title, content);
            
                // 添付ファイルの処理
                if (attachedFile && uploadfile) {
                    // ① 既存の添付ファイルを削除して新たにファイル添付を行った場合
                    console.log("新しいファイルをアップロード:", uploadfile);
                    await deleteAttachedFile(attachedFile.path, selectedNotice.id); // 既存ファイルを削除
                    await uploadNoticeFile(uploadfile, selectedNotice.id); // 新しいファイルをアップロード
                } else if (attachedFile && !uploadfile && attachedFile.file_name === "") {
                    // ② 添付ファイルを削除して新しいファイルをアップロードしない場合
                    console.log("添付ファイルを削除:", attachedFile.path);
                    await deleteAttachedFile(attachedFile.path, selectedNotice.id); // 既存ファイルを削除
                } else if (!attachedFile && uploadfile) {
                    // ③ 新規ファイルアップロード
                    console.log("新規ファイルをアップロード:", uploadfile);
                    await uploadNoticeFile(uploadfile, selectedNotice.id);
                }
            } catch (error) {
                if (error instanceof Error) {
                    alert("お知らせの更新中にエラーが発生しました");
                    console.error("Error:", error.message);
                } else {
                    alert("予期しないエラーが発生しました");
                }
            }
        } else {
            // 新規登録処理
            try {
                const userId = await getUserLoginId();
                const data = await createNotice(title, content, userId);
            
                // ファイルアップロード処理
                if (uploadfile && data && data.length > 0) {
                    await uploadNoticeFile(uploadfile, data[0].id); // 添付ファイルをアップロード
                }
            } catch (error) {
                if (error instanceof Error) {
                    alert("お知らせの登録中にエラーが発生しました");
                    console.error("Error:", error.message);
                } else {
                    alert("予期しないエラーが発生しました");
                }
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

    // 添付ファイル選択時の処理
    const handleFileDelete = () => {
        setAttachedFile({ file_name: "", path: "" }); // 添付ファイルを削除状態に設定
        setUploadfile(null); // 新しいファイルのアップロードをリセット
    };

    // お知らせ削除
    const handleDelete = async (id: number) => {
        if (!window.confirm("本当に削除しますか？")) return; // 確認ダイアログ
    
        try {
            // Supabase API を呼び出して削除
            await deleteNotice(id);
    
            // フロント側の状態を更新
            setNotices((prevNotices) => prevNotices.filter((notice) => notice.id !== id));
        } catch (error) {
            if (error instanceof Error) {
                alert("削除中にエラーが発生しました");
                console.error("Error:", error.message);
            } else {
                alert("予期しないエラーが発生しました");
            }
        }
    };

    // 検索処理
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setNotices([]); // 一旦リストをクリア
            getNotices(); // 全件取得
            return;
        }
    
        try {
            // Supabase API を呼び出して検索
            const data = await searchNotices(searchKeyword);
    
            // データを整形して状態にセット
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
        } catch (error) {
            if (error instanceof Error) {
                alert("検索中にエラーが発生しました");
                console.error("Error:", error.message);
            } else {
                alert("予期しないエラーが発生しました");
            }
        }
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
            try {
                const attachedFile = await fetchAttachedFile(notice.id);
                setUploadfile(null); // 新規アップロードをリセット
                setAttachedFile(attachedFile); // 添付ファイルがない場合は null が設定される
            } catch (error) {
                if (error instanceof Error) {
                    console.error("添付ファイルデータの取得中にエラーが発生しました:", error.message);
                } else {
                    console.error("予期しないエラーが発生しました");
                }
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
                    handleFileDelete={handleFileDelete}
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