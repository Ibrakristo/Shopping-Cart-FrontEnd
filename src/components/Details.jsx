import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useAddGameMutation, useGetItemQuery } from "../apiSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import ReactPlayer from "react-player";
import Link from '@mui/material/Link'
import Spinner from "./Spinner";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }} >
                    {children}
                </Box>
            )}
        </div>
    );
}


const VideoSlide = ({ url, isSelected }) => {
    return < ReactPlayer controls volume={0.2} width="100%" height={"fit-content"} url={url} playing={isSelected} />
};



export default function Details() {
    const user = useSelector((state) => { return state.user.token })

    let [media, setMedia] = useState(0)
    const customRenderItem = (item, props) => <item.type {...item.props} {...props} />;
    const Navigate = useNavigate();
    let params = useParams();
    let id = params.id;
    let {
        data: item,
        isLoading,
        isError,
        error
    } = useGetItemQuery(id);
    const [addToCart, { isErrorAdd, errorAdd }] = useAddGameMutation();

    if (isLoading) {
        return (
            <Spinner />
        )
    }
    if (isError) {
        return (
            <div style={{ margin: "auto", width: "fit-content", marginTop: "50px" }}>Sorry we Encountred A {error.status} of Status {error.originalStatus} with Content of "{error.data}"</div>
        )
    }
    if (!item) {
        <div>Not Found ...</div>

    }
    function handleChange(event, value) {
        setMedia(value);
    }

    const customRenderThumb = (children) =>
        children.map((item, index) => {
            const videoId = getVideoId(item.props.url);
            return <img src={getVideoThumb(videoId)} key={index}/>;
        });

    const getVideoThumb = (ids) => `https://cdn.akamai.steamstatic.com/steam/apps/${ids[0]}/movie.293x165.jpg?t=${ids[1]}`;
    const getVideoId = (url) => {
        let str = url.substr('http://cdn.akamai.steamstatic.com/steam/apps/'.length, url?.length)
        let id = str.substr(0, str.indexOf("/"));
        let t = str.substr(str.indexOf("t="), str?.length);
        return [id, t];
    }
    if (isErrorAdd) {
        return (
            <div style={{ margin: "auto", width: "fit-content", marginTop: "50px" }}>Sorry we Encountred A {errorAdd.status} of Status {errorAdd.originalStatus} with Content of "{errorAdd.data}"</div>
        )
    }
    return (
        <>
            <Container>
                <Box><Typography variant="h2" component={"h3"}>{item.name}</Typography></Box>
                <Grid container spacing={"20"} justifyContent={"center"}>
                    <Grid item xs={12} lg={6} alignItems={"center"}>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={media} onChange={handleChange} aria-label="Media">
                                <Tab label="ScreenShots" />
                                <Tab label="Movies" disabled={!item.movies.length ? true : false} />
                            </Tabs>
                        </Box>

                        <CustomTabPanel value={media} index={0}>
                            <Carousel interval={0}>
                                {item.screenshots.map((screenshot, index) => (<img key={screenshot} width="100%" src={screenshot} alt={`screenshot_${index}`} />))}
                            </Carousel>
                        </CustomTabPanel>
                        <CustomTabPanel value={media} index={1} >
                            <Carousel interval={0} renderItem={customRenderItem} renderThumbs={customRenderThumb}>
                                {item.movies.map((movie, index) => (<VideoSlide key={index} url={movie} />))}
                            </Carousel>
                        </CustomTabPanel>
                    </Grid>
                    <Grid item xs={12} lg={6} alignSelf={"center"}>
                        <Box><Typography variant="body1" component={"span"}>{item.desc}</Typography></Box>
                        <Stack direction="row" spacing={2} flexWrap={"wrap"} margin={1}>{item.genres.map(genre => (
                            <Chip key={genre} variant="outlined" label={genre} />
                        ))}</Stack >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="body1" component={"span"}>Score :</Typography>
                            <Rating name="score" value={item.score / 20} precision={0.1} readOnly />
                        </Box>
                        <Box><Typography variant="body1" component={"span"}>Developers : </Typography>
                            {item.developers.map(developer => (<Typography variant="subtitle1   " component={"span"} key={developer}>{developer} </Typography>))}</Box>
                        {item.publishers ? <Box><Typography variant="body1" component={"span"}> Publishers : </Typography>
                            {item.publishers.map(pub => (<Typography variant="subtitle1   " component={"span"} key={pub}>{pub}</Typography>))}</Box> : ""}
                        {item.releaseDate ? item.releaseDate.coming_soon === false ? <Box><Typography variant="body1" component={"span"}>Release Date : {(new Date(item.releaseDate.date)).toDateString()}</Typography></Box> : <Typography variant="h6" component={"h6"}>Coming soon</Typography> : ""}
                        <Box><Typography vairant="button" component={"span"}>Price : {"$" + item.original_price / 100}</Typography></Box>
                        <Box width={"fit-content"} marginX={"auto"} marginY={5}><Button onClick={async () => {
                            if (user) {
                                await addToCart(item.id || item._id);
                            } else {
                                Navigate("/login")
                            }
                        }}>Add to Cart</Button></Box>
                    </Grid>
                </Grid>
            </Container >



            <Box>
                {item.dlc ? item.dlc.map((dlc) => (<Grid container marginY={3} sx={{ ":hover": { transform: "translateY(-10px)", boxShadow: "10px 2px 5px black" } }} alignItems={"center"} key={dlc.id || dlc._id} data-key={dlc.id || dlc._id}>
                    <Grid item xs={10}>
                        <Link to={`/details/${dlc.id || dlc._id}`} component={RouterLink} underline="none" display={"inline-block"} width={0.9}>
                            <Box display={"flex"} width={"100%"} alignItems={"center"} gap={5}>
                                <img src={dlc.header_image} alt={`img for ${dlc.name}`} width={"30%"} style={{ flexShrink: 0 }} />
                                <Typography variant="body1" component={"span"}  >{dlc.name}</Typography>
                                <Typography variant="body1" component={"span"} marginLeft={"auto"}>{"$" + dlc.original_price / 100}</Typography>
                            </Box>
                        </Link>
                    </Grid>
                    <Grid item xs={2}>
                        <Box width={"fit-content"} margin={"auto"}><Button onClick={() => {
                            if (user) {
                                addToCart(dlc.id || dlc._id);
                            } else {
                                Navigate("/login")
                            }
                        }}>Add to Cart</Button></Box>
                    </Grid>
                </Grid>)) : ""}
            </Box >
        </>
    )
}
