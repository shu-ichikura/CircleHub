import React, { useState, useEffect } from 'react';

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
import MoreVertIcon from '@mui/icons-material/MoreVert';

//supabaseAPI接続用
import { supabase } from './hooks/supabaseClient';

interface Data {
  id: number;
  movie_title: string;
  movie_description: string;
  path: string;
  thumbnail_path: string;
  sort_no: number;
  user_name: string;
  created_at: string | Date;
  signedThumbnailUrl?: string;
  signedMovieUrl?: string;
}

const Movies = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [movies, setMovies] = useState<Data[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  //初回ページ読み込み時に動画データ取得
  useEffect(() => {
      getMovie();
  }, []);

    //動画データ取得
    async function getMovie() {
      const { data, error } = await supabase
          .from("tb_t_movies")
          .select(`
              id, 
              movie_title, 
              movie_description, 
              path,
              thumbnail_path,
              sort_no,
              created_at, 
              tb_m_users!inner(name)
          `)
          .order("created_at", { ascending: false })
          .limit(3);

      if (error) {
          console.error("Error fetching notices:", error);
          return;
      }

      // created_at を JST 形式の "yyyy-mm-dd hh:mm" に変換し、作成者を抽出
      const formattedData = await Promise.all(
        data.map(async (movie) => {

          // 動画の署名付きURLを取得
          let signedMovieUrl = "";
          if (movie.path) {
            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("my_bucket")
                .createSignedUrl(movie.path, 60 * 60); // 60分有効

            if (signedUrlError) {
              console.error("動画の署名付きURL取得エラー:", signedUrlError);
            } else {
              signedMovieUrl = signedUrlData?.signedUrl || "";
            }
          }

          // サムネイルの署名付きURLを取得
          let signedThumbnailUrl = "";
          if (movie.thumbnail_path) {
            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("my_bucket")
                .createSignedUrl(movie.thumbnail_path, 60 * 60); // 60分有効

            if (signedUrlError) {
              console.error("サムネイルの署名付きURL取得エラー:", signedUrlError);
            } else {
              signedThumbnailUrl = signedUrlData?.signedUrl || "";
            }
          }

          return {
            ...movie,
            name: movie.tb_m_users?.name || "不明",
            created_at: new Date(movie.created_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Tokyo",
            }).replace(/\//g, '-'),
            signedMovieUrl,
            signedThumbnailUrl,
          };
        })
      );
      setMovies(formattedData);
    }


  return (
    <div className="flex space-x-4">
      {movies.map((movie) => (
        <Card sx={{ maxWidth: 345 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                {movie.name}
              </Avatar>
            }
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
            title={movie.movie_title} 
            subheader={movie.created_at} 
          />
          <CardMedia
            component="img"
            height="194"
            image={movie.signedThumbnailUrl}
            alt={movie.movie_title}
            onClick={() => {
              setSelectedMovie(movie.signedMovieUrl || null);
              setIsOpen(true);
            }}
          />
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {movie.movie_description}
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
      ))}


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
                src={selectedMovie}
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