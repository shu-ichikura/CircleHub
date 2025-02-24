import React, { useState } from 'react';

//カード
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Movies = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* サムネイル画像（クリックでモーダル表示） */}
      {/* <img
        src="/thumbnail.png"
        alt="動画のサムネイル"
        className="w-full h-auto cursor-pointer"
        onClick={() => setIsOpen(true)}
      /> */}
      {/* タイトル */}
      {/* <div className="mt-2 text-lg font-bold">2023年おかあさんコーラス千葉県大会</div> */}

      {/* 投稿日時 */}
      {/* <div className="text-sm text-gray-400">2025/02/22 14:30</div> */}

    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title="2023年おかあさんコーラス千葉県大会"
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="194"
        image="/thumbnail.png"
        alt="Paella dish"
        onClick={() => setIsOpen(true)}
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the mussels,
          if you like.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>


      {/* モーダル（動画再生） */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setIsOpen(false)} // 背景クリックで閉じる
        >
          <div
            className="bg-white p-4 rounded-lg max-w-3xl w-full relative"
            onClick={(e) => e.stopPropagation()} // 内部クリックで閉じない
          >
            <video
                src="/chorus.mp4"
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
            />
            {/* 閉じるボタン */}
            <button
              className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Movies