import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const MovieModal = ({ open, onClose, videoUrl }: { open: boolean; onClose: () => void; videoUrl: string | null }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                {videoUrl ? (
                    <video controls width="100%">
                        <source src={videoUrl} type="video/mp4" />
                        お使いのブラウザは動画をサポートしていません。
                    </video>
                ) : (
                    <p>動画のURLが取得できませんでした。</p>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovieModal;