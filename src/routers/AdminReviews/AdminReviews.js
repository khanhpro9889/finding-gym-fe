import React, {useState, useEffect}from 'react';
import { Wrapper, LoadingDiv, Icon, Title, IconBtn, Body, Heading, WrapperDialog, BtnIcon, IconButtonWrap } from './styles';
import MiniLoadingSpinner from '../../components/MiniLoadingSpinner';
import { getReviewsByGym, deleteReview } from '../../api/reviewApi';
import DialogConfirmDelete from '../../components/DialogConfirmDelete';
import SnackBar from '../../components/SnackBar';
import { useHistory, useParams, Link } from 'react-router-dom';
import FixedLoadingSpinner from '../../components/FixedLoadingSpinner';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { parseDate } from '../../utils/date';
import { getOneGym } from '../../api/gymApi';
import { HOME_PATH } from '../../constants/Path';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getRepliesByReview, deleteReply } from '../../api/replyApi';
import MyButton from '../../components/MyButton';

const AdminApprove = () => {
    const [reviews, setReviews] = useState([]);
    const [gym, setGym] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialogConfirmDelete, setOpenDialogConfirmDelete] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [openSnackBarDeleteFail, setOpenSnackBarDeleteFail] = useState(false);
    const [openSnackBarChangeRole, setOpenSnackBarChangeRole] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const history = useHistory();
    const [totalReview, setTotalReview] = useState(0);
    const { id } = useParams();
    const [openDialog, setOpenDialog] = useState(false);
    const [replies, setReplies] = useState([]);

    useEffect(() => {  
        getReviewsByGymApi(id);
        const getOneGymApi = async () => {
            const res = await getOneGym(id);
            if (!res.gym.complete) {
                return history.push(HOME_PATH);
            }
            setGym(res.gym);
        }
        getOneGymApi();
         // eslint-disable-next-line
    }, [id])

    const getReviewsByGymApi = async () => {
        setLoading(true);
        const res = await getReviewsByGym(id);
        setLoading(false);
        setTotalReview(res.reviews.length);
        console.log(res.reviews);
        setReviews(res.reviews);
    }

    const handleDeleteReview = (id) => {
        setSelectedReview(id);
        setOpenDialogConfirmDelete(true);
    }

    const deleteReviewApi = async () => {
        setLoading1(true);
        await deleteReview(selectedReview);
        getReviewsByGymApi(id);
        setLoading1(false);
        setOpenSnackBar(true);
    }

    const handleCloseDialog = () => {
        setOpenDialogConfirmDelete(false);
    }

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackBar(false);
        setOpenSnackBarDeleteFail(false);
        setOpenSnackBarChangeRole(false);
    }

    const getRepliesApi = async (id) => {
        setLoading(true);
        const res = await getRepliesByReview(id);
        setReplies(res.replies);
        setLoading(false);
    }

    const deleteReplyApi = async (rid) => {
        setLoading1(true);
        const res = await deleteReply(rid);
        setLoading1(false);
        if (res) {}
        getReviewsByGymApi(id);
        const newReplies = replies.filter(item => item._id !== rid);
        setReplies(newReplies);
    }

    return (
        <>
        <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <WrapperDialog>
                <DialogTitle id="alert-dialog-title"><strong>Trả lời</strong></DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>STT</strong></TableCell>
                                    <TableCell align="center"><strong>Tên người đánh giá</strong></TableCell>
                                    <TableCell align="center"><strong>Nội dung đánh giá</strong></TableCell>
                                    <TableCell align="center"><strong>Ngày tạo</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {replies.map((item, index) => {
                                    return (
                                        <TableRow key={item._id}>
                                            <TableCell component="th" scope="row">
                                                <strong>{index + 1}</strong>
                                            </TableCell>
                                            <TableCell align="center"><strong><Link to={`/profile/${item.author._id}`}>{item.author.name}</Link></strong></TableCell>
                                            <TableCell align="center">{item.body}</TableCell>
                                            <TableCell align="center">{parseDate(item.createAt)}</TableCell>
                                            <TableCell align="center">
                                                <IconBtn onClick={() => deleteReplyApi(item._id)}>
                                                    <Icon icon={['fa', 'trash']} />
                                                </IconBtn>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <MyButton onClick={() => setOpenDialog(false)} text="Trở về" color="primary" />
                </DialogActions>
            </WrapperDialog>
        </Dialog>
        <SnackBar open={openSnackBar} message="Xóa thành công" handleClose={handleCloseSnackBar} type="success"/>
        <SnackBar open={openSnackBarDeleteFail} message="Có lỗi xảy ra" handleClose={handleCloseSnackBar} type="error"/>
        <SnackBar open={openSnackBarChangeRole} message="Cập nhật thành công" handleClose={handleCloseSnackBar} type="success"/>
        <DialogConfirmDelete 
            openDialog={openDialogConfirmDelete} 
            handleCloseDialog={handleCloseDialog}
            handleAgree={deleteReviewApi}
            handleDisagree={handleCloseDialog}
        />
        {loading1 && <FixedLoadingSpinner />}
        <Body>
            <Wrapper>
                <Heading>
                    <IconButtonWrap
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        onClick={() => history.goBack()}
                    >
                        <BtnIcon icon={['fas', 'chevron-left']} />
                    </IconButtonWrap>
                    <h1>Tất cả reviews của {gym && gym.title} ({totalReview})</h1>
                </Heading>
                {loading ? <LoadingDiv><MiniLoadingSpinner /></LoadingDiv> 
                    : <>
                        {reviews.length === 0 ? <Title>
                            <Icon icon={['fas', 'folder-open']}></Icon>
                            <div>Chưa có đánh giá nào</div>
                        </Title> : <>
                            <TableContainer component={Paper}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>STT</strong></TableCell>
                                            <TableCell align="center"><strong>Tên người đánh giá</strong></TableCell>
                                            <TableCell align="center"><strong>Nội dung đánh giá</strong></TableCell>
                                            <TableCell align="center"><strong>Số sao</strong></TableCell>
                                            <TableCell align="center"><strong>Số trả lời</strong></TableCell>
                                            <TableCell align="center"><strong>Ngày tạo</strong></TableCell>
                                            <TableCell align="center"><strong>Action</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reviews.map((item, index) => {
                                            return (
                                                <TableRow key={item._id}>
                                                    <TableCell component="th" scope="row">
                                                        <strong>{index + 1}</strong>
                                                    </TableCell>
                                                    <TableCell align="center"><strong><Link to={`/profile/${item.author._id}`}>{item.author.name}</Link></strong></TableCell>
                                                    <TableCell align="center">{item.body}</TableCell>
                                                    <TableCell align="center">{item.rating} sao</TableCell>
                                                    <TableCell align="center">
                                                        {item.replyQuantity > 0 ? <div
                                                        onClick={() => {
                                                            getRepliesApi(item._id);
                                                            setOpenDialog(true);
                                                        }}>
                                                            {item.replyQuantity} trả lời
                                                        </div> :
                                                        item.replyQuantity + ' trả lời'}
                                                    </TableCell>
                                                    <TableCell align="center">{parseDate(item.createAt)}</TableCell>
                                                    <TableCell align="center">
                                                        <IconBtn onClick={() => handleDeleteReview(item._id)}>
                                                           <Icon icon={['fa', 'trash']} />
                                                        </IconBtn>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer></>}
                    </>
                }
            </Wrapper>
        </Body>
        </>
    );
};

export default AdminApprove;