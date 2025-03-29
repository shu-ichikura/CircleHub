import React from 'react'
//リスト
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MovieIcon from '@mui/icons-material/Movie';

const Sidebar = () => {
  return (
    <div>
        <Box sx={{ width: '100%', maxWidth: 360 }}>
        <nav aria-label="main mailbox folders">
            <List>
            <ListItem disablePadding>
                <ListItemButton component="a" href="/Noticelist">
                <ListItemIcon>
                    <EmailIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="お知らせ一覧" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton component="a" href="/Userlist">
                <ListItemIcon>
                    <PersonIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="ユーザ一覧" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton component="a" href="/Movielist">
                <ListItemIcon>
                    <MovieIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="動画一覧" />
                </ListItemButton>
            </ListItem>
            </List>
        </nav>
        <Divider />
        </Box>
    </div>
  )
}

export default Sidebar