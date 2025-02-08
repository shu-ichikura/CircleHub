// import React from 'react'
import * as React from 'react';
import { useEffect,useState } from 'react';

//supabaseAPI接続用
import { supabase } from './supabaseClient';

import BackToHome from './BackToHome';
import NewUserModal from "./NewUserModal";

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
    id: 'id' | 'name' | 'email' | 'birthday' | 'group_id' | 'status';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

//一覧ラベル設定と幅
const columns: readonly Column[] = [
    { id: 'id', label: 'id', minWidth: 100 },
    { id: 'name', label: '名前', minWidth: 100 },
    { id: 'email', label: 'メールアドレス', minWidth: 150 },
    { id: 'birthday', label: '誕生日', minWidth: 150 },
    { id: 'group_id', label: 'グループ', minWidth: 100 },
    { id: 'status', label: 'ステータス', minWidth: 100 },
    { id: 'actions', label: '編集', minWidth: 80 }
];

//一覧データ部分の型定義
interface Data {
    id: number;
    name: string;
    email: string;
    birthday: string | Date;
    group_id: string;
    status: string;
}

const Userlist = () => {
    const [Users, setUsers] = useState<Data[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [open, setOpen] = React.useState(false);
    const [searchKeyword, setSearchKeyword] = useState(""); // 検索キーワード

    // **編集モードの管理**
    const [isEdit, setIsEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Data | null>(null);

    //入力フォーム初期値
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [birthday, setBirthday] = useState('')
    const [group_id, setGroupId] = useState('')
    const [status, setStatus] = useState('')
    const [password, setPassword] = useState('')

    //初回ページ読み込み時にユーザデータ取得
    useEffect(() => {
        getUsers();
    }, []);

    //ユーザデータ取得
    async function getUsers() {
        const { data, error } = await supabase
            .from("tb_m_users")
            .select(`
                id, 
                name, 
                email, 
                birthday, 
                group_id,
                status
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching Users:", error);
            return;
        }

        // created_at を JST 形式の "yyyy-mm-dd hh:mm" に変換し、作成者を抽出
        const formattedData = data.map((User) => ({
            ...User,
            birthday: new Date(User.birthday).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Tokyo",
            }).replace(/\//g, '-'),
        }));

        setUsers(formattedData);
    }

    // ユーザ登録・更新
    const handleRegister = async () => {
        if (isEdit && selectedUser?.id) {
            // 更新処理 (UPDATE)
            const { data, error } = await supabase
                .from("tb_m_users")
                .update({
                    name: name,
                    email: email,
                    birthday: birthday,
                    group_id: group_id,
                    status: status,
                    password: password,
                    //updated_at: new Date().toISOString(), // 更新時刻
                })
                .eq("id", selectedUser.id); // IDで更新

            if (error) {
                console.error("更新に失敗しました:", error.message);
            } else {
                console.log("更新成功:", data);
                handleClose(); // フォームを閉じる
                getUsers();// 更新後にデータを再取得
            }
        } else {
            // 新規登録処理 (INSERT)
            const { data, error } = await supabase.from('tb_m_users').insert([
                {
                name: name,
                email: email,
                birthday: birthday,
                group_id: group_id,
                status: status,
                password: password,
                created_at: new Date().toISOString() // 現在時刻
                }
            ])
    
            if (error) {
                console.error('登録に失敗しました:', error.message)
            } else {
                console.log('登録成功:', data)
                // 登録成功後、フォームをクリア
                setName('')
                setEmail('')
                setBirthday('')
                setGroupId('')
                setStatus('')
                setPassword('')
                handleClose();
                getUsers(); // 新規登録後にデータを再取得
            }
        }
    }

    // ユーザ削除
    const handleDelete = async (id: number) => {
        if (!window.confirm("本当に削除しますか？")) return; // 確認ダイアログ

        try {
            const { error } = await supabase.from("tb_m_users").delete().eq("id", id);

            if (error) {
                console.error("削除に失敗しました:", error.message);
                return;
            }

            console.log(`削除成功: ${id}`);
            setUsers((prevUsers) => prevUsers.filter((User) => User.id !== id)); // フロント側の状態更新
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    // 検索処理
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setUsers([]); // 一旦リストをクリア
            getUsers(); // 全件取得
            return;
        }
    
        const { data, error } = await supabase
            .from("tb_m_users")
            .select(`
                id, 
                name, 
                email, 
                birthday, 
                group_id, 
                status
            `)
            .or(`name.ilike.%${searchKeyword}%`);
    
        if (error) {
            console.error("検索エラー:", error);
            return;
        }
    
        const formattedData = data.map((User) => ({
            ...User,
            birthday: new Date(User.birthday).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Tokyo",
            }).replace(/\//g, '-'),
        }));
    
        setUsers(formattedData);
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
    const handleClickOpen = (User?: Data) => {
        if (User) {
            setSelectedUser(User); // 編集時
            setName(User.name);
            setEmail(User.email);
            setBirthday(User.birthday);
            setGroupId(User.group_id);
            setStatus(User.status);
            setPassword(User.password);
            setIsEdit(true);
        } else {
            setSelectedUser(null); // 新規作成時
                setName('')
                setEmail('')
                setBirthday('')
                setGroupId('')
                setStatus('')
                setPassword('')
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
            <NewUserModal
                open={open}
                onClose={() => setOpen(false)}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                birthday={birthday}
                setBirthday={setBirthday}
                group_id={group_id}
                setGroupId={setGroupId}
                status={status}
                setStatus={setStatus}
                password={password}
                setPassword={setPassword}
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
                    {Users
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
                                        {column.id === "birthday" && typeof row[column.id] === "string" ? (
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
                count={Users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    </div>
  )
}

export default Userlist