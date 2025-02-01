// import React from 'react'
import * as React from 'react';
import { useEffect,useState } from 'react';
//import { createClient } from "@supabase/supabase-js";
//supabaseAPI接続用
import { supabase } from './supabaseClient';

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
//新規作成モーダル
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
//新規作成モーダル　入力エリア
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
//リッチテキスト
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

//supabaseに接続
//const supabase = createClient("https://hdkascxbgeoewvkviajp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2FzY3hiZ2VvZXd2a3ZpYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDQzMzUsImV4cCI6MjA1MjYyMDMzNX0.WPiNdtG5aADOSg6OHtdmQLqTGWfhwmIVCetosM-2YSo");

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
    { id: 'content', label: '本文', minWidth: 280 },
    { id: 'name', label: '作成者', minWidth: 150, align: 'right' },
    { id: 'created_at', label: '作成日時', minWidth: 100, align: 'right' },
];

//一覧データ部分の型定義
interface Data {
    id: number;
    title: string;
    content: string;
    name: any;
    created_at: string | Date;
}

//新規作成モーダルレイアウト
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function Noticelist() {
    const [notices, setNotices] = useState<Data[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
        //console.log("Fetched data:", data);
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

    // お知らせ登録
    const handleRegister = async () => {
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
            handleClose()
        }
    }


    //一覧ページング
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const [open, setOpen] = React.useState(false);

    //モーダル表示切替
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <div className="bg-gray-50 flex items-center justify-between p-4">
                {/*検索エリア */}
                <div className="flex items-center gap-4">
                    <input
                    type="text"
                    placeholder="検索..."
                    className="border rounded px-2 py-1"
                    />
                </div>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={handleClickOpen}>新規作成</Button>
                </Stack>
                {/*新規作成モーダル */}
                <BootstrapDialog
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={open}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    お知らせ作成・編集
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        <Box
                                component="form"
                                sx={{ '& > :not(style)': { m: 1, width: '50ch' } }}
                                noValidate
                                autoComplete="off"
                            >
                            <Typography gutterBottom>
                                <TextField id="title" label="件名" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)}/>
                            </Typography>
                            <Typography gutterBottom>
                                {/* <TextField
                                    id="outlined-multiline-static"
                                    label="本文"
                                    multiline
                                    rows={4}
                                /> */}
                                <ReactQuill
                                    value={content}
                                    onChange={setContent}
                                    theme="snow"
                                />
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                    <Button autoFocus onClick={handleRegister}>
                        登録
                    </Button>
                    </DialogActions>
                </BootstrapDialog>
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