import React from 'react'
import { IconButton } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const BackToHome = () => {
    return (
    <IconButton component="a" href="/">
        <ArrowBackIosIcon sx={{ color: "gray" }} />
    </IconButton>
    )
}

export default BackToHome