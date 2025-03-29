import React from 'react'
import { useEffect,useState } from 'react';
import { useAuthRedirect } from './hooks/useAuthRedirect.ts'
import { getUserLoginId } from './hooks/getUserLoginId.ts';

//supabaseAPI接続用
import { supabase } from './hooks/supabaseClient';

import BackToHome from './BackToHome';
import MovieUpload from './MovieUpload.tsx';
import MovieModal from "./MovieModal"; 

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
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import SlideshowIcon from '@mui/icons-material/Slideshow';

//一覧見出しの型定義
interface Column {
    id: 'movie_title' | 'movie_description' | 'sort_no' | 'preview' | 'user_name' | 'created_at';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

//一覧ラベル設定と幅
const columns: readonly Column[] = [
    { id: 'movie_title', label: '動画名', minWidth: 100 },
    { id: 'movie_description', label: '説明', minWidth: 150 },
    { id: 'sort_no', label: '表示順', minWidth: 25 },
    { id: 'preview', label: 'プレビュー', minWidth: 25 },
    { id: 'name', label: '作成者', minWidth: 150 },
    { id: 'created_at', label: '作成日時', minWidth: 100 },
    { id: 'actions', label: '編集', minWidth: 80 }
];

//一覧データ部分の型定義
interface Data {
    id: number;
    movie_title: string;
    movie_description: string;
    sort_no: number;
    user_name: string;
    created_at: string | Date;
}

const Movielist = () => {
    //ログイン認証
    const isLoading = useAuthRedirect();

    const [movies, setMovies] = useState<Data[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchKeyword, setSearchKeyword] = useState(""); // 検索キーワード

    // **編集モードの管理**
    const [editOpen, setEditOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Data | null>(null);

    //動画アップロードモーダル状態管理
    const [UploadOpen, setUploadOpen] = useState(false);

    //プレビューモーダル状態管理
    const [openMovieModal, setOpenMovieModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
                sort_no,
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

        setMovies(formattedData);
    }

    //動画削除
    const handleDelete = async (movieId: string) => {
        if (!confirm("本当に削除しますか？")) return;
    
        // DB から movieId の動画情報を取得（path を取得するため）
        const { data: movie, error: fetchError } = await supabase
            .from("tb_t_movies")
            .select("path, thumbnail_path, user_id")
            .eq("id", movieId)
            .single();
    
        if (fetchError || !movie) {
            console.error("データ取得エラー:", fetchError);
            alert("動画データの取得に失敗しました");
            return;
        }
    
        const { path, thumbnail_path, user_id } = movie;
    
        // 動画ファイルをバケットから削除
        const { error: deleteFileError } = await supabase.storage
            .from("my_bucket")
            .remove([path]);
    
        if (deleteFileError) {
            console.error("動画削除エラー:", deleteFileError);
            alert("動画ファイルの削除に失敗しました");
            return;
        }

        // サムネイルをバケットから削除
        const { error: deleteThumbnailThumbnailError } = await supabase.storage
            .from("my_bucket")
            .remove([thumbnail_path]);
    
        if (deleteThumbnailThumbnailError) {
            console.error("サムネイル削除エラー:", deleteThumbnailThumbnailError);
            alert("サムネイルの削除に失敗しました");
            return;
        }
    
        // フォルダが空か確認し、空なら削除
        const folderPath = `private/${user_id}/${movieId}/`;
        const { data: files, error: listError } = await supabase.storage
            .from("my_bucket")
            .list(folderPath);
    
        if (listError) {
            console.error("フォルダ確認エラー:", listError);
        } else if (files.length === 0) {
            // フォルダが空なら削除（Supabase では空フォルダ削除 API はないが、仕組み上、空フォルダは削除不要）
            console.log(`フォルダ ${folderPath} は空です。`);
        }
    
        // ④ DB からレコードを削除
        const { error: deleteDbError } = await supabase
            .from("tb_t_movies")
            .delete()
            .eq("id", movieId);
    
        if (deleteDbError) {
            console.error("DB削除エラー:", deleteDbError);
            alert("DBの削除に失敗しました");
            return;
        }
    
        alert("動画を削除しました");
        getMovie();
    };

    // 検索処理
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setMovies([]); // 一旦リストをクリア
            getMovie(); // 全件取得
            return;
        }
    
        const { data, error } = await supabase
            .from("tb_t_movies")
            .select(`
                id, 
                movie_title, 
                movie_description, 
                path,
                sort_no,
                created_at, 
                tb_m_users!inner(name)
            `)
            .or(`movie_title.ilike.%${searchKeyword}%`);
    
        if (error) {
            console.error("検索エラー:", error);
            return;
        }
    
        const formattedData = data.map((movie) => ({
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
        }));
    
        setMovies(formattedData);
    };

    const handleClickMovie = async (movieId: string) => {
        try {
            const { data, error } = await supabase
                .from("tb_t_movies")
                .select("path")
                .eq("id", movieId)
                .single(); // 1件取得
    
            if (error) {
                console.error("動画パス取得エラー:", error);
                alert("動画パスの取得に失敗しました");
                return;
            }
    
            if (!data?.path) {
                alert("動画のパスが見つかりませんでした");
                return;
            }
    
            // 署名付きURL（60分有効）を取得
            const { data: signedUrlData, error: signedUrlError } = await supabase
                .storage
                .from("my_bucket")
                .createSignedUrl(data.path, 60 * 60); // 60分間有効
    
            if (signedUrlError || !signedUrlData?.signedUrl) {
                alert("動画の署名付きURL取得に失敗しました");
                console.error("署名付きURLエラー:", signedUrlError);
                return;
            }
    
            setVideoUrl(signedUrlData.signedUrl); // 署名付きURLをセット
            setOpenMovieModal(true); // モーダルを開く
        } catch (err) {
            console.error("エラー:", err);
            alert("動画の取得中にエラーが発生しました");
        }
    };

    //一覧ページング
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // 編集用モーダルを開く
    const handleClickOpen = (row) => {
        setSelectedMovie(row);
        setEditOpen(true);
    };

    //ログイン中でなければ、ログイン画面に飛ばす
    if (isLoading) {
        return <div>Loading...</div>;
    }
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
                    <Button variant="contained"
                        onClick={(e) => {
                            setUploadOpen(true);
                        }}
                    >新規作成</Button>
                </Stack>
                {/*動画アップロードモーダル */}
                <MovieUpload open={UploadOpen} onClose={() => setUploadOpen(false)} onSuccess={getMovie} />
                {/*編集モーダル */}
                <MovieUpload
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    movie={selectedMovie} // 既存の動画情報を渡す
                    onSuccess={getMovie}
                />
                {/*プレビューモーダル */}
                <MovieModal open={openMovieModal} onClose={() => setOpenMovieModal(false)} videoUrl={videoUrl} />
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
                        {movies
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}
                                    onClick={(e) => {
                                        const target = e.target as HTMLElement | null;
                                        if (target && !target.closest('.MuiSvgIcon-root')) {
                                            setSelectedMovie(row);
                                            //setDetailOpen(true);
                                        }
                                    }}
                                >
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
                                    } else if (column.id === 'preview'){
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                <Stack direction="row" spacing={1}>
                                                    <SlideshowIcon
                                                        sx={{ color: "orange", cursor: "pointer" }}
                                                        onClick={() => handleClickMovie(row.id)}
                                                    />
                                                </Stack>
                                            </TableCell>
                                        );
                                    } 
                                    else {
                                        const value = row[column.id];
                                        return (
                                        <TableCell key={column.id} align={column.align}>
                                            {column.id === "created_at" && typeof row[column.id] === "string" ? (
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
                    count={movies.length}
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

export default Movielist