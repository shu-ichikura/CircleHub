// NoticeDetail.tsx
import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { supabase } from "../../lib/supabaseClient";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const NoticeDetail = ({ open, onClose, notice }) => {
  const [attachedFile, setAttachedFile] = useState(null);

  useEffect(() => {
    if (notice?.id) {
      // 添付ファイルデータを取得
      const fetchAttachedFile = async () => {
        const { data, error } = await supabase
          .from("tb_t_notice_file")
          .select("file_name, path")
          .eq("notice_id", notice.id)
          .single();

        if (error) {
          console.error("添付ファイルデータの取得に失敗しました:", error.message);
          return;
        }

        setAttachedFile(data);
      };

      fetchAttachedFile();
    }
  }, [notice]);

  const handleDownload = async () => {
    if (!attachedFile) return;

    try {
      const { data, error } = await supabase.storage
        .from("my_bucket") // バケット名を指定
        .download(attachedFile.path);

      if (error) {
        console.error("ファイルのダウンロードに失敗しました:", error.message);
        return;
      }

      // ファイルをダウンロード
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachedFile.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  if (!notice) return null;

  return (
    <BootstrapDialog onClose={onClose} open={open}>
      <DialogTitle>{notice.title}</DialogTitle>
      <DialogContent>
        <div dangerouslySetInnerHTML={{ __html: notice.content }} />
        {attachedFile && (
          <div style={{ marginTop: "16px" }}>
            <strong>添付ファイル:</strong>
            <Button onClick={handleDownload} color="primary">
              {attachedFile.file_name}
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">閉じる</Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default NoticeDetail;