import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MenuIcon from '@mui/icons-material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MovieIcon from '@mui/icons-material/Movie';
import { styled } from '@mui/material/styles';

const CustomDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiPaper-root": {
        position: "absolute",
        top: theme.spacing(8), // ヘッダーの下に配置
        left: theme.spacing(2), // 左端に配置
        margin: 0,
    },
}));

const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

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

    // メニューを開く
    const handleMenuOpen = () => {
        setMenuOpen(true);
    };

    // メニューを閉じる
    const handleMenuClose = () => {
        setMenuOpen(false);
    };

    return (
        <div className="sticky top-0 w-full bg-white shadow-md py-3 px-6 flex items-center justify-between z-10">
            <MenuIcon
                onClick={handleMenuOpen}
                className="cursor-pointer text-gray-500"
                fontSize="large"
            />
            <h1 className="text-gray-400 text-lg font-semibold">ダッシュボード</h1>
            <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 w-32 text-center rounded-full font-bold"
            >
                Logout
            </button>

            {/* メニューモーダル */}
            <CustomDialog open={menuOpen} onClose={handleMenuClose}>
                <DialogTitle>メニュー</DialogTitle>
                <DialogContent>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/Noticelist')}>
                                <ListItemIcon>
                                    <EmailIcon />
                                </ListItemIcon>
                                <ListItemText primary="お知らせ一覧" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/Userlist')}>
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary="ユーザ一覧" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate('/Movielist')}>
                                <ListItemIcon>
                                    <MovieIcon />
                                </ListItemIcon>
                                <ListItemText primary="動画一覧" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </DialogContent>
            </CustomDialog>
        </div>
    )
}

export default Header