import * as React from 'react';
import { useEffect,useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://hdkascxbgeoewvkviajp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2FzY3hiZ2VvZXd2a3ZpYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDQzMzUsImV4cCI6MjA1MjYyMDMzNX0.WPiNdtG5aADOSg6OHtdmQLqTGWfhwmIVCetosM-2YSo");

const Notice = () => {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        getNotices();
      }, []);

      async function getNotices() {
        const { data, error }: any | null = await supabase
          .from("tb_t_notice")
          .select()
          .order("created_at", { ascending: false }) // created_atを降順にソート
          .limit(3); // 最大3件取得
      
        if (error) {
          console.error("Error fetching notices:", error);
          return;
        }
      
        setNotices(data); // データを状態に保存
      }
  return (
    <div>
        <List sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper' }}>
        {notices.map((notice) => (
            <>
                <ListItem alignItems="flex-start">
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
                                    ユーザ名をここに表示
                                </Typography>
                                {notice.content.length > 40
                                ? `${notice.content.slice(0, 40)}…`
                                : notice.content}
                            </React.Fragment>} />
                </ListItem><Divider variant="inset" component="li" />
            </>
        ))}
        </List>
    </div>
  )
}

export default Notice