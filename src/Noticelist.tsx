// import React from 'react'
import * as React from 'react';
import { useEffect,useState } from 'react';

//supabaseAPI接続用
import { supabase } from './supabaseClient';

import BackToHome from './BackToHome';
import NewNoticeModal from "./NewNoticeModal";

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
    id: 'id' | 'title' | 'content' | 'name' | 'created_at';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

//一覧ラベル設定と幅
const columns: readonly Column[] = [
    { id: 'id', label: 'id', minWidth: 100 },
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
    name: any;
    created_at: string | Date;
}

export default function Noticelist() {
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
                console.error("更新に失敗しました:", error.message);
            } else {
                console.log("更新成功:", data);
                handleClose(); // フォームを閉じる
                getNotices();// 更新後にデータを再取得
            }
        } else {
            // 新規登録処理 (INSERT)
            const { data, error } = await supabase.from('tb_t_notice').insert([
                {
                title: title,
                content: content,
                user_id: 1, // 仮のユーザーID
                created_at: new Date().toISOString() // 現在時刻
                }
            ])
    
            if (error) {
                console.error('登録に失敗しました:', error.message)
            } else {
                console.log('登録成功:', data)
                // 登録成功後、フォームをクリア
                setTitle('')
                setContent('')
                handleClose();
                getNotices(); // 新規登録後にデータを再取得
            }
        }
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
    const handleClickOpen = (notice?: Data) => {
        if (notice) {
            setSelectedNotice(notice); // 編集時
            setTitle(notice.title);
            setContent(notice.content);
            setIsEdit(true);
        } else {
            setSelectedNotice(null); // 新規作成時
            setTitle("");
            setContent("");
            setIsEdit(false);
        }
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <div className="bg-gray-50 flex items-center justify-between p-4">
                <div>
                    <BackToHome/>
                </div>
                {/*検索エリア */}
                <div className="flex items-center gap-4">
                    <span>キーワード</span>
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
                />
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
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
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