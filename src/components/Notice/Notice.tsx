import * as React from 'react';
import { useEffect,useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { supabase } from '../../lib/supabaseClient';
import NoticeDetail from './NoticeDetail';

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null); // 選択されたお知らせ
    const [detailOpen, setDetailOpen] = useState(false); // 詳細モーダルの状態

    useEffect(() => {
        getNotices();
    }, []);

    //お知らせ取得
    async function getNotices() {
        const { data, error }: any | null = await supabase
        .from("tb_t_notice")
        .select(`
            id, 
            title, 
            content, 
            created_at, 
            tb_m_users!inner(name)
        `)
        .order("created_at", { ascending: false }) // created_atを降順にソート
        .limit(3); // 最大3件取得
    
        if (error) {
            console.error("Error fetching notices:", error);
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
    
        setNotices(formattedData); // データを状態に保存
    }

    const handleRowClick = (notice) => {
        setSelectedNotice(notice); // 選択されたお知らせを設定
        setDetailOpen(true); // モーダルを開く
    };

    const handleCloseDetail = () => {
        setDetailOpen(false); // モーダルを閉じる
        setSelectedNotice(null); // 選択されたお知らせをリセット
    };

  return (
    <div>
        <List sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper' }}>
        {notices.map((notice) => (
            <React.Fragment key={notice.id}>
                <ListItem alignItems="flex-start" onClick={() => handleRowClick(notice)} sx={{ cursor: 'pointer' }}>
                        <ListItemAvatar>
                            <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={notice.title}
                            secondary={<React.Fragment>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: 'text.primary', display: 'block' ,marginBottom: '8px'}}
                                >
                                    {notice.name} 
                                </Typography>
                                <div
                                    dangerouslySetInnerHTML={{
                                    __html:
                                    notice.content.length > 40
                                        ? `${notice.content.slice(0, 40)}…`
                                        : notice.content,
                                    }}
                                />
                            </React.Fragment>} />
                </ListItem><Divider variant="inset" component="li" />
            </React.Fragment>
        ))}
        </List>

        {/* 詳細モーダル */}
        <NoticeDetail open={detailOpen} onClose={handleCloseDetail} notice={selectedNotice} />
    </div>
  )
}

export default Notice