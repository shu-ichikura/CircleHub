import React, { useState, ChangeEvent, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress"; // ローディング表示用
import { v4 as uuidv4 } from "uuid"; // UUID生成用
import { getUserLoginId } from './hooks/getUserLoginId.ts';

//supabaseAPI接続用
import { supabase } from './hooks/supabaseClient';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

interface MovieUploadProps {
    open: boolean;
    onClose: () => void;
    movie?: any;
    onSuccess?: () => void;
}

const MovieUpload: React.FC<MovieUploadProps> = ({ open, onClose, movie, onSuccess })=> {
    const [file, setFile] = useState<File | null>(null);
    const [filePath, setFilePath] = useState(movie?.path || null);
    const [thumbnailPath, setThumbnailPath] = useState(movie?.thumbnail_path || null);
    const [movieTitle, setMovieTitle] = useState(movie?.movie_title || "");
    const [movieDescription, setMovieDescription] = useState(movie?.movie_description || "");
    const [sortNo, setSortNo] = useState(movie?.sort_no || 0);
    const [isLoading, setIsLoading] = useState(false); // ローディング状態
    const [isUploaded, setIsUploaded] = useState(!!movie?.path); // アップロード完了フラグ

    useEffect(() => {
        if (movie) {
            setMovieTitle(movie.movie_title);
            setMovieDescription(movie.movie_description);
            setSortNo(movie.sort_no);
            setFilePath(movie.path);
            setIsUploaded(!!movie.path);
        }
    }, [movie]);

    // 動画選択時の処理
    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const selectedFile = event.target.files[0];
        setFile(selectedFile); // 状態に保存
    };

    // 動画アップロード処理
    const handleUpload = async () => {
        if (!file) return alert("動画を選択してください");

        setIsLoading(true); // ローディング開始

        const userId = await getUserLoginId();
        if (!userId) {
            setIsLoading(false);
            return alert("ユーザが取得できませんでした");
        }

        const videoId = uuidv4();
        const uploadPath = `private/movie/${userId}/${videoId}/${file.name}`;

        const { error } = await supabase.storage.from("my_bucket").upload(uploadPath, file);
        

        if (error) {
        console.error("Upload error:", error);
        return alert("アップロードに失敗しました");
        }

        // サムネイル生成
        const thumbnailBlob = await generateThumbnail(file);
        if (!thumbnailBlob) {
            setIsLoading(false);
            return alert("サムネイルの生成に失敗しました");
        }

        const thumbnailPath = `private/movie/${userId}/${videoId}/thumbnail.png`;

        // サムネイルをSupabaseにアップロード
        const { error: thumbError } = await supabase.storage.from("my_bucket").upload(thumbnailPath, thumbnailBlob);

        setIsLoading(false); // ローディング終了

        if (thumbError) {
            console.error("Thumbnail upload error:", thumbError);
            setIsLoading(false);
            return alert("サムネイルのアップロードに失敗しました");
        }

        setFilePath(uploadPath);
        setThumbnailPath(thumbnailPath);
        setIsUploaded(true); // アップロード完了状態を更新
    };

    // DB登録処理
    const handleSubmit = async () => {
        if (!filePath) return alert("先に動画をアップロードしてください");

        const userId = await getUserLoginId();
        if (!userId) return alert("ユーザが取得できませんでした");

        if (movie) {
            // 既存データの更新
            const { error } = await supabase
                .from("tb_t_movies")
                .update({
                    movie_title: movieTitle,
                    movie_description: movieDescription,
                    sort_no: sortNo,
                })
                .eq("id", movie.id);

            if (error) {
                console.error("Update error:", error);
                return alert("更新に失敗しました");
            }
        } else {
            // 新規登録（既存処理）
            const videoId = uuidv4();
            const createdAt = new Date().toISOString();

            const { error } = await supabase.from("tb_t_movies").insert([
            {
                id: videoId,
                movie_title: movieTitle,
                movie_description: movieDescription,
                path: filePath,
                thumbnail_path: thumbnailPath,
                sort_no: sortNo,
                user_id: userId,
                created_at: createdAt,
            },
            ]);

            if (error) {
            console.error("Insert error:", error);
            return alert("登録に失敗しました");
            }
        }
        onClose(); // ダイアログを閉じる
        onSuccess?.();
    };

    //サムネイル生成処理
    const generateThumbnail = (videoFile: File): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(videoFile);
            video.crossOrigin = "anonymous"; // CORS対応
            video.currentTime = 2; // 2秒目のフレームを取得
            video.muted = true;
            video.play();
    
            video.onloadeddata = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 320;  // サムネイルサイズ
                canvas.height = 180; // 16:9比率
    
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(resolve, "image/png");
                } else {
                    resolve(null);
                }
            };
    
            video.onerror = () => resolve(null);
        });
    };

    return (
        <BootstrapDialog onClose={isLoading ? undefined : () => {}} open={open}>
            <DialogTitle>動画アップロード</DialogTitle>
            <DialogContent>
            {!isUploaded ? (
                <>
                    <input type="file" onChange={handleImageChange} disabled={isLoading} />
                    <Button onClick={handleUpload} color="primary" disabled={isLoading || !file}>
                    {isLoading ? <CircularProgress size={24} /> : "アップロード"}
                    </Button>
                </>
            ) : (
                <>
                    <TextField
                    label="動画タイトル"
                    fullWidth
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    margin="dense"
                    />
                    <TextField
                    label="説明"
                    fullWidth
                    value={movieDescription}
                    onChange={(e) => setMovieDescription(e.target.value)}
                    margin="dense"
                    />
                    <TextField
                    label="表示順"
                    type="number"
                    fullWidth
                    value={sortNo}
                    onChange={(e) => setSortNo(Number(e.target.value))}
                    margin="dense"
                    />
                </>
            )}
            </DialogContent>
            <DialogActions>
            {isUploaded && (
                <Button onClick={handleSubmit} color="primary" disabled={isLoading}>
                    登録
                </Button>
            )}
            <Button onClick={onClose} color="primary" disabled={isLoading}>
                キャンセル
            </Button>
            </DialogActions>
        </BootstrapDialog>
    )
}

export default MovieUpload